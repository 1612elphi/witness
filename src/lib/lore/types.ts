// TypeScript projections of the Lore v1 wire messages
// (lore/model/v1/model.proto, lore/thin_client/v1/model.proto). Byte fields
// are carried as lowercase-hex strings since the browser never handles the
// raw CAS bytes.

/** Content-addressed handle for a stored object (model.proto Address). */
export interface Address {
  hash: string;
  context?: string;
}

export type NodeType = "directory" | "file" | "link";

// "modify" is a UI-side extension: the proto Action enum has no MODIFY, but a
// forge diff must distinguish a content change from add/delete/move/copy.
export type Action = "keep" | "add" | "delete" | "move" | "copy" | "modify";

/** Anchor to a concrete revision on a branch (model.proto BranchPoint). */
export interface BranchPoint {
  branchId: string;
  revisionSignature: string;
}

/** Typed metadata pair (thin_client model.proto Metadata). */
export interface Metadata {
  key: string;
  value: string;
  type: "address" | "boolean" | "binary" | "context" | "hash" | "numeric" | "string";
}

/** Top-level revision-graph container (model.proto Repository). */
export interface Repository {
  id: string;
  name: string;
  // Forge-layer namespace (owner/org). Not part of the Lore proto Repository;
  // the forge groups repositories under an owner.
  owner: string;
  description: string;
  defaultBranchId: string;
  defaultBranchName: string;
  creator: string;
  created: number;
  /** Forge-layer SPDX-ish license label (e.g. "0BSD"); not in the Lore proto. */
  license?: string;
  metadata: string;
}

/** A branch in the revision graph (model.proto Branch). */
export interface Branch {
  id: string;
  name: string;
  creator: string;
  category: string;
  created: number;
  latest: string;
  deleted: boolean;
  metadata: string;
  stack: BranchPoint[];
}

/** Parent reference on a revision (thin_client model.proto Revision.Parent). */
export interface RevisionParent {
  signature: string;
  branchId: string;
  number: number;
}

/** Self-describing revision record (thin_client model.proto Revision). */
export interface Revision {
  signature: string;
  branchId: string;
  number: number;
  commitMessage: string;
  timestamp: number;
  createdBy: string;
  committedBy: string;
  metadata: Metadata[];
  parentSelf?: RevisionParent;
  parentOther?: RevisionParent;
  /** Forge-layer labels (e.g. "merge", "squash", "cherry-pick"); not in proto. */
  tags?: string[];
}

/** One entry in a revision tree listing (thin_client model.proto TreeNode). */
export interface TreeNode {
  path: string;
  nodeType: NodeType;
  address?: Address;
}

/** One per-path change in a revision diff (thin_client model.proto DiffChange). */
export interface DiffChange {
  path: string;
  pathFrom?: string;
  action: Action;
  nodeType: NodeType;
  contentFrom?: Address;
  contentTo?: Address;
  automerged?: boolean;
}

// Issues are a forge-layer concept (like GitHub issues atop git). Lore's protos
// have no issue service; the mock stores them as forge metadata beside the
// revision graph.
export type IssueState = "open" | "closed";

export interface Issue {
  id: string;
  repoId: string;
  number: number;
  title: string;
  body: string;
  state: IssueState;
  author: string;
  created: number;
  updated: number;
}

// Merge requests are also a forge-layer concept (Lore has branches but no MR
// service); the forge proposes merging a source branch into a target branch.
export type MergeRequestState = "open" | "merged" | "closed";

export interface MergeRequest {
  id: string;
  repoId: string;
  number: number;
  title: string;
  sourceBranch: string;
  targetBranch: string;
  state: MergeRequestState;
  author: string;
  created: number;
}

// Exclusive file lock (lock.proto LockService). Lore locks a path to one holder
// so binary assets that can't be merged aren't edited concurrently — a defining
// Lore feature. Locks are per repository + path, independent of branch.
export interface Lock {
  repoId: string;
  path: string;
  owner: string;
  created: number;
}
