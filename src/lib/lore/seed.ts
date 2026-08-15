import { LoreEngine } from "./engine.ts";

const DAY = 86_400;

/** Deterministic pseudo-binary payload so blob assets have real, hashable bytes. */
function fakeBinary(seed: number, length: number): Uint8Array {
  const out = new Uint8Array(length);
  let x = seed >>> 0;
  for (let i = 0; i < length; i++) {
    x = (x * 1_664_525 + 1_013_904_223) >>> 0;
    out[i] = x & 0xff;
  }
  return out;
}

/**
 * Build a Lore engine pre-populated with the delphi organisation's repositories,
 * branches, revision history, and (forge-layer) issues so the forge has real
 * data to browse. All titles/messages/content here are fixture data.
 */
export function createSeededEngine(): LoreEngine {
  const lore = new LoreEngine();
  // Anchor to midnight UTC so seed revision signatures (content + timestamp)
  // stay stable across full page reloads; otherwise deep links to commits break.
  const now = Math.floor(Date.now() / 1000 / DAY) * DAY;
  const t = (daysAgo: number): number => now - daysAgo * DAY;

  // --- Witness: this forge frontend ---
  const witness = lore.createRepository({
    id: "w17e5500000000000000000000000001",
    defaultBranchId: "b1a1w000000000000000000000000001",
    name: "Witness",
    owner: "delphi",
    description: "Forge web UI for the Lore VCS, built with Beam.",
    creator: "ruby",
    created: t(46),
    files: [
      { path: "README.md", content: "# Witness\n\nA forge front-end for Lore.\n" },
      { path: "deno.json", content: '{\n  "tasks": { "dev": "vite" }\n}\n' },
      { path: "src/main.tsx", content: "import { mount } from \"./app.tsx\";\n\nmount();\n" },
    ],
  });
  const witnessMain = lore.getBranch(witness.id, "main")!;
  lore.commit(witness.id, witnessMain.id, {
    message: "Add repository list",
    creator: "ruby",
    timestamp: t(40),
    edits: [{ path: "src/routes/repo-list.tsx", content: "export function RepoList() {\n  return null;\n}\n" }],
  });
  lore.commit(witness.id, witnessMain.id, {
    message: "Squash scaffolding commits",
    creator: "ruby",
    timestamp: t(34),
    tags: ["squash"],
    edits: [{ path: "src/main.tsx", content: "import { mount } from \"./app.tsx\";\nmount();\n" }],
  });
  lore.commit(witness.id, witnessMain.id, {
    message: "Wire Beam design system",
    creator: "ruby",
    timestamp: t(28),
    edits: [{ path: "src/theme.ts", content: 'export const brand = "sunbeam.orange";\n' }],
  });
  const witnessIssues = lore.createBranch(witness.id, {
    id: "b1a1w000000000000000000000000002",
    name: "feature/issue-reports",
    fromBranchId: witnessMain.id,
    category: "feature",
    creator: "ruby",
  });
  const sketch = lore.commit(witness.id, witnessIssues.id, {
    message: "Sketch issue reports column",
    creator: "ruby",
    timestamp: t(20),
    edits: [{ path: "src/routes/issues.tsx", content: "export function Issues() {\n  return null;\n}\n" }],
  });
  lore.commit(witness.id, witnessIssues.id, {
    message: "Wire issue tracker tabs",
    creator: "alien-delphi",
    timestamp: t(14),
    edits: [{ path: "src/routes/tabs.tsx", content: "export function Tabs() {\n  return null;\n}\n" }],
  });
  lore.cherryPick(witness.id, witnessMain.id, sketch.signature, {
    creator: "ruby",
    timestamp: t(10),
    message: "Sketch issue reports column",
  });
  lore.merge(witness.id, witnessMain.id, witnessIssues.id, {
    message: "Merge feature/issue-reports",
    creator: "ruby",
    timestamp: t(6),
  });
  lore.commit(witness.id, witnessMain.id, {
    message: "Polish issue tab styling",
    creator: "ruby",
    timestamp: t(2),
    edits: [{ path: "src/theme.ts", content: 'export const brand = "sunbeam.orange";\nexport const paper = "warm.ivory";\n' }],
  });

  // --- LoreVCS: the version control system ---
  const lorevcs = lore.createRepository({
    id: "10e0c500000000000000000000000002",
    defaultBranchId: "b1a1l000000000000000000000000001",
    name: "LoreVCS",
    owner: "delphi",
    description: "Content-addressed version control for text and binary at scale.",
    creator: "sienna",
    created: t(120),
    files: [
      { path: "README.md", content: "# Lore\n\nBlobs and text, versioned identically.\n" },
      { path: "src/storage.rs", content: "pub struct Cas;\n" },
      { path: "src/revision.rs", content: "pub struct Revision;\n" },
    ],
  });
  const lorevcsMain = lore.getBranch(lorevcs.id, "main")!;
  lore.commit(lorevcs.id, lorevcsMain.id, {
    message: "Add QUIC transport",
    creator: "sienna",
    timestamp: t(64),
    edits: [{ path: "src/transport.rs", content: "pub struct Quic;\n" }],
  });
  lore.commit(lorevcs.id, lorevcsMain.id, {
    message: "Import reference blob asset",
    creator: "sienna",
    timestamp: t(20),
    edits: [{ path: "fixtures/sample.bin", content: fakeBinary(0x10e0, 2048), binary: true }],
  });

  // --- delphitools: a collection of creative tools (the designed repo view) ---
  const tools = lore.createRepository({
    id: "de17000000000000000000000000003a",
    defaultBranchId: "b1a1t000000000000000000000000001",
    name: "delphitools",
    owner: "delphi",
    description: "A collection of digital tools for artists and digital creatives.",
    creator: "delphi",
    license: "0BSD",
    created: t(80),
    files: [
      { path: "README.md", content: "# delphitools\n\nTools for artists.\n" },
      { path: "app/main.tsx", content: "export function App() {\n  return null;\n}\n" },
      { path: "assets/logo.svg", content: "<svg/>\n" },
      { path: "components/Card.tsx", content: "export function Card() {\n  return null;\n}\n" },
      { path: "docs/guide.md", content: "# Guide\n" },
      { path: "hooks/use-tool.ts", content: "export function useTool() {}\n" },
      { path: "lib/canvas.ts", content: "export const dpi = 96;\n" },
      { path: "public/favicon.svg", content: "<svg/>\n" },
      { path: "scripts/build.ts", content: "export {};\n" },
      { path: "types/index.d.ts", content: "export type Tool = { id: string };\n" },
      { path: ".dockerignore", content: "node_modules\n" },
      { path: ".loreignore", content: "_fresh\n" },
      { path: "cover.png", content: fakeBinary(0x3a1, 4096), binary: true },
    ],
  });
  const toolsMain = lore.getBranch(tools.id, "main")!;
  lore.commit(tools.id, toolsMain.id, {
    message: "Add opengraph card renderer",
    creator: "alien-delphi",
    timestamp: t(33),
    edits: [{ path: "components/OgCard.tsx", content: "export function OgCard() {\n  return null;\n}\n" }],
  });
  lore.commit(tools.id, toolsMain.id, {
    message: "Set up docs site",
    creator: "eperkins",
    timestamp: t(19),
    edits: [{ path: "docs/index.md", content: "# delphitools docs\n" }],
  });
  lore.commit(tools.id, toolsMain.id, {
    message: "feat: og image alt copy for cards\n\nadded alt text displayed when opengraph cards load.",
    creator: "delphi",
    timestamp: t(14),
    edits: [
      { path: "components/OgCard.tsx", content: "export function OgCard({ alt }: { alt: string }) {\n  return alt;\n}\n" },
      { path: "app/main.tsx", content: "export function App() {\n  return \"delphitools\";\n}\n" },
    ],
  });
  // Lore's exclusive locks — held on unmergeable binary assets.
  lore.lock(tools.id, "cover.png", "alien-delphi", t(5));
  lore.lock(tools.id, "assets/logo.svg", "delphi", t(9));

  // --- delphicorder: a recorder product ---
  const corder = lore.createRepository({
    id: "c02de40000000000000000000000004b",
    defaultBranchId: "b1a1c000000000000000000000000001",
    name: "delphicorder",
    owner: "delphi",
    description: "Screen and audio capture pipeline.",
    creator: "lonni",
    created: t(58),
    files: [
      { path: "README.md", content: "# delphicorder\n\nCapture pipeline.\n" },
      { path: "src/record.ts", content: "export function record() {}\n" },
    ],
  });
  const corderMain = lore.getBranch(corder.id, "main")!;
  lore.commit(corder.id, corderMain.id, {
    message: "Add encoder settings",
    creator: "lonni",
    timestamp: t(15),
    edits: [{ path: "src/encoder.ts", content: "export const bitrate = 8_000_000;\n" }],
  });

  seedIssues(lore, { witness: witness.id, lorevcs: lorevcs.id, tools: tools.id, corder: corder.id }, t);
  seedMergeRequests(lore, { witness: witness.id, lorevcs: lorevcs.id, tools: tools.id }, t);

  return lore;
}

