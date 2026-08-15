import { sha256, sha256Text } from "./hash.ts";
import type {
  Address,
  Branch,
  DiffChange,
  Issue,
  IssueState,
  Lock,
  MergeRequest,
  MergeRequestState,
  NodeType,
  Repository,
  Revision,
  TreeNode,
} from "./types.ts";

const enc = new TextEncoder();

/** A stored content-addressed object. */
export interface StoredBlob {
  address: Address;
  size: number;
  binary: boolean;
  text?: string;
  bytes: Uint8Array;
}

/** One immediate child of a directory in a revision's tree. */
export interface TreeEntry extends TreeNode {
  /** Present for FILE entries: the resolved blob header. */
  blob?: StoredBlob;
}

export interface CommitEdit {
  path: string;
  content: string | Uint8Array;
  binary?: boolean;
}

export interface CommitInput {
  message: string;
  creator: string;
  edits?: CommitEdit[];
  deletes?: string[];
  /** Override commit time (Unix seconds); defaults to now. Used by seeding. */
  timestamp?: number;
  /** Forge-layer labels shown in history (e.g. "squash"). */
  tags?: string[];
}

export interface NewRepository {
  name: string;
  /** Forge namespace; defaults to "delphi". */
  owner?: string;
  description?: string;
  license?: string;
  creator: string;
  defaultBranchName?: string;
  files?: CommitEdit[];
  /** Override creation time (Unix seconds); defaults to now. Used by seeding. */
  created?: number;
  // Caller-pre-generated ids (proto: idempotent retries). Default to random.
  id?: string;
  defaultBranchId?: string;
}

export interface NewIssue {
  title: string;
  body?: string;
  author: string;
  state?: IssueState;
  /** Override creation time (Unix seconds); defaults to now. Used by seeding. */
  created?: number;
}

export interface NewMergeRequest {
  title: string;
  sourceBranch: string;
  targetBranch: string;
  author: string;
  state?: MergeRequestState;
  /** Override creation time (Unix seconds); defaults to now. Used by seeding. */
  created?: number;
}

export interface NewBranch {
  name: string;
  fromBranchId: string;
  category?: string;
  creator: string;
  // Caller-pre-generated id (proto: idempotent retries). Defaults to random.
  id?: string;
}

function randomId(bytes = 8): string {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  let hex = "";
  for (const b of a) hex += b.toString(16).padStart(2, "0");
  return hex;
}

/**
 * In-memory Lore VCS. Models the pieces a read-mostly forge UI needs:
 * a content-addressed store, repositories, branches, and a revision graph
 * where each revision carries a full path -> content-address snapshot.
 * Semantics follow the lore/**\/v1 protos; it is deliberately single-process
 * and non-persistent.
 */
export class LoreEngine {
  private readonly cas = new Map<string, StoredBlob>();
  private readonly repos = new Map<string, Repository>();
  private readonly branches = new Map<string, Map<string, Branch>>();
  private readonly revisions = new Map<string, Revision>();
  /** Full file snapshot per revision signature: path -> content address. */
  private readonly snapshots = new Map<string, Map<string, Address>>();
  /** Forge-layer issues per repository id (not part of the Lore VCS graph). */
  private readonly issuesByRepo = new Map<string, Issue[]>();
  /** Forge-layer merge requests per repository id. */
  private readonly mergeRequestsByRepo = new Map<string, MergeRequest[]>();
  /** Forge-layer exclusive file locks per repository id (lock.proto). */
  private readonly locksByRepo = new Map<string, Lock[]>();

  // --- content-addressed storage (StorageService / REST content routes) ---

  putContent(content: string | Uint8Array, binary = false): Address {
    let bytes: Uint8Array;
    let isBinary: boolean;
    let text: string | undefined;
    if (typeof content === "string") {
      bytes = enc.encode(content);
      isBinary = binary;
      text = binary ? undefined : content;
    } else {
      bytes = content;
      isBinary = true;
    }
    const hash = sha256(bytes);
    if (!this.cas.has(hash)) {
      this.cas.set(hash, { address: { hash }, size: bytes.length, binary: isBinary, text, bytes });
    }
    return { hash };
  }

  getContent(address: Address | string): StoredBlob | undefined {
    return this.cas.get(typeof address === "string" ? address : address.hash);
  }

  // --- repositories (RepositoryService) ---

