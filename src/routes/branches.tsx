import { Link, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { Avatar, Button, Icon } from "@sunbeam/beam-ui";
import { css } from "styled-system/css";
import { forge } from "../lib/forge/index.ts";
import { requireRepo } from "./util.ts";

export async function loader({ params }: LoaderFunctionArgs) {
  const repo = await requireRepo(params.repo);
  const branches = await forge.listBranches(repo.id);
  return { repo, branches };
}

const wrap = css({ px: { base: "4", md: "8" }, py: "6", maxWidth: "72rem", marginX: "auto", width: "100%" });
const crumbs = css({ display: "flex", alignItems: "center", gap: "1", fontSize: "md", marginBottom: "4" });
const crumbLink = css({ color: "text.secondary", textDecoration: "none", _hover: { color: "sunbeam.orange" } });
const crumbSep = css({ color: "text.muted" });
const crumbCurrent = css({ color: "text.primary", fontWeight: "bold" });
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
const nameCell = css({ display: "flex", alignItems: "center", gap: "2", flex: "1", minWidth: 0 });
const branchName = css({ fontFamily: "mono", fontWeight: "bold", color: "text.primary", textDecoration: "none", truncate: true, _hover: { color: "sunbeam.orange" } });
const branchIcon = css({ color: "sunbeam.orange", flexShrink: 0 });
const defaultChip = css({ flexShrink: 0, bg: "accent.10", color: "sunbeam.orange", fontSize: "2xs", fontWeight: "bold", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "sm", py: "0.5", px: "2" });
const categoryChip = css({ flexShrink: 0, bg: "bg.card", color: "text.secondary", fontSize: "2xs", fontWeight: "bold", letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: "sm", py: "0.5", px: "2", borderWidth: "1px", borderStyle: "solid", borderColor: "border.default" });
const authorCol = css({ display: "flex", alignItems: "center", gap: "2", flexShrink: 0, fontSize: "sm", color: "text.secondary" });
const latestHash = css({ fontFamily: "mono", fontSize: "sm", color: "text.muted", textDecoration: "none", flexShrink: 0, _hover: { color: "sunbeam.orange" } });

export default function Branches() {
  const { repo, branches } = useLoaderData<typeof loader>();
  const base = `/r/${encodeURIComponent(repo.name)}`;

  return (
    <main className={wrap}>
      <nav className={crumbs} aria-label="Breadcrumb">
        <Link to={base} className={crumbLink}>{repo.owner}/{repo.name}</Link>
        <span className={crumbSep}>/</span>
        <span className={crumbCurrent}>branches</span>
      </nav>
      <div className={head}>
        <h1 className={title}>Branches</h1>
        <Button as={Link} to={`${base}/new-branch`} variant="primary">New branch</Button>
      </div>

      <div className={list}>
        {branches.map((branch) => {
          const isDefault = branch.name === repo.defaultBranchName;
          return (
            <div key={branch.id} className={row}>
              <span className={nameCell}>
                <Icon name="account_tree" size={18} className={branchIcon} />
                <Link to={`${base}/tree/${encodeURIComponent(branch.name)}`} className={branchName}>
                  {branch.name}
                </Link>
                {isDefault ? <span className={defaultChip}>default</span> : null}
                {branch.category ? <span className={categoryChip}>{branch.category}</span> : null}
              </span>
              <span className={authorCol}>
                <Avatar name={branch.creator} size="sm" />
                {branch.creator}
              </span>
              <Link to={`${base}/commit/${encodeURIComponent(branch.latest)}`} className={latestHash}>
                {branch.latest.slice(0, 7)}
              </Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}
