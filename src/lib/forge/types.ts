import type { Branch, DiffChange, IssueState, MergeRequestState, NodeType, Repository, Revision, TreeNode } from "../lore/index.ts";

// Serializable view models handed to pages and components. Raw CAS bytes never
// cross this boundary, so a real BFF calling ThinClientService can implement
// the same interface without change.

/** A file's content prepared for display (text) or download (binary). */
export interface FileView {
  path: string;
  address: string;
  size: number;
  binary: boolean;
  /** Present only for text blobs. */
  text?: string;
}

/** One day of contribution activity, shaped for Beam's ActivityHeatmap. */
export interface ContributionDay {
  date: string;
  count: number;
}

/** One node in the commit graph, shaped for Beam's CommitGraph. */
export interface CommitNode {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  date: string;
  parents: string[];
  branch?: string;
  tags?: string[];
}

/** A tree entry annotated with the revision that last touched it. */
export interface TreeEntryView {
  path: string;
  name: string;
  nodeType: NodeType;
  lastMessage: string;
  lastRelative: string;
  lastAuthor: string;
  /** True if this file (or, for directories, a descendant) is locked. */
  locked: boolean;
  /** Lock holder for a locked file; unset for directories. */
  lockedBy?: string;
}

/** A repository contributor, owner flagged for the crown marker. */
export interface Contributor {
  name: string;
  commits: number;
  isOwner: boolean;
}

export interface CreateRepositoryInput {
  name: string;
  owner?: string;
  description?: string;
  defaultBranchName?: string;
  license?: string;
  creator: string;
}

/** An issue joined with its repository's owner/name for display. */
export interface IssueView {
  id: string;
  repoId: string;
  repoName: string;
  owner: string;
  number: number;
  title: string;
  body: string;
  state: IssueState;
  author: string;
  created: number;
  updated: number;
  relative: string;
}

/** A merge request prepared for display. */
export interface MergeRequestView {
  id: string;
  repoId: string;
  number: number;
  title: string;
  sourceBranch: string;
  targetBranch: string;
  state: MergeRequestState;
  author: string;
  created: number;
  relative: string;
}

export interface CreateIssueInput {
  title: string;
  body?: string;
  author: string;
}

export interface CreateBranchInput {
  name: string;
  fromBranchId: string;
  category?: string;
  creator: string;
}

export interface CommitFileInput {
  message: string;
  creator: string;
  edits?: { path: string; content: string }[];
  deletes?: string[];
}

/**
 * The forge's read/write surface. Async and serializable so the in-browser mock
 * and a future server BFF are interchangeable behind the same contract.
 */
export interface ForgeClient {
  listRepositories(): Promise<Repository[]>;
  getRepository(name: string): Promise<Repository | null>;

  listBranches(repoId: string): Promise<Branch[]>;
  getBranch(repoId: string, ref: string): Promise<Branch | null>;

  listRevisions(repoId: string, ref: string, limit?: number): Promise<Revision[]>;
  getRevision(repoId: string, signature: string): Promise<Revision | null>;
  commitGraph(repoId: string): Promise<CommitNode[]>;

  revisionTree(repoId: string, ref: string, path?: string): Promise<TreeNode[]>;
  /** Tree entries annotated with the last revision that touched each. */
  treeEntries(repoId: string, ref: string, path?: string): Promise<TreeEntryView[]>;
  contributors(repoId: string): Promise<Contributor[]>;
  primaryLanguage(repoId: string, ref: string): Promise<string | null>;
  commitCount(repoId: string, ref: string): Promise<number>;
  readFile(repoId: string, ref: string, path: string): Promise<FileView | null>;
  /** Raw blob bytes for downloads (text or binary); null if the path is absent. */
  readBytes(repoId: string, ref: string, path: string): Promise<Uint8Array | null>;
  diff(repoId: string, fromRef: string, toRef: string): Promise<DiffChange[]>;
  /** Lock holder for a path, or null if unlocked. */
  getLock(repoId: string, path: string): Promise<string | null>;

  contributions(repoId: string): Promise<ContributionDay[]>;

  listIssues(repoId: string, state?: IssueState): Promise<IssueView[]>;
  getIssue(repoId: string, number: number): Promise<IssueView | null>;
  issueCount(repoId: string, state?: IssueState): Promise<number>;
  recentIssues(limit?: number, state?: IssueState): Promise<IssueView[]>;
  createIssue(repoId: string, input: CreateIssueInput): Promise<IssueView>;

  listMergeRequests(repoId: string, state?: MergeRequestState): Promise<MergeRequestView[]>;
  mergeRequestCount(repoId: string, state?: MergeRequestState): Promise<number>;

  createRepository(input: CreateRepositoryInput): Promise<Repository>;
  createBranch(repoId: string, input: CreateBranchInput): Promise<Branch>;
  commit(repoId: string, branchId: string, input: CommitFileInput): Promise<Revision>;
}