  createRepository(input: NewRepository): Repository {
    const name = input.name.trim();
    if (!name) throw new Error("repository name required");
    if (this.findRepositoryByName(name)) {
      throw new Error(`repository "${name}" already exists`);
    }
    const id = input.id ?? randomId(16);
    const defaultBranchId = input.defaultBranchId ?? randomId(16);
    const defaultBranchName = input.defaultBranchName?.trim() || "main";
    const now = input.created ?? Math.floor(Date.now() / 1000);

    const repo: Repository = {
      id,
      name,
      owner: input.owner?.trim() || "delphi",
      description: input.description?.trim() ?? "",
      license: input.license?.trim() || undefined,
      defaultBranchId,
      defaultBranchName,
      creator: input.creator,
      created: now,
      metadata: sha256Text(`${id}:${name}`),
    };
    this.repos.set(id, repo);
    this.branches.set(id, new Map());

    // Root revision: empty (or seeded) tree with no parent.
    const snapshot = new Map<string, Address>();
    for (const edit of input.files ?? []) {
      snapshot.set(edit.path, this.putContent(edit.content, edit.binary));
    }
    const root = this.writeRevision({
      branchId: defaultBranchId,
      number: 1,
      message: input.files?.length ? "Initial import" : "Create repository",
      creator: input.creator,
      timestamp: now,
      snapshot,
    });

    const branch: Branch = {
      id: defaultBranchId,
      name: defaultBranchName,
      creator: input.creator,
      category: "",
      created: now,
      latest: root.signature,
      deleted: false,
      metadata: sha256Text(`${defaultBranchId}:${defaultBranchName}`),
      stack: [],
    };
    this.branches.get(id)!.set(defaultBranchId, branch);
    return repo;
  }

  listRepositories(): Repository[] {
    return [...this.repos.values()].sort((a, b) => b.created - a.created);
  }

  getRepository(idOrName: string): Repository | undefined {
    return this.repos.get(idOrName) ?? this.findRepositoryByName(idOrName);
  }

  private findRepositoryByName(name: string): Repository | undefined {
    for (const r of this.repos.values()) if (r.name === name) return r;
    return undefined;
  }

  // --- branches (RevisionService) ---

  listBranches(repoId: string): Branch[] {
    const map = this.branches.get(repoId);
    if (!map) return [];
    return [...map.values()]
      .filter((b) => !b.deleted)
      .sort((a, b) => a.created - b.created);
  }

  getBranch(repoId: string, idOrName: string): Branch | undefined {
    const map = this.branches.get(repoId);
    if (!map) return undefined;
    return map.get(idOrName) ?? [...map.values()].find((b) => !b.deleted && b.name === idOrName);
  }

  createBranch(repoId: string, input: NewBranch): Branch {
    const map = this.branches.get(repoId);
    if (!map) throw new Error("unknown repository");
    const name = input.name.trim();
    if (!name) throw new Error("branch name required");
    if (this.getBranch(repoId, name)) throw new Error(`branch "${name}" already exists`);
    const source = map.get(input.fromBranchId);
    if (!source) throw new Error("unknown source branch");

    const forkPoint = this.revisions.get(source.latest)!;
    const id = input.id ?? randomId(16);
    const now = Math.floor(Date.now() / 1000);
    const branch: Branch = {
      id,
      name,
      creator: input.creator,
      category: input.category?.trim() ?? "",
      created: now,
      latest: source.latest, // shares the fork-point tip until first commit
      deleted: false,
      metadata: sha256Text(`${id}:${name}`),
      stack: [
        { branchId: source.id, revisionSignature: forkPoint.signature },
        ...source.stack,
      ],
    };
    map.set(id, branch);
    return branch;
  }

  // --- revisions (RevisionService.RevisionList + ThinClientService) ---

  commit(repoId: string, branchId: string, input: CommitInput): Revision {
    const branch = this.branches.get(repoId)?.get(branchId);
    if (!branch) throw new Error("unknown branch");
    const tip = this.revisions.get(branch.latest);
    const snapshot = new Map(this.snapshots.get(branch.latest) ?? []);
    for (const edit of input.edits ?? []) {
      snapshot.set(edit.path, this.putContent(edit.content, edit.binary));
    }
    for (const path of input.deletes ?? []) snapshot.delete(path);

    const rev = this.writeRevision({
      branchId,
      number: (tip?.number ?? 0) + 1,
      message: input.message,
      creator: input.creator,
      timestamp: input.timestamp ?? Math.floor(Date.now() / 1000),
      snapshot,
      parent: tip
        ? { signature: tip.signature, branchId: tip.branchId, number: tip.number }
        : undefined,
      tags: input.tags,
    });
    branch.latest = rev.signature;
    return rev;
  }

