import { Link, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { Avatar, Button } from "@sunbeam/beam-ui";
import { css } from "styled-system/css";
import { forge } from "../lib/forge/index.ts";
import { decodeRef, requireRepo } from "./util.ts";

const TAG_COLOR: Record<string, string> = {
  merge: "#7e22ce",
  squash: "#ff8a00",
  "cherry-pick": "#4a9eff",
};

export async function loader({ params }: LoaderFunctionArgs) {
  const repo = await requireRepo(params.repo);
  const ref = decodeRef(params.ref);
  const revisions = await forge.listRevisions(repo.id, ref);
  return { repo, ref, revisions };
}

const wrap = css({ px: { base: "4", md: "8" }, py: "6", maxWidth: "72rem", marginX: "auto", width: "100%" });
const crumbs = css({ display: "flex", alignItems: "center", gap: "1", fontSize: "md", marginBottom: "4" });
const crumbLink = css({ color: "text.secondary", textDecoration: "none", _hover: { color: "sunbeam.orange" } });
const crumbSep = css({ color: "text.muted" });
const crumbCurrent = css({ fontFamily: "mono", fontWeight: "bold", color: "text.primary" });
const head = css({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "3", marginBottom: "3" });
const title = css({ fontFamily: "heading", fontWeight: "bold", fontSize: "xl" });

const list = css({ display: "flex", flexDirection: "column", borderWidth: "1px", borderStyle: "solid", borderColor: "border.default", borderRadius: "sm", overflow: "hidden", bg: "bg.card" });
const row = css({
  display: "flex",
  alignItems: "center",
  gap: "3",
  px: "4",
  py: "3",
  bg: "bg.page",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderColor: "border.subtle",
  _last: { borderBottomWidth: "0" },
  _hover: { bg: "accent.06" },
});
const main = css({ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "0.5" });
const msgRow = css({ display: "flex", alignItems: "center", gap: "2", minWidth: 0 });
const msg = css({ fontWeight: "bold", color: "text.primary", textDecoration: "none", truncate: true, _hover: { color: "sunbeam.orange" } });
const tagChip = css({ flexShrink: 0, color: "white", fontSize: "2xs", fontWeight: "bold", letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: "sm", py: "0.5", px: "1.5" });
const meta = css({ fontSize: "sm", color: "text.muted" });
const hashMono = css({ fontFamily: "mono", color: "text.secondary" });
const authorCol = css({ display: "flex", alignItems: "center", gap: "2", flexShrink: 0, fontSize: "sm", color: "text.secondary" });
const empty = css({ color: "text.muted", fontStyle: "italic", py: "8", textAlign: "center" });

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function Commits() {
  const { repo, ref, revisions } = useLoaderData<typeof loader>();
  const base = `/r/${encodeURIComponent(repo.name)}`;
  const refParam = encodeURIComponent(ref);

  return (
    <main className={wrap}>
      <nav className={crumbs} aria-label="Breadcrumb">
        <Link to={base} className={crumbLink}>{repo.owner}/{repo.name}</Link>
        <span className={crumbSep}>/</span>
        <span className={crumbCurrent}>{ref}</span>
      </nav>
      <div className={head}>
        <h1 className={title}>Commits</h1>
        <Button as={Link} to={`${base}/commit-new/${refParam}`} variant="primary">New commit</Button>
      </div>

      {revisions.length === 0 ? (
        <p className={empty}>No commits</p>
      ) : (
        <div className={list}>
          {revisions.map((rev) => (
            <div key={rev.signature} className={row}>
              <div className={main}>
                <div className={msgRow}>
                  <Link to={`${base}/commit/${encodeURIComponent(rev.signature)}`} className={msg}>
                    {rev.commitMessage.split("\n")[0]}
                  </Link>
                  {rev.tags?.map((tag) => (
                    <span key={tag} className={tagChip} style={{ backgroundColor: TAG_COLOR[tag] ?? "#7f6315" }}>{tag}</span>
                  ))}
                </div>
                <div className={meta}>
                  <span className={hashMono}>{rev.signature.slice(0, 7)}</span> · {formatDate(rev.timestamp)}
                </div>
              </div>
              <span className={authorCol}>
                <Avatar name={rev.committedBy} size="sm" />
                {rev.committedBy}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