/** Forge-layer issues per repository (fixture data). */
function seedIssues(
  lore: LoreEngine,
  repo: { witness: string; lorevcs: string; tools: string; corder: string },
  t: (daysAgo: number) => number,
): void {
  const open = (repoId: string, title: string, body: string, daysAgo: number): void => {
    lore.createIssue(repoId, { title, body, author: "delphi", state: "open", created: t(daysAgo) });
  };
  const closed = (repoId: string, title: string, daysAgo: number): void => {
    lore.createIssue(repoId, { title, body: "", author: "delphi", state: "closed", created: t(daysAgo) });
  };

  // Witness — the mockup's headline issue is the most recent, so it leads the feed.
  open(repo.witness, "UI bug when creating new repo", "The create form does not clear after a successful submit.", 1);
  open(repo.witness, "Dark mode toggle flickers on load", "Theme flashes light before settling on the saved value.", 5);
  open(repo.witness, "Keyboard shortcuts for navigation", "Add g-r for repositories and g-i for issues.", 9);
  open(repo.witness, "Empty state for repositories", "Show guidance when a user has no repositories yet.", 14);
  closed(repo.witness, "Wordmark alignment on tablet", 22);

  // LoreVCS
  open(repo.lorevcs, "Postgres backend connection pooling", "Reuse connections across requests to reduce latency.", 3);
  open(repo.lorevcs, "Presigned URL expiry too short", "Downloads fail on slow connections before completing.", 7);
  open(repo.lorevcs, "Diff performance on large trees", "3-way merge slows past ten thousand paths.", 12);
  closed(repo.lorevcs, "gRPC reflection endpoint", 40);
  closed(repo.lorevcs, "Fragment compression flags", 55);

  // delphitools
  open(repo.tools, "Mobile layout overflow", "Tool cards overflow the viewport under 360px.", 6);
  open(repo.tools, "Add export to SVG", "Let users download their work as vector art.", 18);
  closed(repo.tools, "Favicon on Safari", 30);

  // delphicorder
  open(repo.corder, "Audio drift after long capture", "Video and audio desync past thirty minutes.", 2);
  open(repo.corder, "Hardware encoder detection", "Fall back to software encoding when unavailable.", 10);
  closed(repo.corder, "Pause and resume recording", 25);
}

