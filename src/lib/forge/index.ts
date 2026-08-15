import { InMemoryForgeClient } from "./memory.ts";
import type { ForgeClient } from "./types.ts";

export * from "./types.ts";
export { InMemoryForgeClient } from "./memory.ts";

/** Process-wide forge client backing the UI. */
export const forge: ForgeClient = new InMemoryForgeClient();
