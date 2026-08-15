import { Fragment, useState } from "react";
import { Link, useLoaderData, useSearchParams } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { Avatar, Button, Clipboard, CommitGraph, Icon, Tabs } from "@sunbeam/beam-ui";
import { MarkdownRenderer } from "@sunbeam/beam-ui/components/ui/markdown-renderer.tsx";
import { css } from "styled-system/css";
import { forge } from "../lib/forge/index.ts";
import { hrefPath, requireRepo } from "./util.ts";

const LICENSE_LABEL: Record<string, string> = {
  "0BSD": "Zero-Clause BSD License",
  MIT: "MIT License",
  "AGPL-3.0": "AGPL 3.0 License",
  "Apache-2.0": "Apache 2.0 License",
};

const FILE_ICON: Record<string, string> = {
  md: "article",
  ts: "code",
  tsx: "code",
  js: "code",
  json: "data_object",
  svg: "image",
  css: "css",
  html: "html",
};

export async function loader({ params }: LoaderFunctionArgs) {
  const repo = await requireRepo(params.repo);
  const ref = repo.defaultBranchName;
  const [entries, revisions, contributors, language, commits, issues, mergeRequests, graph, branches] = await Promise.all([
    forge.treeEntries(repo.id, ref),
    forge.listRevisions(repo.id, ref, 5),
    forge.contributors(repo.id),
    forge.primaryLanguage(repo.id, ref),
    forge.commitCount(repo.id, ref),
    forge.listIssues(repo.id),
    forge.listMergeRequests(repo.id),
    forge.commitGraph(repo.id),
    forge.listBranches(repo.id),
  ]);
  const branchCount = branches.length;
  const readmeEntry = entries.find((e) => e.nodeType === "file" && /^readme(\.[a-z]+)?$/i.test(e.name));
  const readmeFile = readmeEntry ? await forge.readFile(repo.id, ref, readmeEntry.path) : null;
  const readme = readmeFile && !readmeFile.binary ? (readmeFile.text ?? "") : null;
  const readmeName = readmeEntry?.name ?? null;
  return { repo, ref, entries, revisions, contributors, language, commits, issues, mergeRequests, graph, branchCount, readme, readmeName };
}

/* ---- styles ---- */
const wrap = css({ px: { base: "4", md: "8" }, py: "6", maxWidth: "84rem", marginX: "auto", width: "100%" });

const titleRow = css({ display: "flex", alignItems: "center", gap: "4", marginBottom: "6" });
const titleText = css({ fontFamily: "heading", fontSize: "3xl", whiteSpace: "nowrap" });
const titleOwner = css({ color: "text.muted", fontWeight: "normal" });
const titleName = css({ fontWeight: "bold", color: "text.primary" });
const dashRule = css({ flex: "1", borderTopWidth: "4px", borderTopStyle: "dashed", borderColor: "sunbeam.orange", minWidth: "8" });

const workWrap = css({ position: "relative" });
const workPanel = css({
  position: "absolute",
  right: "0",
  top: "calc(100% + 8px)",
  zIndex: 20,
  bg: "bg.card",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border.default",
  borderRadius: "sm",
  boxShadow: "golden",
  p: "4",
  width: "22rem",
  maxWidth: "90vw",
  display: "flex",
  flexDirection: "column",
  gap: "3",
});
const workLabel = css({ fontSize: "2xs", fontWeight: "bold", letterSpacing: "0.12em", textTransform: "uppercase", color: "text.muted" });
const workCode = css({ fontFamily: "mono", fontSize: "sm", bg: "bg.page", borderWidth: "1px", borderStyle: "solid", borderColor: "border.subtle", borderRadius: "sm", px: "2", py: "1.5", wordBreak: "break-all" });

const metro = css({ display: "flex", alignItems: "center", gap: "4", marginBottom: "8" });
const track = css({ flex: "1.3", display: "flex", alignItems: "center", position: "relative", paddingTop: "7", paddingBottom: "8" });
const branchTag = css({ fontSize: "2xs", fontWeight: "bold", letterSpacing: "0.1em", color: "text.muted", flexShrink: 0, marginRight: "1" });
const seg = css({ height: "8px", bg: "sunbeam.orange", flex: "1", minWidth: "6" });
const station = css({ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 });
const dot = css({ width: "7", height: "7", borderRadius: "full", bg: "bg.page", borderWidth: "5px", borderStyle: "solid", borderColor: "sunbeam.orange", zIndex: 1 });
const headDot = css({
  width: "15",
  height: "15",
  borderRadius: "full",
  bg: "sunbeam.orange",
  borderWidth: "6px",
  borderStyle: "solid",
  borderColor: "bg.page",
  boxShadow: "0 0 0 5px var(--colors-sunbeam-orange)",
  zIndex: 1,
});
const hashLabel = css({ position: "absolute", top: "100%", left: "50%", marginTop: "3", fontSize: "xs", color: "text.muted", whiteSpace: "nowrap", transform: "translateX(-50%)" });
const headLabel = css({ position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: "4", fontWeight: "bold", fontSize: "sm", letterSpacing: "0.08em", color: "text.secondary" });