/** Forge-layer merge requests per repository (fixture data). */
function seedMergeRequests(
  lore: LoreEngine,
  repo: { witness: string; lorevcs: string; tools: string },
  t: (daysAgo: number) => number,
): void {
  const mr = (
    repoId: string,
    title: string,
    source: string,
    state: "open" | "merged" | "closed",
    daysAgo: number,
  ): void => {
    lore.createMergeRequest(repoId, {
      title,
      sourceBranch: source,
      targetBranch: "main",
      author: "delphi",
      state,
      created: t(daysAgo),
    });
  };

  mr(repo.witness, "Issue reports column", "feature/issue-reports", "open", 3);
  mr(repo.witness, "Theme toggle persistence", "fix/theme-flash", "open", 8);
  mr(repo.witness, "Vendor Beam design system", "feature/beam", "merged", 12);

  mr(repo.tools, "Opengraph card alt text", "feature/og-cards", "open", 2);
  mr(repo.tools, "Docs site scaffolding", "feature/docs", "merged", 20);

  mr(repo.lorevcs, "Postgres connection pooling", "feature/pg-pool", "open", 4);
  mr(repo.lorevcs, "QUIC transport", "feature/quic", "merged", 60);
  mr(repo.lorevcs, "Legacy gRPC reflection", "chore/grpc-reflect", "closed", 45);
}
