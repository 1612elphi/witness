import { lore, LoreEngine, shortHash } from "../lore/index.ts";
import type {
  Branch,
  CommitEdit,
  DiffChange,
  Issue,
  IssueState,
  MergeRequest,
  MergeRequestState,
  NewBranch,
  NewIssue,
  NewRepository,
  Repository,
  Revision,
  TreeNode,
} from "../lore/index.ts";
import type {
  CommitFileInput,
  CommitNode,
  ContributionDay,
  Contributor,
  CreateBranchInput,
  CreateIssueInput,
  CreateRepositoryInput,
  FileView,
  ForgeClient,
  IssueView,
  MergeRequestView,
  TreeEntryView,
} from "./types.ts";

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

const LANGUAGE_BY_EXT: Record<string, string> = {
  ts: "TypeScript",
  tsx: "TypeScript",
  js: "JavaScript",
  jsx: "JavaScript",
  mjs: "JavaScript",
  rs: "Rust",
  py: "Python",
  go: "Go",
  c: "C",
  h: "C",
  css: "CSS",
  html: "HTML",
  md: "Markdown",
  json: "JSON",
  svg: "SVG",
  rb: "Ruby",
  sh: "Shell",
  s: "Assembly",
};

/** Relative time from a Unix-seconds timestamp, e.g. "3 days ago". */
function relativeTime(timestamp: number, now = Math.floor(Date.now() / 1000)): string {
  const delta = Math.max(0, now - timestamp);
  if (delta < MINUTE) return unit(delta, "second");
  if (delta < HOUR) return unit(Math.floor(delta / MINUTE), "minute");
  if (delta < DAY) return unit(Math.floor(delta / HOUR), "hour");
  if (delta < WEEK) return unit(Math.floor(delta / DAY), "day");
  if (delta < MONTH) return unit(Math.floor(delta / WEEK), "week");
  if (delta < YEAR) return unit(Math.floor(delta / MONTH), "month");
  return unit(Math.floor(delta / YEAR), "year");
}

function unit(value: number, name: string): string {
  return `${value} ${name}${value === 1 ? "" : "s"} ago`;
}

/** In-browser ForgeClient backed by a LoreEngine. */
export class InMemoryForgeClient implements ForgeClient {
  private readonly engine: LoreEngine;

  constructor(engine: LoreEngine = lore) {
    this.engine = engine;
  }

  async listRepositories(): Promise<Repository[]> {
    return this.engine.listRepositories();
  }

  async getRepository(name: string): Promise<Repository | null> {
    return this.engine.getRepository(name) ?? null;
  }

  async listBranches(repoId: string): Promise<Branch[]> {
    return this.engine.listBranches(repoId);
  }

  async getBranch(repoId: string, ref: string): Promise<Branch | null> {
    return this.engine.getBranch(repoId, ref) ?? null;
  }

  async listRevisions(repoId: string, ref: string, limit?: number): Promise<Revision[]> {
    return this.engine.listRevisions(repoId, ref, limit);
  }

  async getRevision(_repoId: string, signature: string): Promise<Revision | null> {
    return this.engine.getRevision(signature) ?? null;
  }

  async commitGraph(repoId: string): Promise<CommitNode[]> {
    const revisions = new Map<string, Revision>();
    const tips = new Map<string, string>();
    for (const branch of this.engine.listBranches(repoId)) {
      tips.set(branch.latest, branch.name);
      for (const rev of this.engine.listRevisions(repoId, branch.id, 1000)) {
        revisions.set(rev.signature, rev);
      }
    }
    const nodes: CommitNode[] = [...revisions.values()].map((rev) => {
      const parents = [rev.parentSelf?.signature, rev.parentOther?.signature].filter(
        (p): p is string => Boolean(p),
      );
      return {
        hash: rev.signature,
        shortHash: shortHash(rev.signature),
        message: rev.commitMessage,
        author: rev.committedBy,
        date: relativeTime(rev.timestamp),
        parents,
        branch: tips.get(rev.signature),
        tags: rev.tags,
      };
    });
    nodes.sort((a, b) => revisions.get(b.hash)!.timestamp - revisions.get(a.hash)!.timestamp);
    return nodes;
  }

