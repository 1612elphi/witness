import { Link, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { Avatar, Clipboard, Icon } from "@sunbeam/beam-ui";
import { css } from "styled-system/css";
import type { Action } from "../lib/lore/index.ts";
import { forge } from "../lib/forge/index.ts";
import { decodeRef, hrefPath, requireRepo } from "./util.ts";

export async function loader({ params }: LoaderFunctionArgs) {
  const repo = await requireRepo(params.repo);
  const sig = decodeRef(params.sig);
  const revision = await forge.getRevision(repo.id, sig);
  if (!revision) throw new Response(null, { status: 404 });
  const changes = revision.parentSelf
    ? await forge.diff(repo.id, revision.parentSelf.signature, revision.signature)
    : [];
  return { repo, revision, changes };
}

const ACTION_META: Record<Action, { label: string; bg: string }> = {
  add: { label: "added", bg: "#166534" },
  modify: { label: "modified", bg: "#fa520f" },
  delete: { label: "removed", bg: "#991b1b" },
  move: { label: "moved", bg: "#7e22ce" },
  copy: { label: "copied", bg: "#4a9eff" },
  keep: { label: "kept", bg: "#7f6315" },
};

const wrap = css({ px: { base: "4", md: "8" }, py: "6", maxWidth: "72rem", marginX: "auto", width: "100%" });
const crumbs = css({ display: "flex", alignItems: "center", gap: "1", fontSize: "md", marginBottom: "4" });
const crumbLink = css({ color: "text.secondary", textDecoration: "none", _hover: { color: "sunbeam.orange" } });
const crumbSep = css({ color: "text.muted" });
const crumbCurrent = css({ fontFamily: "mono", fontWeight: "bold", color: "text.primary" });

const headCard = css({ bg: "bg.card", borderWidth: "1px", borderStyle: "solid", borderColor: "border.default", borderRadius: "sm", p: { base: "4", md: "5" }, marginBottom: "6" });
const commitTitle = css({ fontFamily: "heading", fontWeight: "bold", fontSize: "2xl", color: "text.primary", lineHeight: "1.2" });
const commitBody = css({ fontSize: "md", color: "text.secondary", marginTop: "2", whiteSpace: "pre-wrap" });
const metaRow = css({ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "3", marginTop: "4", fontSize: "sm", color: "text.secondary" });
const author = css({ display: "flex", alignItems: "center", gap: "2", fontWeight: "bold", color: "text.primary" });
const hashChip = css({ display: "inline-flex", alignItems: "center", gap: "2", fontFamily: "mono", color: "text.muted" });
const parentLink = css({ display: "inline-flex", alignItems: "center", gap: "1", fontFamily: "mono", color: "text.secondary", textDecoration: "none", _hover: { color: "sunbeam.orange" } });

const diffHead = css({ fontFamily: "heading", fontWeight: "bold", fontSize: "lg", marginBottom: "3" });
const diffList = css({ display: "flex", flexDirection: "column", borderWidth: "1px", borderStyle: "solid", borderColor: "border.default", borderRadius: "sm", overflow: "hidden", bg: "bg.card" });
const diffRow = css({
  display: "flex",
  alignItems: "center",
  gap: "3",
  px: "4",
  py: "2.5",
  bg: "bg.page",
  textDecoration: "none",
  color: "text.primary",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderColor: "border.subtle",
  _last: { borderBottomWidth: "0" },
  _hover: { bg: "accent.06" },
});
const actionChip = css({ flexShrink: 0, width: "5.5rem", textAlign: "center", color: "white", fontSize: "2xs", fontWeight: "bold", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "sm", py: "1", px: "2" });
const diffPath = css({ fontFamily: "mono", fontSize: "sm", truncate: true });
const empty = css({ color: "text.muted", fontStyle: "italic" });

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function CommitDetail() {
  const { repo, revision, changes } = useLoaderData<typeof loader>();
  const base = `/r/${encodeURIComponent(repo.name)}`;
  const sigParam = encodeURIComponent(revision.signature);
  const title = revision.commitMessage.split("\n")[0];
  const body = revision.commitMessage.split("\n").slice(1).join("\n").trim();
  const parents = [revision.parentSelf, revision.parentOther].filter((p) => p != null);

  return (
    <main className={wrap}>
      <nav className={crumbs} aria-label="Breadcrumb">
        <Link to={base} className={crumbLink}>{repo.owner}/{repo.name}</Link>
        <span className={crumbSep}>/</span>
        <Link to={`${base}/commits/${encodeURIComponent(repo.defaultBranchName)}`} className={crumbLink}>commits</Link>
        <span className={crumbSep}>/</span>
        <span className={crumbCurrent}>{revision.signature.slice(0, 7)}</span>
      </nav>

      <div className={headCard}>
        <h1 className={commitTitle}>{title}</h1>
        {body ? <p className={commitBody}>{body}</p> : null}
        <div className={metaRow}>
          <span className={author}>
            <Avatar name={revision.committedBy} size="sm" />
            {revision.committedBy}
          </span>
          <span>committed on {formatDate(revision.timestamp)}</span>
          <span className={hashChip}>
            {revision.signature.slice(0, 7)}
            <Clipboard value={revision.signature} />
          </span>
          {parents.map((parent) => (
            <Link key={parent.signature} to={`${base}/commit/${encodeURIComponent(parent.signature)}`} className={parentLink}>
              <Icon name="arrow_back" size={14} /> parent {parent.signature.slice(0, 7)}
            </Link>
          ))}
        </div>
      </div>

      <h2 className={diffHead}>
        {changes.length} file{changes.length === 1 ? "" : "s"} changed
      </h2>
      {changes.length === 0 ? (
        <p className={empty}>No changes</p>
      ) : (
        <div className={diffList}>
          {changes.map((change) => {
            const meta = ACTION_META[change.action];
            const isGone = change.action === "delete";
            const rowInner = (
              <>
                <span className={actionChip} style={{ backgroundColor: meta.bg }}>{meta.label}</span>
                <span className={diffPath}>
                  {change.pathFrom ? `${change.pathFrom} → ${change.path}` : change.path}
                </span>
              </>
            );
            return isGone ? (
              <div key={`${change.path}-${change.action}`} className={diffRow}>{rowInner}</div>
            ) : (
              <Link
                key={`${change.path}-${change.action}`}
                to={`${base}/blob/${sigParam}/${hrefPath(change.path)}`}
                className={diffRow}
              >
                {rowInner}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
