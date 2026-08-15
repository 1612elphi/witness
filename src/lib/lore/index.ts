import { createSeededEngine } from "./seed.ts";

export * from "./types.ts";
export { LoreEngine } from "./engine.ts";
export type { CommitEdit, CommitInput, NewBranch, NewIssue, NewMergeRequest, NewRepository, StoredBlob, TreeEntry } from "./engine.ts";
export { shortHash } from "./hash.ts";

/** Process-wide seeded Lore instance backing the forge UI. */
export const lore = createSeededEngine();