  /** Merge source branch into target, creating a two-parent revision. */
  merge(repoId: string, targetBranchId: string, sourceBranchId: string, input: CommitInput): Revision {
    const branches = this.branches.get(repoId);
    const target = branches?.get(targetBranchId);
    const source = branches?.get(sourceBranchId);
    if (!target || !source) throw new Error("unknown branch");
    const targetTip = this.revisions.get(target.latest);
    const sourceTip = this.revisions.get(source.latest);
    if (!targetTip || !sourceTip) throw new Error("missing branch tip");
    const snapshot = new Map(this.snapshots.get(target.latest) ?? []);
    for (const [path, address] of this.snapshots.get(source.latest) ?? []) {
      snapshot.set(path, address); // source resolves conflicts (mock semantics)
    }
    const rev = this.writeRevision({
      branchId: targetBranchId,
      number: targetTip.number + 1,
      message: input.message,
      creator: input.creator,
      timestamp: input.timestamp ?? Math.floor(Date.now() / 1000),
      snapshot,
      parent: { signature: targetTip.signature, branchId: targetTip.branchId, number: targetTip.number },
      tags: ["merge"],
    });
    rev.parentOther = {
      signature: sourceTip.signature,
      branchId: sourceTip.branchId,
      number: sourceTip.number,
    };
    target.latest = rev.signature;
    return rev;
  }

  /** Re-apply a source revision's changes onto a target branch (single parent). */
  cherryPick(
    repoId: string,
    targetBranchId: string,
    sourceSignature: string,
    input: { creator: string; timestamp?: number; message?: string },
  ): Revision {
    const target = this.branches.get(repoId)?.get(targetBranchId);
    const source = this.revisions.get(sourceSignature);
    if (!target || !source) throw new Error("unknown branch or revision");
    const targetTip = this.revisions.get(target.latest);
    const sourceSnap = this.snapshots.get(sourceSignature) ?? new Map<string, Address>();
    const parentSnap = source.parentSelf
      ? this.snapshots.get(source.parentSelf.signature) ?? new Map<string, Address>()
      : new Map<string, Address>();
    const snapshot = new Map(this.snapshots.get(target.latest) ?? []);
    // Apply the source commit's own changes (paths that differ from its parent).
    for (const [path, address] of sourceSnap) {
      if (parentSnap.get(path)?.hash !== address.hash) snapshot.set(path, address);
    }
    for (const path of parentSnap.keys()) {
      if (!sourceSnap.has(path)) snapshot.delete(path);
    }
    const rev = this.writeRevision({
      branchId: targetBranchId,
      number: (targetTip?.number ?? 0) + 1,
      message: input.message ?? source.commitMessage.split("\n")[0],
      creator: input.creator,
      timestamp: input.timestamp ?? Math.floor(Date.now() / 1000),
      snapshot,
      parent: targetTip
        ? { signature: targetTip.signature, branchId: targetTip.branchId, number: targetTip.number }
        : undefined,
      tags: ["cherry-pick"],
    });
    target.latest = rev.signature;
    return rev;
  }

  private writeRevision(args: {
    branchId: string;
    number: number;
    message: string;
    creator: string;
    timestamp: number;
    snapshot: Map<string, Address>;
    parent?: Revision["parentSelf"];
    tags?: string[];
  }): Revision {
    const entries = [...args.snapshot.entries()].sort(([a], [b]) => a.localeCompare(b));
    const body = [
      args.branchId,
      args.parent?.signature ?? "",
      String(args.number),
      String(args.timestamp),
      args.message,
      ...entries.map(([p, a]) => `${p}:${a.hash}`),
    ].join("\n");
    const signature = sha256Text(body);
    const rev: Revision = {
      signature,
      branchId: args.branchId,
      number: args.number,
      commitMessage: args.message,
      timestamp: args.timestamp,
      createdBy: args.creator,
      committedBy: args.creator,
      metadata: [],
      parentSelf: args.parent,
      tags: args.tags && args.tags.length > 0 ? args.tags : undefined,
    };
    this.revisions.set(signature, rev);
    this.snapshots.set(signature, args.snapshot);
    return rev;
  }

  getRevision(signature: string): Revision | undefined {
    return this.revisions.get(signature);
  }

