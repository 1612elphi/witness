import type { Repository } from "../lib/lore/index.ts";
import { forge } from "../lib/forge/index.ts";

/** Resolve the :repo URL param to a Repository or raise the 404 boundary. */
export async function requireRepo(name: string | undefined): Promise<Repository> {
  const repo = name ? await forge.getRepository(name) : null;
  if (!repo) throw new Response(null, { status: 404 });
  return repo;
}

/** The router already decodes segments; fall back to raw on malformed input. */
export function decodeRef(raw: string | undefined): string {
  if (!raw) return "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** Encode each segment of a file path for use inside a splat URL. */
export function hrefPath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}