const chevron = css({ color: "sunbeam.orange", flexShrink: 0, marginLeft: "3", display: "flex", alignItems: "center" });
const headInfo = css({ flex: "1", minWidth: 0 });
const headMeta = css({ fontFamily: "mono", fontSize: "sm", color: "text.secondary", marginBottom: "1" });
const headTitle = css({ fontFamily: "heading", fontWeight: "bold", fontSize: "2xl", color: "text.primary", lineHeight: "1.15" });
const headBody = css({ fontStyle: "italic", fontSize: "sm", color: "text.muted", marginTop: "1" });

const body = css({ display: "grid", gridTemplateColumns: { base: "1fr", lg: "minmax(0, 1fr) 18rem" }, gap: { base: "8", lg: "12" } });

const treeList = css({ display: "flex", flexDirection: "column", borderWidth: "1px", borderStyle: "solid", borderColor: "border.default", borderRadius: "sm", overflow: "hidden", bg: "bg.card" });
const treeRow = css({
  display: "grid",
  gridTemplateColumns: "auto 16rem minmax(0, 1fr) auto",
  alignItems: "center",
  gap: "3",
  px: "4",
  py: "3",
  textDecoration: "none",
  color: "text.primary",
  bg: "bg.page",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderColor: "border.default",
  _even: { bg: "accent.06" },
  _last: { borderBottomWidth: "0" },
  _hover: { bg: "accent.12" },
});
const nameCell = css({ display: "flex", alignItems: "center", gap: "2", minWidth: 0 });
const entryName = css({ fontWeight: "bold", truncate: true });
const lockTag = css({ display: "inline-flex", alignItems: "center", gap: "1", color: "sunbeam.orange", fontSize: "xs", fontWeight: "bold", flexShrink: 0 });
const lockDir = css({ display: "inline-flex", color: "text.muted", flexShrink: 0 });
const entryMsg = css({ fontStyle: "italic", color: "text.muted", fontSize: "sm", truncate: true });
const entryAge = css({ color: "text.muted", fontSize: "sm", whiteSpace: "nowrap", justifySelf: "end" });
const folderIcon = css({ color: "sunbeam.orange" });
const fileIcon = css({ color: "text.muted" });

const side = css({ display: "flex", flexDirection: "column", gap: "4" });
const sideCard = css({ display: "flex", flexDirection: "column", gap: "3", borderWidth: "1px", borderStyle: "solid", borderColor: "border.default", borderRadius: "sm", bg: "bg.card", p: "4" });
const sideName = css({ fontFamily: "heading", fontWeight: "bold", fontSize: "xl", color: "text.primary" });
const sideDesc = css({ fontSize: "md", color: "text.secondary", lineHeight: "1.5" });
const sideHead = css({ fontFamily: "heading", fontWeight: "bold", fontSize: "xs", letterSpacing: "0.08em", textTransform: "uppercase", color: "text.muted" });
const sideFacts = css({ display: "flex", flexDirection: "column", gap: "2.5", marginTop: "1" });
const factRow = css({ display: "flex", alignItems: "center", gap: "2", color: "text.secondary", fontSize: "sm" });
const factLink = css({ display: "flex", alignItems: "center", gap: "2", color: "text.secondary", fontSize: "sm", textDecoration: "none", _hover: { color: "sunbeam.orange" } });
const factIcon = css({ color: "text.muted", flexShrink: 0 });
const factNum = css({ color: "sunbeam.orange", fontWeight: "bold" });
const langAccent = css({ color: "sunbeam.orange", fontWeight: "bold" });
const langDot = css({ width: "3", height: "3", borderRadius: "full", bg: "sunbeam.orange", flexShrink: 0 });
const contribList = css({ display: "flex", flexDirection: "column", gap: "2", marginTop: "1" });
const contribRow = css({ display: "flex", alignItems: "center", gap: "2", py: "0.5" });
const ownerName = css({ color: "sunbeam.orange", fontWeight: "bold" });
const crown = css({ color: "sunbeam.orange", marginLeft: "auto" });