  /** Branch history, newest first, walking parent_self across fork points. */
  listRevisions(repoId: string, branchIdOrName: string, limit = 100): Revision[] {
    const branch = this.getBranch(repoId, branchIdOrName);
    if (!branch) return [];
    const out: Revision[] = [];
    let cursor = this.revisions.get(branch.latest);
    while (cursor && out.length < limit) {
      out.push(cursor);
      cursor = cursor.parentSelf ? this.revisions.get(cursor.parentSelf.signature) : undefined;
    }
    return out;
  }

  /** Resolve a ref (branch name/id or full signature) to a revision. */
  resolveRevision(repoId: string, ref: string): Revision | undefined {
    const branch = this.getBranch(repoId, ref);
    if (branch) return this.revisions.get(branch.latest);
    return this.revisions.get(ref);
  }

  // --- tree + content (ThinClientService.RevisionTree / ContentDiff) ---

  /** Immediate children of `dirPath` at a revision, directories first. */
  revisionTree(signature: string, dirPath = ""): TreeEntry[] {
    const snapshot = this.snapshots.get(signature);
    if (!snapshot) return [];
    const prefix = dirPath ? (dirPath.endsWith("/") ? dirPath : `${dirPath}/`) : "";
    const dirs = new Set<string>();
    const files: TreeEntry[] = [];
    for (const [path, address] of snapshot) {
      if (prefix && !path.startsWith(prefix)) continue;
      const rest = path.slice(prefix.length);
      const slash = rest.indexOf("/");
      if (slash === -1) {
        files.push({
          path,
          nodeType: "file",
          address,
          blob: this.cas.get(address.hash),
        });
      } else {
        dirs.add(rest.slice(0, slash));
      }
    }
    const dirNodes: TreeEntry[] = [...dirs].sort().map((name) => ({
      path: `${prefix}${name}`,
      nodeType: "directory" as NodeType,
    }));
    files.sort((a, b) => a.path.localeCompare(b.path));
    return [...dirNodes, ...files];
  }

  fileAt(signature: string, path: string): Address | undefined {
    return this.snapshots.get(signature)?.get(path);
  }

  readFile(signature: string, path: string): StoredBlob | undefined {
    const address = this.fileAt(signature, path);
    return address ? this.cas.get(address.hash) : undefined;
  }

  /** Per-path changes between two revisions (RevisionDiff, 2-way). */
  diff(fromSignature: string, toSignature: string): DiffChange[] {
    const from = this.snapshots.get(fromSignature) ?? new Map<string, Address>();
    const to = this.snapshots.get(toSignature) ?? new Map<string, Address>();
    const paths = new Set<string>([...from.keys(), ...to.keys()]);
    const changes: DiffChange[] = [];
    for (const path of [...paths].sort()) {
      const a = from.get(path);
      const b = to.get(path);
      if (a && b) {
        if (a.hash !== b.hash) {
          changes.push({ path, action: "modify", nodeType: "file", contentFrom: a, contentTo: b });
        }
      } else if (b) {
        changes.push({ path, action: "add", nodeType: "file", contentTo: b });
      } else if (a) {
        changes.push({ path, action: "delete", nodeType: "file", contentFrom: a });
      }
    }
    return changes;
  }

  /** Contribution counts keyed by ISO date, across all branches of a repo. */
  contributions(repoId: string): Map<string, number> {
    const counts = new Map<string, number>();
    const seen = new Set<string>();
    for (const branch of this.listBranches(repoId)) {
      let cursor = this.revisions.get(branch.latest);
      while (cursor && !seen.has(cursor.signature)) {
        seen.add(cursor.signature);
        const day = new Date(cursor.timestamp * 1000).toISOString().slice(0, 10);
        counts.set(day, (counts.get(day) ?? 0) + 1);
        cursor = cursor.parentSelf ? this.revisions.get(cursor.parentSelf.signature) : undefined;
      }
    }
    return counts;
  }

  /** All file paths present in a revision snapshot. */
  listAllFiles(signature: string): string[] {
    return [...(this.snapshots.get(signature)?.keys() ?? [])];
  }

  /** Distinct commit authors across all branches, most commits first. */
  contributors(repoId: string): { name: string; commits: number }[] {
    const counts = new Map<string, number>();
    const seen = new Set<string>();
    for (const branch of this.listBranches(repoId)) {
      let cursor = this.revisions.get(branch.latest);
      while (cursor && !seen.has(cursor.signature)) {
        seen.add(cursor.signature);
        counts.set(cursor.committedBy, (counts.get(cursor.committedBy) ?? 0) + 1);
        cursor = cursor.parentSelf ? this.revisions.get(cursor.parentSelf.signature) : undefined;
      }
    }
    return [...counts.entries()]
      .map(([name, commits]) => ({ name, commits }))
      .sort((a, b) => b.commits - a.commits);
  }

