import { Link, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { Icon } from "@sunbeam/beam-ui";
import { css } from "styled-system/css";
import { forge } from "../lib/forge/index.ts";
import { decodeRef, hrefPath, requireRepo } from "./util.ts";

const FILE_ICON: Record<string, string> = {
  md: "article", ts: "code", tsx: "code", js: "code",
  json: "data_object", svg: "image", css: "css", html: "html",
};

export async function loader({ params }: LoaderFunctionArgs) {
  const repo = await requireRepo(params.repo);
  const ref = decodeRef(params.ref);
  const dirPath = params["*"] ?? "";
  const entries = await forge.treeEntries(repo.id, ref, dirPath);
  return { repo, ref, dirPath, entries };
}

const wrap = css({ px: { base: "4", md: "8" }, py: "6", maxWidth: "72rem", marginX: "auto", width: "100%" });
const crumbs = css({ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1", fontSize: "md", marginBottom: "4" });
const crumbLink = css({ color: "text.secondary", textDecoration: "none", _hover: { color: "sunbeam.orange" } });
const crumbSep = css({ color: "text.muted" });
const crumbCurrent = css({ fontFamily: "mono", fontWeight: "bold", color: "text.primary" });

const list = css({ display: "flex", flexDirection: "column", borderWidth: "1px", borderStyle: "solid", borderColor: "border.default", borderRadius: "sm", overflow: "hidden", bg: "bg.card" });
const row = css({
  display: "grid",
  gridTemplateColumns: "auto 16rem minmax(0, 1fr) auto",
  alignItems: "center",
  gap: "3",
  px: "4",
  py: "3",
  bg: "bg.page",
  textDecoration: "none",
  color: "text.primary",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderColor: "border.default",
  _even: { bg: "accent.06" },
  _last: { borderBottomWidth: "0" },
  _hover: { bg: "accent.12" },
});
const upRow = css({
  display: "flex",
  alignItems: "center",
  gap: "3",
  px: "4",
  py: "3",
  bg: "bg.page",
  textDecoration: "none",
  color: "text.secondary",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderColor: "border.default",
  fontFamily: "mono",
  _hover: { bg: "accent.12", color: "sunbeam.orange" },
});
const nameCell = css({ display: "flex", alignItems: "center", gap: "2", minWidth: 0 });
const entryName = css({ fontWeight: "bold", truncate: true });
const lockTag = css({ display: "inline-flex", alignItems: "center", gap: "1", color: "sunbeam.orange", fontSize: "xs", fontWeight: "bold", flexShrink: 0 });
const lockDir = css({ display: "inline-flex", color: "text.muted", flexShrink: 0 });
const entryMsg = css({ fontStyle: "italic", color: "text.muted", fontSize: "sm", truncate: true });
const entryAge = css({ color: "text.muted", fontSize: "sm", whiteSpace: "nowrap", justifySelf: "end" });
const folderIcon = css({ color: "sunbeam.orange" });
const fileIcon = css({ color: "text.muted" });
const empty = css({ color: "text.muted", fontStyle: "italic", py: "8", textAlign: "center" });

function iconFor(name: string, isDir: boolean): { icon: string; cls: string } {
  if (isDir) return { icon: "folder", cls: folderIcon };
  const ext = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
  return { icon: FILE_ICON[ext] ?? "description", cls: fileIcon };
}

export default function TreeView() {
  const { repo, ref, dirPath, entries } = useLoaderData<typeof loader>();
  const base = `/r/${encodeURIComponent(repo.name)}`;
  const refParam = encodeURIComponent(ref);
  const segments = dirPath ? dirPath.split("/") : [];
  const parent = dirPath.includes("/") ? dirPath.slice(0, dirPath.lastIndexOf("/")) : "";

  return (
    <main className={wrap}>
      <nav className={crumbs} aria-label="Breadcrumb">
        <Link to={base} className={crumbLink}>{repo.owner}/{repo.name}</Link>
        <span className={crumbSep}>/</span>
        <Link to={`${base}/tree/${refParam}`} className={crumbLink}>{ref}</Link>
        {segments.map((seg, i) => {
          const sub = segments.slice(0, i + 1).join("/");
          const isLast = i === segments.length - 1;
          return (
            <span key={sub} className={css({ display: "inline-flex", gap: "1", alignItems: "center" })}>
              <span className={crumbSep}>/</span>
              {isLast
                ? <span className={crumbCurrent}>{seg}</span>
                : <Link to={`${base}/tree/${refParam}/${hrefPath(sub)}`} className={crumbLink}>{seg}</Link>}
            </span>
          );
        })}
      </nav>

      <div className={list}>
        {dirPath ? (
          <Link
            to={parent ? `${base}/tree/${refParam}/${hrefPath(parent)}` : `${base}/tree/${refParam}`}
            className={upRow}
          >
            ..
          </Link>
        ) : null}
        {entries.length === 0 ? (
          <p className={empty}>Empty directory</p>
        ) : (
          entries.map((e) => {
            const { icon, cls } = iconFor(e.name, e.nodeType === "directory");
            const to = e.nodeType === "directory"
              ? `${base}/tree/${refParam}/${hrefPath(e.path)}`
              : `${base}/blob/${refParam}/${hrefPath(e.path)}`;
            return (
              <Link key={e.path} to={to} className={row}>
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
          })
        )}
      </div>
    </main>
  );
}
