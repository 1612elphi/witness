import { describe, expect, it } from "vitest";
import { InMemoryForgeClient } from "./memory.ts";
import { LoreEngine } from "../lore/engine.ts";

const ts = (iso: string): number => Math.floor(Date.parse(iso) / 1000);

describe("InMemoryForgeClient promise surface", () => {
  it("every method returns an awaitable Promise", async () => {
    const engine = new LoreEngine();
    const client = new InMemoryForgeClient(engine);
    const repo = await client.createRepository({ name: "promises", creator: "ruby" });

    const pending = [
      client.listRepositories(),
      client.getRepository("promises"),
      client.listBranches(repo.id),
      client.getBranch(repo.id, "main"),
      client.listRevisions(repo.id, "main"),
      client.getRevision(repo.id, repo.defaultBranchId),
      client.commitGraph(repo.id),
      client.revisionTree(repo.id, "main"),
      client.readFile(repo.id, "main", "nope.txt"),
      client.readBytes(repo.id, "main", "nope.txt"),
      client.diff(repo.id, "main", "main"),
      client.contributions(repo.id),
    ];
    for (const p of pending) expect(p).toBeInstanceOf(Promise);
    await Promise.all(pending); // must all settle

    const dup = client.createRepository({ name: "promises", creator: "ruby" });
    expect(dup).toBeInstanceOf(Promise);
    await expect(dup).rejects.toThrow(/already exists/);
  });

  it("serves null for unknown names and paths", async () => {
    const client = new InMemoryForgeClient(new LoreEngine());
    const repo = await client.createRepository({ name: "known", creator: "ruby" });
    expect(await client.getRepository("ghost")).toBeNull();
    expect(await client.getBranch(repo.id, "ghost")).toBeNull();
    expect(await client.readFile(repo.id, "main", "ghost.txt")).toBeNull();
    expect(await client.readBytes(repo.id, "main", "ghost.txt")).toBeNull();
  });
});

describe("InMemoryForgeClient.readFile / readBytes", () => {
  async function setup() {
    const engine = new LoreEngine();
    const client = new InMemoryForgeClient(engine);
    const repo = await client.createRepository({ name: "files", creator: "ruby" });
    // Uint8Array content cannot cross CommitFileInput, so the binary blob is
    // committed on the engine the client wraps
    await engine.commit(repo.id, repo.defaultBranchId, {
      message: "assets",
      creator: "ruby",
      edits: [{ path: "icon.bin", content: new Uint8Array([0x89, 0x50, 0x4e, 0x47]) }],
    });
    await client.commit(repo.id, repo.defaultBranchId, {
      message: "text file",
      creator: "ruby",
      edits: [{ path: "notes.txt", content: "hello forge" }],
    });
    return { client, repo };
  }

  it("returns a FileView with text for text blobs and without text for binary blobs", async () => {
    const { client, repo } = await setup();
    const txt = await client.readFile(repo.id, "main", "notes.txt");
    expect(txt).not.toBeNull();
    expect(txt!.path).toBe("notes.txt");
    expect(txt!.address).toMatch(/^[0-9a-f]{64}$/);
    expect(txt!.binary).toBe(false);
    expect(txt!.text).toBe("hello forge");
    expect(txt!.size).toBe(11);

    const bin = await client.readFile(repo.id, "main", "icon.bin");
    expect(bin).not.toBeNull();
    expect(bin!.binary).toBe(true);
    expect(bin!.text).toBeUndefined();
    expect(bin!.size).toBe(4);
  });

  it("readBytes returns the raw bytes for both kinds", async () => {
    const { client, repo } = await setup();
    const binBytes = await client.readBytes(repo.id, "main", "icon.bin");
    expect(binBytes).toBeInstanceOf(Uint8Array);
    expect([...binBytes!]).toEqual([0x89, 0x50, 0x4e, 0x47]);

    const txtBytes = await client.readBytes(repo.id, "main", "notes.txt");
    expect(txtBytes).toBeInstanceOf(Uint8Array);
    expect(new TextDecoder().decode(txtBytes!)).toBe("hello forge");
  });
});