  // --- issues (forge-layer metadata, not part of the Lore VCS protos) ---

  createIssue(repoId: string, input: NewIssue): Issue {
    if (!this.repos.has(repoId)) throw new Error("unknown repository");
    const list = this.issuesByRepo.get(repoId) ?? [];
    const now = input.created ?? Math.floor(Date.now() / 1000);
    const issue: Issue = {
      id: randomId(12),
      repoId,
      number: list.length + 1,
      title: input.title.trim(),
      body: input.body?.trim() ?? "",
      state: input.state ?? "open",
      author: input.author,
      created: now,
      updated: now,
    };
    list.push(issue);
    this.issuesByRepo.set(repoId, list);
    return issue;
  }

  listIssues(repoId: string, state?: IssueState): Issue[] {
    const list = this.issuesByRepo.get(repoId) ?? [];
    const filtered = state ? list.filter((i) => i.state === state) : list;
    return [...filtered].sort((a, b) => b.created - a.created);
  }

  getIssue(repoId: string, number: number): Issue | undefined {
    return this.issuesByRepo.get(repoId)?.find((i) => i.number === number);
  }

  issueCount(repoId: string, state?: IssueState): number {
    const list = this.issuesByRepo.get(repoId) ?? [];
    return state ? list.filter((i) => i.state === state).length : list.length;
  }

  /** Recent issues across all repositories, newest first (front-page feed). */
  recentIssues(limit = 10, state?: IssueState): Issue[] {
    const all: Issue[] = [];
    for (const list of this.issuesByRepo.values()) {
      for (const issue of list) {
        if (!state || issue.state === state) all.push(issue);
      }
    }
    all.sort((a, b) => b.created - a.created);
    return all.slice(0, limit);
  }

  // --- merge requests (forge-layer, not part of the Lore VCS protos) ---

  createMergeRequest(repoId: string, input: NewMergeRequest): MergeRequest {
    if (!this.repos.has(repoId)) throw new Error("unknown repository");
    const list = this.mergeRequestsByRepo.get(repoId) ?? [];
    const mr: MergeRequest = {
      id: randomId(12),
      repoId,
      number: list.length + 1,
      title: input.title.trim(),
      sourceBranch: input.sourceBranch,
      targetBranch: input.targetBranch,
      state: input.state ?? "open",
      author: input.author,
      created: input.created ?? Math.floor(Date.now() / 1000),
    };
    list.push(mr);
    this.mergeRequestsByRepo.set(repoId, list);
    return mr;
  }

  listMergeRequests(repoId: string, state?: MergeRequestState): MergeRequest[] {
    const list = this.mergeRequestsByRepo.get(repoId) ?? [];
    const filtered = state ? list.filter((m) => m.state === state) : list;
    return [...filtered].sort((a, b) => b.created - a.created);
  }

  mergeRequestCount(repoId: string, state?: MergeRequestState): number {
    const list = this.mergeRequestsByRepo.get(repoId) ?? [];
    return state ? list.filter((m) => m.state === state).length : list.length;
  }

  // --- file locks (lock.proto LockService; forge-layer state) ---

  lock(repoId: string, path: string, owner: string, created?: number): Lock {
    if (!this.repos.has(repoId)) throw new Error("unknown repository");
    const list = this.locksByRepo.get(repoId) ?? [];
    const existing = list.find((l) => l.path === path);
    if (existing) return existing; // already locked; Lore locks are exclusive
    const lock: Lock = { repoId, path, owner, created: created ?? Math.floor(Date.now() / 1000) };
    list.push(lock);
    this.locksByRepo.set(repoId, list);
    return lock;
  }

  unlock(repoId: string, path: string): void {
    const list = this.locksByRepo.get(repoId);
    if (list) this.locksByRepo.set(repoId, list.filter((l) => l.path !== path));
  }

  getLock(repoId: string, path: string): Lock | undefined {
    return this.locksByRepo.get(repoId)?.find((l) => l.path === path);
  }

  listLocks(repoId: string): Lock[] {
    return [...(this.locksByRepo.get(repoId) ?? [])];
  }
}
