import { describe, expect, it } from "vitest";
import { LoreEngine } from "./engine.ts";

const ts = (iso: string): number => Math.floor(Date.parse(iso) / 1000);

function repoWithFiles(engine: LoreEngine, files: { path: string; content: string }[]) {
  // each test gets a fresh engine, so a fixed name never collides
  const repo = engine.createRepository({ name: "repo", creator: "ruby", files });
  const main = engine.getBranch(repo.id, "main")!;
  return { repo, main };
}

describe("LoreEngine CAS", () => {
  it("dedupes identical content to the same hash and separates different content", () => {
    const engine = new LoreEngine();
    const a = engine.putContent("repeat me");
    const b = engine.putContent("repeat me");
    expect(a.hash).toBe(b.hash);
    expect(a.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(engine.putContent("something else").hash).not.toBe(a.hash);

    const bytes = new Uint8Array([1, 2, 3, 4]);
    const ba = engine.putContent(bytes);
    const bb = engine.putContent(new Uint8Array([1, 2, 3, 4]));
    expect(ba.hash).toBe(bb.hash);
    expect(engine.putContent(new Uint8Array([1, 2, 3, 5])).hash).not.toBe(ba.hash);

    // first write wins and stays retrievable
    expect(engine.getContent(a)?.text).toBe("repeat me");
  });
});

describe("LoreEngine.createRepository", () => {
  it("creates the default branch with a root revision numbered 1", () => {
    const engine = new LoreEngine();
    const repo = engine.createRepository({ name: "fresh", creator: "ruby" });
    expect(repo.defaultBranchName).toBe("main");

    const branches = engine.listBranches(repo.id);
    expect(branches).toHaveLength(1);
    expect(branches[0].name).toBe("main");
    expect(branches[0].id).toBe(repo.defaultBranchId);

    const root = engine.getRevision(branches[0].latest)!;
    expect(root.number).toBe(1);
    expect(root.branchId).toBe(repo.defaultBranchId);
    expect(root.parentSelf).toBeUndefined();
  });

  it("honors a custom default branch name and seeds files into the root revision", () => {
    const engine = new LoreEngine();
    const repo = engine.createRepository({
      name: "trunky",
      creator: "ruby",
      defaultBranchName: "trunk",
      files: [{ path: "README.md", content: "hi" }],
    });
    const trunk = engine.getBranch(repo.id, "trunk");
    expect(trunk).toBeDefined();
    expect(engine.getBranch(repo.id, "main")).toBeUndefined();
    expect(engine.readFile(trunk!.latest, "README.md")?.text).toBe("hi");
  });

  it("throws on a duplicate repository name", () => {
    const engine = new LoreEngine();
    engine.createRepository({ name: "taken", creator: "ruby" });
    expect(() => engine.createRepository({ name: "taken", creator: "ruby" })).toThrow(
      /already exists/,
    );
  });
});

describe("LoreEngine.commit", () => {
  it("increments the number per branch and advances branch.latest", () => {
    const engine = new LoreEngine();
    const { repo, main } = repoWithFiles(engine, [{ path: "a.txt", content: "A" }]);
    const root = engine.getRevision(main.latest)!;

    const second = engine.commit(repo.id, main.id, {
      message: "second",
      creator: "ruby",
      edits: [{ path: "b.txt", content: "B" }],
    });
    expect(second.number).toBe(2);
    expect(second.parentSelf).toEqual({
      signature: root.signature,
      branchId: main.id,
      number: 1,
    });
    expect(engine.getBranch(repo.id, "main")!.latest).toBe(second.signature);

    const third = engine.commit(repo.id, main.id, {
      message: "third",
      creator: "ruby",
      edits: [{ path: "c.txt", content: "C" }],
    });
    expect(third.number).toBe(3);
    expect(third.parentSelf?.signature).toBe(second.signature);
    expect(engine.getBranch(repo.id, "main")!.latest).toBe(third.signature);
  });

  it("snapshot reflects edits and deletes while prior snapshots stay intact", () => {
    const engine = new LoreEngine();
    const { repo, main } = repoWithFiles(engine, [
      { path: "keep.txt", content: "keep" },
      { path: "change.txt", content: "before" },
      { path: "drop.txt", content: "drop" },
    ]);
    const before = main.latest;

    const rev = engine.commit(repo.id, main.id, {
      message: "edit + delete",
      creator: "ruby",
      edits: [
        { path: "change.txt", content: "after" },
        { path: "new.txt", content: "new" },
      ],
      deletes: ["drop.txt"],
    });

    expect(engine.readFile(rev.signature, "change.txt")?.text).toBe("after");
    expect(engine.readFile(rev.signature, "new.txt")?.text).toBe("new");
    expect(engine.readFile(rev.signature, "keep.txt")?.text).toBe("keep");
    expect(engine.fileAt(rev.signature, "drop.txt")).toBeUndefined();
    expect(engine.readFile(rev.signature, "drop.txt")).toBeUndefined();

    // the parent's snapshot is not mutated by the child commit
    expect(engine.readFile(before, "change.txt")?.text).toBe("before");
    expect(engine.fileAt(before, "drop.txt")).toBeDefined();
  });
});

describe("LoreEngine fork semantics", () => {
  function forkSetup() {
    const engine = new LoreEngine();
    const { repo, main } = repoWithFiles(engine, [{ path: "base.txt", content: "base" }]);
    const r2 = engine.commit(repo.id, main.id, {
      message: "main r2",
      creator: "ruby",
      edits: [{ path: "two.txt", content: "2" }],
    });
    const fork = engine.createBranch(repo.id, {
      name: "feature/x",
      fromBranchId: main.id,
      creator: "ruby",
    });
    const r1Sig = engine.getRevision(r2.parentSelf!.signature)!.signature;
    return { engine, repo, main, fork, r1Sig, r2 };
  }

  it("createBranch shares the fork-point tip and records it on the stack", () => {
    const { main, fork, r2 } = forkSetup();
    expect(fork.latest).toBe(r2.signature);
    expect(fork.latest).toBe(main.latest);
    expect(fork.stack[0]).toEqual({ branchId: main.id, revisionSignature: r2.signature });
  });

  it("a commit on the fork points parentSelf at the fork-point revision on the other branch", () => {
    const { engine, repo, fork, r2 } = forkSetup();
    const f3 = engine.commit(repo.id, fork.id, {
      message: "fork work",
      creator: "ruby",
      edits: [{ path: "feature.txt", content: "f" }],
    });
    expect(f3.number).toBe(3);
    expect(f3.branchId).toBe(fork.id);
    expect(f3.parentSelf?.signature).toBe(r2.signature);
    expect(f3.parentSelf?.branchId).toBe(fork.stack[0].branchId);
    expect(f3.parentSelf?.branchId).not.toBe(fork.id);
  });

  it("listRevisions on a fork walks ancestors plus own commits, excluding post-fork parent commits", () => {
    const { engine, repo, main, fork, r1Sig, r2 } = forkSetup();
    const f3 = engine.commit(repo.id, fork.id, {
      message: "fork work",
      creator: "ruby",
      edits: [{ path: "feature.txt", content: "f" }],
    });
    // later work on the parent branch, not reachable from the fork
    const m3 = engine.commit(repo.id, main.id, {
      message: "main moves on",
      creator: "ruby",
      edits: [{ path: "main-later.txt", content: "m" }],
    });

    const forkHistory = engine.listRevisions(repo.id, fork.id);
    expect(forkHistory.map((r) => r.signature)).toEqual([f3.signature, r2.signature, r1Sig]);
    expect(forkHistory.some((r) => r.signature === m3.signature)).toBe(false);

    const mainHistory = engine.listRevisions(repo.id, main.id);
    expect(mainHistory.map((r) => r.signature)).toEqual([m3.signature, r2.signature, r1Sig]);
    expect(mainHistory.some((r) => r.signature === f3.signature)).toBe(false);

    // numbering is per-branch: both lanes have their own revision 3
    expect(f3.number).toBe(3);
    expect(m3.number).toBe(3);
  });
});

describe("LoreEngine.revisionTree", () => {
  function treeSetup() {
    const engine = new LoreEngine();
    const repo = engine.createRepository({
      name: "tree",
      creator: "ruby",
      files: [
        { path: "README.md", content: "root readme" },
        { path: "assets/logo.png", content: "png" },
        { path: "src/main.ts", content: "main" },
        { path: "src/lib/util.ts", content: "util" },
        { path: "src/lib/deep/x.ts", content: "x" },
      ],
    });
    const main = engine.getBranch(repo.id, "main")!;
    return { engine, sig: main.latest };
  }

  it("derives directory nodes from nested paths, directories first", () => {
    const { engine, sig } = treeSetup();
    const entries = engine.revisionTree(sig);
    expect(entries.map((e) => [e.path, e.nodeType])).toEqual([
      ["assets", "directory"],
      ["src", "directory"],
      ["README.md", "file"],
    ]);
    const readme = entries[2];
    expect(readme.address).toBeDefined();
    expect(readme.blob?.text).toBe("root readme");
  });

  it("lists immediate children only for a subpath", () => {
    const { engine, sig } = treeSetup();
    const srcEntries = engine.revisionTree(sig, "src");
    expect(srcEntries.map((e) => [e.path, e.nodeType])).toEqual([
      ["src/lib", "directory"],
      ["src/main.ts", "file"],
    ]);

    const libEntries = engine.revisionTree(sig, "src/lib");
    expect(libEntries.map((e) => [e.path, e.nodeType])).toEqual([
      ["src/lib/deep", "directory"],
      ["src/lib/util.ts", "file"],
    ]);
  });

  it("returns an empty list for unknown revisions or empty directories", () => {
    const { engine } = treeSetup();
    expect(engine.revisionTree("0".repeat(64))).toEqual([]);
  });
});

describe("LoreEngine.diff", () => {
  it("reports add, delete, and modify and omits unchanged paths", () => {
    const engine = new LoreEngine();
    const { repo, main } = repoWithFiles(engine, [
      { path: "same.txt", content: "same" },
      { path: "mod.txt", content: "before" },
      { path: "del.txt", content: "gone" },
    ]);
    const from = main.latest;
    const to = engine.commit(repo.id, main.id, {
      message: "changes",
      creator: "ruby",
      edits: [
        { path: "mod.txt", content: "after" },
        { path: "add.txt", content: "added" },
      ],
      deletes: ["del.txt"],
    });

    const changes = engine.diff(from, to.signature);
    expect(changes.map((c) => [c.path, c.action])).toEqual([
      ["add.txt", "add"],
      ["del.txt", "delete"],
      ["mod.txt", "modify"],
    ]);
    expect(changes.some((c) => c.path === "same.txt")).toBe(false);

    const add = changes.find((c) => c.path === "add.txt")!;
    expect(add.contentTo?.hash).toBe(engine.putContent("added").hash);
    expect(add.contentFrom).toBeUndefined();

    const del = changes.find((c) => c.path === "del.txt")!;
    expect(del.contentFrom?.hash).toBe(engine.putContent("gone").hash);
    expect(del.contentTo).toBeUndefined();

    const mod = changes.find((c) => c.path === "mod.txt")!;
    expect(mod.contentFrom?.hash).toBe(engine.putContent("before").hash);
    expect(mod.contentTo?.hash).toBe(engine.putContent("after").hash);
    expect(mod.contentFrom!.hash).not.toBe(mod.contentTo!.hash);
  });

  it("a revision diffed against itself is empty", () => {
    const engine = new LoreEngine();
    const { main } = repoWithFiles(engine, [{ path: "a.txt", content: "A" }]);
    expect(engine.diff(main.latest, main.latest)).toEqual([]);
  });
});

describe("LoreEngine binary content", () => {
  it("stores a Uint8Array edit as binary without text, and a string edit as text", () => {
    const engine = new LoreEngine();
    const repo = engine.createRepository({ name: "bin", creator: "ruby" });
    const main = engine.getBranch(repo.id, "main")!;
    const payload = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    const rev = engine.commit(repo.id, main.id, {
      message: "assets",
      creator: "ruby",
      edits: [
        { path: "data.bin", content: payload },
        { path: "notes.txt", content: "hello lore" },
      ],
    });

    const bin = engine.readFile(rev.signature, "data.bin")!;
    expect(bin.binary).toBe(true);
    expect(bin.text).toBeUndefined();
    expect(bin.size).toBe(4);
    expect([...bin.bytes]).toEqual([0xde, 0xad, 0xbe, 0xef]);

    const txt = engine.readFile(rev.signature, "notes.txt")!;
    expect(txt.binary).toBe(false);
    expect(txt.text).toBe("hello lore");
    expect(txt.size).toBe(10);

    // a string explicitly flagged binary loses its text projection too
    const forced = engine.putContent("\x00\x01raw", true);
    const blob = engine.getContent(forced)!;
    expect(blob.binary).toBe(true);
    expect(blob.text).toBeUndefined();
    expect(blob.size).toBe(5);
  });
});

describe("LoreEngine.contributions", () => {
  it("counts unique revisions per ISO day across branches", () => {
    const engine = new LoreEngine();
    const repo = engine.createRepository({
      name: "activ",
      creator: "ruby",
      files: [{ path: "a.txt", content: "A" }],
      created: ts("2025-01-06T12:00:00Z"),
    });
    const main = engine.getBranch(repo.id, "main")!;
    engine.commit(repo.id, main.id, {
      message: "day2 first",
      creator: "ruby",
      timestamp: ts("2025-01-08T09:00:00Z"),
      edits: [{ path: "b.txt", content: "B" }],
    });
    engine.commit(repo.id, main.id, {
      message: "day2 second",
      creator: "ruby",
      timestamp: ts("2025-01-08T23:00:00Z"),
      edits: [{ path: "c.txt", content: "C" }],
    });

    const counts = engine.contributions(repo.id);
    expect([...counts.entries()].sort()).toEqual([
      ["2025-01-06", 1],
      ["2025-01-08", 2],
    ]);

    // a fork with one new commit reuses shared ancestors without double counting
    const fork = engine.createBranch(repo.id, {
      name: "side",
      fromBranchId: main.id,
      creator: "ruby",
    });
    engine.commit(repo.id, fork.id, {
      message: "day3",
      creator: "ruby",
      timestamp: ts("2025-01-10T12:00:00Z"),
      edits: [{ path: "d.txt", content: "D" }],
    });

    const after = engine.contributions(repo.id);
    expect([...after.entries()].sort()).toEqual([
      ["2025-01-06", 1],
      ["2025-01-08", 2],
      ["2025-01-10", 1],
    ]);
    const total = [...after.values()].reduce((a, b) => a + b, 0);
    expect(total).toBe(4); // root + 2 main commits + 1 fork commit, shared ancestors once
  });
});