const tabBar = css({ marginBottom: "6" });
const panelHead = css({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "3", marginBottom: "3" });
const panelTitle = css({ display: "flex", alignItems: "center", gap: "2", fontFamily: "heading", fontWeight: "bold", fontSize: "xl" });
const panelTitleIcon = css({ color: "sunbeam.orange", flexShrink: 0 });
const readmeCard = css({ marginTop: "8", borderWidth: "1px", borderStyle: "solid", borderColor: "border.default", borderRadius: "sm", bg: "bg.card", overflow: "hidden" });
const readmeHead = css({ display: "flex", alignItems: "center", gap: "2", px: "4", py: "3", borderBottomWidth: "1px", borderBottomStyle: "solid", borderColor: "border.default", bg: "bg.page", fontFamily: "mono", fontSize: "sm", fontWeight: "bold", color: "text.secondary" });
const readmeBody = css({ px: { base: "4", md: "6" }, py: { base: "4", md: "5" } });
const list = css({ display: "flex", flexDirection: "column", borderWidth: "1px", borderStyle: "solid", borderColor: "border.default", borderRadius: "sm", overflow: "hidden", bg: "bg.card" });
const listRow = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "3",
  px: "4",
  py: "3",
  bg: "bg.page",
  textDecoration: "none",
  color: "text.primary",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderColor: "border.subtle",
  _last: { borderBottomWidth: "0" },
  _hover: { bg: "accent.06" },
});
const rowMain = css({ display: "flex", flexDirection: "column", gap: "0.5", minWidth: 0, flex: "1" });
const rowTitle = css({ fontWeight: "bold", color: "text.primary" });
const rowMeta = css({ fontSize: "sm", color: "text.muted" });
const rowMetaMono = css({ fontFamily: "mono", fontSize: "xs", color: "text.secondary" });
const stateIcon = css({ flexShrink: 0, marginTop: "0.5" });
const emptyPanel = css({ color: "text.muted", fontStyle: "italic", py: "8", textAlign: "center", borderWidth: "1px", borderStyle: "dashed", borderColor: "sunshine.300", borderRadius: "sm" });
const mrRow = css({ display: "flex", alignItems: "stretch", height: "72px", bg: "bg.page", borderBottomWidth: "1px", borderBottomStyle: "solid", borderColor: "border.subtle", _last: { borderBottomWidth: "0" }, _hover: { bg: "accent.06" } });
const mrGraphCss = css({ flexShrink: 0, display: "block" });
const mrContentCss = css({ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: "1", pr: "4", py: "2" });
const mrTitleRow = css({ display: "flex", alignItems: "center", gap: "2" });
const mrChip = css({ flexShrink: 0, color: "white", fontSize: "2xs", fontWeight: "bold", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "sm", py: "0.5", px: "2" });
const branchMono = css({ fontFamily: "mono", fontSize: "xs", fontWeight: "bold" });

// Open = active (orange), closed = resolved (green): icon and colour agree.
const ISSUE_ICON: Record<string, { icon: string; color: string }> = {
  open: { icon: "radio_button_unchecked", color: "#fa520f" },
  closed: { icon: "check_circle", color: "#166534" },
};
const MR_STATE: Record<string, { label: string; color: string }> = {
  open: { label: "open", color: "#fa520f" },
  merged: { label: "merged", color: "#7e22ce" },
  closed: { label: "closed", color: "#991b1b" },
};
// Branch lanes (main is the orange trunk; feature branches take these).
const MR_LANE_COLORS = ["#ffb83e", "#4a9eff", "#a855f7", "#5bb8a6", "#ff8a00", "#ffd06a"];
function branchColor(branch: string): string {
  let h = 0;
  for (const c of branch) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return MR_LANE_COLORS[h % MR_LANE_COLORS.length];
}

function iconFor(name: string, isDir: boolean): { icon: string; cls: string } {
  if (isDir) return { icon: "folder", cls: folderIcon };
  const ext = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
  return { icon: FILE_ICON[ext] ?? "description", cls: fileIcon };
}

function WorkButton({ owner, name }: { owner: string; name: string }) {
  const [open, setOpen] = useState(false);
  const workspace = `lore work ${owner}/${name}`;
  const connect = `lores://lore.delphi.tools/${owner}/${name}`;
  return (
    <div className={workWrap}>
      <Button variant="primary" onClick={() => setOpen((v) => !v)}>WORK</Button>
      {open ? (
        <div className={workPanel} role="dialog">
          <div>
            <div className={workLabel}>Workspace</div>
            <div className={workCode}>{workspace}</div>
          </div>
          <div>
            <div className={workLabel}>Connect</div>
            <div className={workCode}>{connect}</div>
          </div>
          <Clipboard value={`${workspace}\n${connect}`} />
        </div>
      ) : null}
    </div>
  );
}