  async revisionTree(repoId: string, ref: string, path?: string): Promise<TreeNode[]> {
    const rev = this.engine.resolveRevision(repoId, ref);
    if (!rev) return [];
    return this.engine.revisionTree(rev.signature, path).map((e) => ({
      path: e.path,
      nodeType: e.nodeType,
      address: e.address,
    }));
  }

  async treeEntries(repoId: string, ref: string, path?: string): Promise<TreeEntryView[]> {
    const head = this.engine.resolveRevision(repoId, ref);
    if (!head) return [];
    const entries = this.engine.revisionTree(head.signature, path);
    const history = this.engine.listRevisions(repoId, ref, 500);
    // Changed-path set per revision (vs its self-parent; root = every file added).
    const changedByRev = history.map((rev) => {
      const parent = rev.parentSelf?.signature;
      const changed = parent
        ? this.engine.diff(parent, rev.signature).map((c) => c.path)
        : this.engine.listAllFiles(rev.signature);
      return { rev, changed };
    });
    const oldest = history[history.length - 1];
    const locks = this.engine.listLocks(repoId);
    return entries.map((e) => {
      const prefix = e.nodeType === "directory" ? `${e.path}/` : e.path;
      const touched = changedByRev.find(({ changed }) =>
        e.nodeType === "directory"
          ? changed.some((p) => p.startsWith(prefix))
          : changed.includes(prefix)
      );
      const last = touched?.rev ?? oldest;
      return {
        path: e.path,
        name: e.path.split("/").pop() ?? e.path,
        nodeType: e.nodeType,
        lastMessage: last ? last.commitMessage.split("\n")[0] : "",
        lastRelative: last ? relativeTime(last.timestamp) : "",
        lastAuthor: last?.committedBy ?? "",
        lockedBy: e.nodeType === "file" ? locks.find((l) => l.path === e.path)?.owner : undefined,
        locked: e.nodeType === "directory"
          ? locks.some((l) => l.path.startsWith(prefix))
          : locks.some((l) => l.path === e.path),
      };
    });
  }

  async contributors(repoId: string): Promise<Contributor[]> {
    const repo = this.engine.getRepository(repoId);
    return this.engine.contributors(repoId).map((c) => ({
      name: c.name,
      commits: c.commits,
      isOwner: c.name === repo?.creator,
    }));
  }

  async primaryLanguage(repoId: string, ref: string): Promise<string | null> {
    const head = this.engine.resolveRevision(repoId, ref);
    if (!head) return null;
    const counts: Record<string, number> = {};
    for (const file of this.engine.listAllFiles(head.signature)) {
      const ext = file.slice(file.lastIndexOf(".") + 1).toLowerCase();
      const lang = LANGUAGE_BY_EXT[ext];
      if (lang) counts[lang] = (counts[lang] ?? 0) + 1;
    }
    let best: string | null = null;
    let max = 0;
    for (const [lang, n] of Object.entries(counts)) {
      if (n > max) {
        max = n;
        best = lang;
      }
    }
    return best;
  }

  async commitCount(repoId: string, ref: string): Promise<number> {
    return this.engine.listRevisions(repoId, ref, 100_000).length;
  }

  async readFile(repoId: string, ref: string, path: string): Promise<FileView | null> {
    const rev = this.engine.resolveRevision(repoId, ref);
    if (!rev) return null;
    const blob = this.engine.readFile(rev.signature, path);
    if (!blob) return null;
    return {
      path,
      address: blob.address.hash,
      size: blob.size,
      binary: blob.binary,
      text: blob.binary ? undefined : blob.text,
    };
  }