describe("InMemoryForgeClient.revisionTree", () => {
  it("returns plain TreeNodes without blob payloads", async () => {
    const engine = new LoreEngine();
    const client = new InMemoryForgeClient(engine);
    const repo = await client.createRepository({ name: "tree", creator: "ruby" });
    await client.commit(repo.id, repo.defaultBranchId, {
      message: "structure",
      creator: "ruby",
      edits: [
        { path: "README.md", content: "root" },
        { path: "src/main.ts", content: "main" },
        { path: "src/lib/util.ts", content: "util" },
      ],
    });

    const root = await client.revisionTree(repo.id, "main");
    expect(root.map((n) => [n.path, n.nodeType])).toEqual([
      ["src", "directory"],
      ["README.md", "file"],
    ]);
    for (const node of root) {
      expect("blob" in node).toBe(false);
      expect(Object.keys(node).sort()).toEqual(["address", "nodeType", "path"]);
    }
    const file = root.find((n) => n.nodeType === "file")!;
    expect(file.address?.hash).toMatch(/^[0-9a-f]{64}$/);
    const dir = root.find((n) => n.nodeType === "directory")!;
    expect(dir.address).toBeUndefined();

    const sub = await client.revisionTree(repo.id, "main", "src");
    expect(sub.map((n) => [n.path, n.nodeType])).toEqual([
      ["src/lib", "directory"],
      ["src/main.ts", "file"],
    ]);

    expect(await client.revisionTree(repo.id, "no-such-ref")).toEqual([]);
  });
});

describe("InMemoryForgeClient.commitGraph", () => {
  // Fixed timestamps are required for a deterministic newest-first order;
  // CommitFileInput cannot express them, so the graph is seeded on the engine.
  async function setup() {
    const engine = new LoreEngine();
    const client = new InMemoryForgeClient(engine);
    const repo = engine.createRepository({
      name: "graph",
      creator: "ruby",
      files: [{ path: "README.md", content: "root" }],
      created: ts("2025-02-01T12:00:00Z"),
    });
    const main = engine.getBranch(repo.id, "main")!;
    const rootSig = main.latest;

    const r2 = engine.commit(repo.id, main.id, {
      message: "second on main",
      creator: "ruby",
      timestamp: ts("2025-02-02T12:00:00Z"),
      edits: [{ path: "src/app.ts", content: "v1" }],
    });
    const dev = engine.createBranch(repo.id, {
      name: "feature/x",
      fromBranchId: main.id,
      creator: "ruby",
    });
    const m3 = engine.commit(repo.id, main.id, {
      message: "third on main",
      creator: "ruby",
      timestamp: ts("2025-02-03T12:00:00Z"),
      edits: [{ path: "src/app.ts", content: "v2" }],
    });
    const d3 = engine.commit(repo.id, dev.id, {
      message: "work on feature/x",
      creator: "ruby",
      timestamp: ts("2025-02-04T12:00:00Z"),
      edits: [{ path: "src/feature.ts", content: "f" }],
    });
    return { client, engine, repo, rootSig, r2, m3, d3 };
  }

  it("emits well-shaped nodes, one per unique revision", async () => {
    const { client, repo } = await setup();
    const graph = await client.commitGraph(repo.id);
    expect(graph).toHaveLength(4); // shared ancestors deduped across two branches
    for (const node of graph) {
      expect(node.hash).toMatch(/^[0-9a-f]{64}$/);
      expect(node.shortHash).toBe(node.hash.slice(0, 7));
      expect(node.message.length).toBeGreaterThan(0);
      expect(node.author).toBe("ruby");
      expect(node.date).toMatch(/^\d+ (second|minute|hour|day|week|month|year)s? ago$/);
      expect(Array.isArray(node.parents)).toBe(true);
    }
  });

  it("parents reference real ancestor signatures", async () => {
    const { client, engine, repo, rootSig, r2, m3, d3 } = await setup();
    const graph = await client.commitGraph(repo.id);
    const byHash = new Map(graph.map((n) => [n.hash, n]));

    expect(byHash.get(rootSig)!.parents).toEqual([]);
    expect(byHash.get(r2.signature)!.parents).toEqual([rootSig]);
    expect(byHash.get(m3.signature)!.parents).toEqual([r2.signature]);
    expect(byHash.get(d3.signature)!.parents).toEqual([r2.signature]);

    // every parent points at a real revision in the same repository
    for (const node of graph) {
      for (const parent of node.parents) {
        expect(engine.getRevision(parent)).toBeDefined();
      }
    }
  });

  it("labels tip commits with their branch name only", async () => {
    const { client, repo, rootSig, r2, m3, d3 } = await setup();
    const graph = await client.commitGraph(repo.id);
    const byHash = new Map(graph.map((n) => [n.hash, n]));

    expect(byHash.get(m3.signature)!.branch).toBe("main");
    expect(byHash.get(d3.signature)!.branch).toBe("feature/x");
    expect(byHash.get(r2.signature)!.branch).toBeUndefined();
    expect(byHash.get(rootSig)!.branch).toBeUndefined();
  });

  it("orders newest first", async () => {
    const { client, engine, repo, rootSig, d3 } = await setup();
    const graph = await client.commitGraph(repo.id);
    const stamps = graph.map((n) => engine.getRevision(n.hash)!.timestamp);
    for (let i = 1; i < stamps.length; i++) {
      expect(stamps[i - 1]).toBeGreaterThanOrEqual(stamps[i]);
    }
    expect(graph[0].hash).toBe(d3.signature);
    expect(graph[graph.length - 1].hash).toBe(rootSig);
  });
});