export default function RepoHome() {
  const { repo, ref, entries, revisions, contributors, language, commits, issues, mergeRequests, graph, branchCount, readme, readmeName } =
    useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") ?? "code";
  const base = `/r/${encodeURIComponent(repo.name)}`;
  const refParam = encodeURIComponent(ref);
  const stations = [...revisions].reverse();
  const head = revisions[0] ?? null;
  const headTitleText = head ? head.commitMessage.split("\n")[0] : "";
  const headBodyText = head ? head.commitMessage.split("\n").slice(1).join(" ").trim() : "";
  const openIssues = issues.filter((i) => i.state === "open").length;
  const openMerges = mergeRequests.filter((m) => m.state === "open").length;

  const tabs = [
    { value: "code", label: "Code" },
    { value: "history", label: "Commit History" },
    { value: "issues", label: `Issue Reports (${openIssues})` },
    { value: "merges", label: `Merge Requests (${openMerges})` },
  ];
  const selectTab = (value: string) =>
    setSearchParams(value === "code" ? {} : { tab: value }, { replace: true });

  return (
    <main className={wrap}>
      <div className={titleRow}>
        <span className={titleText}>
          <span className={titleOwner}>{repo.owner}</span>
          <span className={titleName}> / {repo.name}</span>
        </span>
        <span className={dashRule} />
        <WorkButton owner={repo.owner} name={repo.name} />
      </div>

      <div className={tabBar}>
        <Tabs items={tabs} activeValue={tab} onChange={selectTab} />
      </div>

      {tab === "code" ? (
        <>
          <section className={metro} aria-label="Recent commits">
            <div className={track}>
              <span className={branchTag}>{ref.toUpperCase()}</span>
              {stations.map((rev, i) => {
                const isHead = i === stations.length - 1;
                return (
                  <Fragment key={rev.signature}>
                    <span className={seg} />
                    <span className={station}>
                      {isHead ? (
                        <span className={headLabel}>HEAD</span>
                      ) : (
                        <span className={hashLabel}>{rev.signature.slice(0, 7)}</span>
                      )}
                      <Link
                        to={`${base}/commit/${encodeURIComponent(rev.signature)}`}
                        className={isHead ? headDot : dot}
                        aria-label={`commit ${rev.signature.slice(0, 7)}`}
                      />
                    </span>
                  </Fragment>
                );
              })}
              <span className={chevron} aria-hidden="true">
                <Icon name="keyboard_double_arrow_right" size={30} filled />
              </span>
            </div>
            {head ? (
              <div className={headInfo}>
                <div className={headMeta}>{head.signature.slice(0, 7)} / {head.committedBy}</div>
                <Link to={`${base}/commit/${encodeURIComponent(head.signature)}`} className={css({ textDecoration: "none" })}>
                  <div className={headTitle}>{headTitleText}</div>
                </Link>
                {headBodyText ? <div className={headBody}>{headBodyText}</div> : null}
              </div>
            ) : null}
          </section>

          <div className={body}>
            <div className={treeList}>
              {entries.map((e) => {
                const { icon, cls } = iconFor(e.name, e.nodeType === "directory");
                const to = e.nodeType === "directory"
                  ? `${base}/tree/${refParam}/${hrefPath(e.path)}`
                  : `${base}/blob/${refParam}/${hrefPath(e.path)}`;
                return (
                  <Link key={e.path} to={to} className={treeRow}>
                    <Icon name={icon} size={20} filled={e.nodeType === "directory"} className={cls} />
                    <span className={nameCell}>
                      <span className={entryName}>{e.name}</span>
                      {e.lockedBy ? (
                        <span className={lockTag} title={`Locked by ${e.lockedBy}`}>
                          <Icon name="lock" size={14} filled /> {e.lockedBy}
                        </span>
                      ) : e.locked ? (
                        <span className={lockDir} title="Contains locked files">
                          <Icon name="lock" size={14} />
                        </span>
                      ) : null}
                    </span>
                    <span className={entryMsg}>{e.lastMessage}</span>
                    <span className={entryAge}>{e.lastRelative}</span>
                  </Link>
                );
              })}
            </div>

            <aside className={side}>
              <div className={sideCard}>
                <h2 className={sideName}>{repo.name}</h2>
                {repo.description ? <p className={sideDesc}>{repo.description}</p> : null}
                <div className={sideFacts}>
                  <Link to={`${base}/commits/${refParam}`} className={factLink}>
                    <Icon name="history" size={16} className={factIcon} />
                    <span><span className={factNum}>{commits}</span> commit{commits === 1 ? "" : "s"}</span>
                  </Link>
                  <Link to={`${base}/branches`} className={factLink}>
                    <Icon name="account_tree" size={16} className={factIcon} />
                    <span><span className={factNum}>{branchCount}</span> branch{branchCount === 1 ? "" : "es"}</span>
                  </Link>
                  {repo.license ? (
                    <span className={factRow}>
                      <Icon name="balance" size={16} className={factIcon} />
                      {LICENSE_LABEL[repo.license] ?? `${repo.license} License`}
                    </span>
                  ) : null}
                  {language ? (
                    <span className={factRow}>
                      <span className={langDot} />
                      <span className={langAccent}>{language}</span>
                    </span>
                  ) : null}
                </div>
              </div>
              <div className={sideCard}>
                <h3 className={sideHead}>Contributors</h3>
                <div className={contribList}>
                  {contributors.map((c) => (
                    <div key={c.name} className={contribRow}>
                      <Avatar name={c.name} size="sm" />
                      <span className={c.isOwner ? ownerName : undefined}>{c.name}</span>
                      {c.isOwner ? <Icon name="crown" size={14} filled className={crown} label="owner" /> : null}
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          {readme != null ? (
            <section className={readmeCard} aria-label="README">
              <div className={readmeHead}>
                <Icon name="article" size={16} className={factIcon} />
                {readmeName}
              </div>
              <div className={readmeBody}>
                <MarkdownRenderer content={readme} />
              </div>
            </section>
          ) : null}
        </>
      ) : null}

      {tab === "history" ? (
        <section aria-label="Commit history">
          <div className={panelHead}>
            <h2 className={panelTitle}><Icon name="account_tree" size={20} filled className={panelTitleIcon} />Commit History</h2>
          </div>
          <div className={css({ borderWidth: "1px", borderStyle: "solid", borderColor: "border.default", borderRadius: "sm", bg: "bg.card", p: { base: "2", md: "4" }, overflowX: "auto" })}>
            <CommitGraph commits={graph} />
          </div>
        </section>
      ) : null}

      {tab === "issues" ? (
        <section aria-label="Issue reports">
          <div className={panelHead}>
            <h2 className={panelTitle}><Icon name="error" size={20} filled className={panelTitleIcon} />Issue Reports</h2>
            <Button as={Link} to={`${base}/issues/new`} variant="primary">New issue report</Button>
          </div>
          {issues.length === 0 ? (
            <p className={emptyPanel}>No issue reports yet</p>
          ) : (
            <div className={list}>
              {issues.map((i) => (
                <div key={i.id} className={listRow}>
                  <span className={stateIcon} style={{ color: ISSUE_ICON[i.state].color }}>
                    <Icon name={ISSUE_ICON[i.state].icon} size={18} filled />
                  </span>
                  <span className={rowMain}>
                    <span className={rowTitle}>{i.title}</span>
                    <span className={rowMeta}>#{i.number} · {i.state} · opened {i.relative} by {i.author}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {tab === "merges" ? (
        <section aria-label="Merge requests">
          <div className={panelHead}>
            <h2 className={panelTitle}><Icon name="merge" size={20} filled className={panelTitleIcon} />Merge Requests</h2>
          </div>
          {mergeRequests.length === 0 ? (
            <p className={emptyPanel}>No merge requests yet</p>
          ) : (
            <div className={list}>
              {mergeRequests.map((m) => {
                const color = branchColor(m.sourceBranch);
                const state = MR_STATE[m.state];
                return (
                  <div key={m.id} className={mrRow}>
                    <svg className={mrGraphCss} width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
                      <line x1="16" y1="0" x2="16" y2="72" stroke="var(--colors-sunbeam-orange)" strokeWidth="4" />
                      <line x1="16" y1="36" x2="52" y2="36" stroke={color} strokeWidth="4" />
                      <circle
                        cx="52"
                        cy="36"
                        r="8"
                        fill={m.state === "merged" ? color : "var(--colors-bg-page)"}
                        stroke={color}
                        strokeWidth="4"
                      />
                    </svg>
                    <div className={mrContentCss}>
                      <div className={mrTitleRow}>
                        <span className={rowTitle}>{m.title}</span>
                        <span className={mrChip} style={{ backgroundColor: state.color }}>{state.label}</span>
                      </div>
                      <div className={rowMeta}>
                        <span className={branchMono} style={{ color }}>{m.sourceBranch}</span>
                        {" → "}
                        <span className={rowMetaMono}>{m.targetBranch}</span>
                        {" · "}#{m.number} · opened {m.relative} by {m.author}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}