  async readBytes(repoId: string, ref: string, path: string): Promise<Uint8Array | null> {
    const rev = this.engine.resolveRevision(repoId, ref);
    if (!rev) return null;
    return this.engine.readFile(rev.signature, path)?.bytes ?? null;
  }

  async diff(repoId: string, fromRef: string, toRef: string): Promise<DiffChange[]> {
    const from = this.engine.resolveRevision(repoId, fromRef);
    const to = this.engine.resolveRevision(repoId, toRef);
    if (!from || !to) return [];
    return this.engine.diff(from.signature, to.signature);
  }

  async getLock(repoId: string, path: string): Promise<string | null> {
    return this.engine.getLock(repoId, path)?.owner ?? null;
  }

  async contributions(repoId: string): Promise<ContributionDay[]> {
    return [...this.engine.contributions(repoId).entries()]
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async createRepository(input: CreateRepositoryInput): Promise<Repository> {
    const newRepo: NewRepository = {
      name: input.name,
      owner: input.owner,
      description: input.description,
      defaultBranchName: input.defaultBranchName,
      license: input.license,
      creator: input.creator,
    };
    return this.engine.createRepository(newRepo);
  }

  async createBranch(repoId: string, input: CreateBranchInput): Promise<Branch> {
    const newBranch: NewBranch = {
      name: input.name,
      fromBranchId: input.fromBranchId,
      category: input.category,
      creator: input.creator,
    };
    return this.engine.createBranch(repoId, newBranch);
  }

  async commit(repoId: string, branchId: string, input: CommitFileInput): Promise<Revision> {
    const edits: CommitEdit[] | undefined = input.edits?.map((e) => ({
      path: e.path,
      content: e.content,
    }));
    return this.engine.commit(repoId, branchId, {
      message: input.message,
      creator: input.creator,
      edits,
      deletes: input.deletes,
    });
  }
  async listIssues(repoId: string, state?: IssueState): Promise<IssueView[]> {
    return this.engine.listIssues(repoId, state).map((i) => this.toIssueView(i));
  }

  async getIssue(repoId: string, number: number): Promise<IssueView | null> {
    const issue = this.engine.getIssue(repoId, number);
    return issue ? this.toIssueView(issue) : null;
  }

  async issueCount(repoId: string, state?: IssueState): Promise<number> {
    return this.engine.issueCount(repoId, state);
  }

  async recentIssues(limit?: number, state?: IssueState): Promise<IssueView[]> {
    return this.engine.recentIssues(limit, state).map((i) => this.toIssueView(i));
  }

  async createIssue(repoId: string, input: CreateIssueInput): Promise<IssueView> {
    const newIssue: NewIssue = { title: input.title, body: input.body, author: input.author };
    return this.toIssueView(this.engine.createIssue(repoId, newIssue));
  }

  private toIssueView(issue: Issue): IssueView {
    const repo = this.engine.getRepository(issue.repoId);
    return {
      id: issue.id,
      repoId: issue.repoId,
      repoName: repo?.name ?? "",
      owner: repo?.owner ?? "",
      number: issue.number,
      title: issue.title,
      body: issue.body,
      state: issue.state,
      author: issue.author,
      created: issue.created,
      updated: issue.updated,
      relative: relativeTime(issue.created),
    };
  }

  async listMergeRequests(repoId: string, state?: MergeRequestState): Promise<MergeRequestView[]> {
    return this.engine.listMergeRequests(repoId, state).map((m) => this.toMergeRequestView(m));
  }

  async mergeRequestCount(repoId: string, state?: MergeRequestState): Promise<number> {
    return this.engine.mergeRequestCount(repoId, state);
  }

  private toMergeRequestView(mr: MergeRequest): MergeRequestView {
    return {
      id: mr.id,
      repoId: mr.repoId,
      number: mr.number,
      title: mr.title,
      sourceBranch: mr.sourceBranch,
      targetBranch: mr.targetBranch,
      state: mr.state,
      author: mr.author,
      created: mr.created,
      relative: relativeTime(mr.created),
    };
  }
}