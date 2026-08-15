import { Link, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { Button, Clipboard, Icon } from "@sunbeam/beam-ui";
import { css } from "styled-system/css";
import { forge } from "../lib/forge/index.ts";
import { decodeRef, hrefPath, requireRepo } from "./util.ts";

export async function loader({ params }: LoaderFunctionArgs) {
  const repo = await requireRepo(params.repo);
  const ref = decodeRef(params.ref);
  const path = params["*"] ?? "";
  const file = await forge.readFile(repo.id, ref, path);
  if (!file) throw new Response(null, { status: 404 });
  const lock = await forge.getLock(repo.id, path);
  return { repo, ref, path, file, lock };
}

const wrap = css({ px: { base: "4", md: "8" }, py: "6", maxWidth: "72rem", marginX: "auto", width: "100%" });
const crumbs = css({ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1", fontSize: "md", marginBottom: "4" });
const crumbLink = css({ color: "text.secondary", textDecoration: "none", _hover: { color: "sunbeam.orange" } });
const crumbSep = css({ color: "text.muted" });
const crumbCurrent = css({ fontFamily: "mono", fontWeight: "bold", color: "text.primary" });

const card = css({ borderWidth: "1px", borderStyle: "solid", borderColor: "border.default", borderRadius: "sm", overflow: "hidden" });
const fileHeader = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "3",
  flexWrap: "wrap",
  bg: "bg.card",
  px: "4",
  py: "2.5",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderColor: "border.default",
});
const fileNameCss = css({ display: "flex", alignItems: "center", gap: "2", fontFamily: "mono", fontWeight: "bold", color: "text.primary" });
const fileActions = css({ display: "flex", alignItems: "center", gap: "3" });
const metaText = css({ fontSize: "sm", color: "text.muted" });
const hashText = css({ fontFamily: "mono", fontSize: "sm", color: "text.muted" });
const lockChip = css({ display: "inline-flex", alignItems: "center", gap: "1", color: "sunbeam.orange", fontSize: "sm", fontWeight: "bold", marginLeft: "2" });

const codeScroll = css({ overflowX: "auto", bg: "bg.page" });
const codeInner = css({ display: "table", width: "100%", fontFamily: "mono", fontSize: "13px", lineHeight: "1.6" });
const codeLine = css({ display: "table-row", _hover: { bg: "accent.06" } });
const gutter = css({
  display: "table-cell",
  textAlign: "right",
  userSelect: "none",
  color: "text.muted",
  bg: "bg.card",
  px: "3",
  borderRightWidth: "1px",
  borderRightStyle: "solid",
  borderColor: "border.subtle",
  whiteSpace: "nowrap",
  width: "1%",
});
const codeText = css({ display: "table-cell", px: "4", whiteSpace: "pre", color: "text.primary" });

const binaryBox = css({ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "3", bg: "bg.page", px: "5", py: "8" });
const binaryNote = css({ display: "flex", alignItems: "center", gap: "2", color: "text.muted", fontStyle: "italic" });

export default function BlobView() {
  const { repo, ref, path, file, lock } = useLoaderData<typeof loader>();
  const base = `/r/${encodeURIComponent(repo.name)}`;
  const refParam = encodeURIComponent(ref);
  const segments = path.split("/");
  const fileName = segments[segments.length - 1];
  const lines = file.text !== undefined ? file.text.replace(/\n$/, "").split("\n") : [];

  const download = async () => {
    const bytes = await forge.readBytes(repo.id, ref, path);
    if (!bytes) return;
    const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)]));
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "download";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className={wrap}>
      <nav className={crumbs} aria-label="Breadcrumb">
        <Link to={base} className={crumbLink}>{repo.owner}/{repo.name}</Link>
        <span className={crumbSep}>/</span>
        <Link to={`${base}/tree/${refParam}`} className={crumbLink}>{ref}</Link>
        {segments.slice(0, -1).map((seg, i) => {
          const sub = segments.slice(0, i + 1).join("/");
          return (
            <span key={sub} className={css({ display: "inline-flex", gap: "1", alignItems: "center" })}>
              <span className={crumbSep}>/</span>
              <Link to={`${base}/tree/${refParam}/${hrefPath(sub)}`} className={crumbLink}>{seg}</Link>
            </span>
          );
        })}
        <span className={crumbSep}>/</span>
        <span className={crumbCurrent}>{fileName}</span>
      </nav>

      <div className={card}>
        <div className={fileHeader}>
          <span className={fileNameCss}>
            <Icon name={file.binary ? "draft" : "description"} size={18} className={css({ color: "sunbeam.orange" })} />
            {fileName}
            {lock ? (
              <span className={lockChip} title={`Locked by ${lock}`}>
                <Icon name="lock" size={14} filled /> Locked by {lock}
              </span>
            ) : null}
          </span>
          <span className={fileActions}>
            <span className={metaText}>{file.size} bytes</span>
            <span className={hashText}>{file.address.slice(0, 12)}</span>
            <Clipboard value={file.address} />
            <Button variant="ghost" onClick={download}>Download</Button>
          </span>
        </div>

        {file.binary ? (
          <div className={binaryBox}>
            <span className={binaryNote}>
              <Icon name="lock" size={16} /> Binary file
            </span>
            <Button variant="primary" onClick={download}>Download</Button>
          </div>
        ) : (
          <div className={codeScroll}>
            <div className={codeInner}>
              {lines.map((line, i) => (
                <div key={i} className={codeLine}>
                  <span className={gutter}>{i + 1}</span>
                  <span className={codeText}>{line || " "}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