describe("InMemoryForgeClient.diff", () => {
  async function setup() {
    const engine = new LoreEngine();
    const client = new InMemoryForgeClient(engine);
    const repo = await client.createRepository({ name: "diffs", creator: "ruby" });
    await client.commit(repo.id, repo.defaultBranchId, {
      message: "baseline",
      creator: "ruby",
      edits: [
        { path: "same.txt", content: "same" },
        { path: "mod.txt", content: "before" },
        { path: "del.txt", content: "gone" },
      ],
    });
    const revs = await client.listRevisions(repo.id, "main");
    const baseSig = revs[0].signature; // newest-first: index 0 is the baseline tip

    const feature = await client.createBranch(repo.id, {
      name: "feature/slash",
      fromBranchId: repo.defaultBranchId,
      creator: "ruby",
    });
    await client.commit(repo.id, feature.id, {
      message: "feature changes",
      creator: "ruby",
      edits: [
        { path: "mod.txt", content: "after" },
        { path: "add.txt", content: "added" },
      ],
      deletes: ["del.txt"],
    });
    return { client, engine, repo, baseSig };
  }

  it("resolves branch-name refs containing slashes", async () => {
    const { client, repo } = await setup();
    const changes = await client.diff(repo.id, "main", "feature/slash");
    expect(changes.map((c) => [c.path, c.action])).toEqual([
      ["add.txt", "add"],
      ["del.txt", "delete"],
      ["mod.txt", "modify"],
    ]);
    expect(changes.some((c) => c.path === "same.txt")).toBe(false);
  });

  it("resolves raw signature refs and matches the branch-ref result", async () => {
    const { client, repo, baseSig } = await setup();
    const featureTip = (await client.listRevisions(repo.id, "feature/slash"))[0].signature;
    const bySig = await client.diff(repo.id, baseSig, featureTip);
    const byName = await client.diff(repo.id, "main", "feature/slash");
    expect(bySig).toEqual(byName);
  });

  it("returns an empty array for unresolvable refs", async () => {
    const { client, repo } = await setup();
    expect(await client.diff(repo.id, "main", "nope")).toEqual([]);
    expect(await client.diff(repo.id, "nope", "main")).toEqual([]);
  });
});

describe("InMemoryForgeClient.contributions", () => {
  it("returns contribution days ascending with unique revision counts", async () => {
    const engine = new LoreEngine();
    const client = new InMemoryForgeClient(engine);
    // CommitFileInput has no timestamp override; seed days on the engine
    const repo = engine.createRepository({
      name: "activity",
      creator: "ruby",
      files: [{ path: "a.txt", content: "A" }],
      created: ts("2025-03-01T12:00:00Z"),
    });
    engine.commit(repo.id, repo.defaultBranchId, {
      message: "day2 a",
      creator: "ruby",
      timestamp: ts("2025-03-02T08:00:00Z"),
      edits: [{ path: "b.txt", content: "B" }],
    });
    engine.commit(repo.id, repo.defaultBranchId, {
      message: "day2 b",
      creator: "ruby",
      timestamp: ts("2025-03-02T20:00:00Z"),
      edits: [{ path: "c.txt", content: "C" }],
    });
    const dev = engine.createBranch(repo.id, {
      name: "side",
      fromBranchId: repo.defaultBranchId,
      creator: "ruby",
    });
    engine.commit(repo.id, dev.id, {
      message: "day3",
      creator: "ruby",
      timestamp: ts("2025-03-03T12:00:00Z"),
      edits: [{ path: "d.txt", content: "D" }],
    });

    const days = await client.contributions(repo.id);
    expect(days).toEqual([
      { date: "2025-03-01", count: 1 },
      { date: "2025-03-02", count: 2 },
      { date: "2025-03-03", count: 1 },
    ]);
    const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
    expect(days).toEqual(sorted);
  });
});
