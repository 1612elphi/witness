import { Link, useLoaderData } from "react-router";
import { Badge } from "@sunbeam/beam-ui";
import { css } from "styled-system/css";
import { forge } from "../lib/forge/index.ts";

export async function loader() {
  const repos = await forge.listRepositories();
  const [counts, langs] = await Promise.all([
    Promise.all(repos.map((r) => forge.issueCount(r.id, "open"))),
    Promise.all(repos.map((r) => forge.primaryLanguage(r.id, r.defaultBranchName))),
  ]);
  const withCounts = repos.map((r, i) => ({ ...r, openIssues: counts[i], language: langs[i] }));
  const issues = await forge.recentIssues(6, "open");
  return { repos: withCounts, issues };
}

const page = css({
  display: "grid",
  gridTemplateColumns: { base: "1fr", lg: "minmax(0, 1fr) minmax(0, 1fr)" },
  gap: { base: "8", lg: "16" },
  px: { base: "4", md: "8" },
  py: { base: "8", md: "10" },
  maxWidth: "80rem",
  marginX: "auto",
  width: "100%",
});

const column = css({ display: "flex", flexDirection: "column", gap: "4", minWidth: 0 });
const heading = css({
  fontFamily: "heading",
  fontWeight: "bold",
  fontSize: "2xl",
  color: "text.primary",
  marginBottom: "1",
});

const card = css({
  display: "block",
  bg: "bg.card",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border.subtle",
  borderRadius: "sm",
  px: "5",
  py: "4",
  textDecoration: "none",
  color: "text.primary",
  transition: "border-color 0.15s ease, transform 0.15s ease",
  _hover: { borderColor: "sunbeam.orange", transform: "translateY(-1px)" },
});

const repoRow = css({ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "4" });
const repoName = css({ display: "flex", alignItems: "baseline", gap: "2", minWidth: 0 });
const owner = css({ color: "text.muted", fontSize: "md" });
const name = css({ fontWeight: "bold", fontSize: "lg", color: "text.primary", truncate: true });
const issueCount = css({ color: "text.muted", fontSize: "sm", whiteSpace: "nowrap", flexShrink: 0 });
const repoMeta = css({ display: "flex", alignItems: "baseline", gap: "3", flexShrink: 0 });
const langChip = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "1.5",
  fontSize: "xs",
  fontWeight: "bold",
  color: "text.secondary",
  whiteSpace: "nowrap",
});
const langDot = css({ width: "2.5", height: "2.5", borderRadius: "full", bg: "sunbeam.orange", flexShrink: 0 });
const tagline = css({
  gridColumn: { lg: "1 / -1" },
  fontSize: { base: "md", md: "lg" },
  color: "text.secondary",
  lineHeight: "1.5",
  marginTop: { base: "4", lg: "6" },
  paddingTop: "6",
  borderTopWidth: "1px",
  borderTopStyle: "solid",
  borderColor: "border.default",
});
const taglineLink = css({ color: "sunbeam.orange", fontWeight: "bold", textDecoration: "none", _hover: { textDecoration: "underline" } });

const dashed = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: "1px",
  borderStyle: "dashed",
  borderColor: "sunshine.300",
  borderRadius: "sm",
  px: "5",
  py: "4",
  color: "sunshine.900",
  fontStyle: "italic",
  textDecoration: "none",
  transition: "all 0.15s ease",
  _hover: { borderColor: "sunbeam.orange", color: "sunbeam.orange", bg: "accent.06" },
});

const issueHead = css({ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "3", marginBottom: "2" });
const issueRepo = css({ fontSize: "sm", color: "text.secondary" });
const issueTitle = css({ fontFamily: "heading", fontWeight: "bold", fontSize: "lg", color: "text.primary", marginBottom: "1" });
const issueBody = css({
  fontSize: "sm",
  color: "text.secondary",
  lineClamp: "2",
});

export default function RepoList() {
  const { repos, issues } = useLoaderData<typeof loader>();
  const defaultRepo = repos[0]?.name;
  return (
    <main className={page}>
      <section className={column} aria-labelledby="repos-heading">
        <h1 id="repos-heading" className={heading}>Repositories</h1>
        {repos.map((repo) => (
          <Link key={repo.id} to={`/r/${encodeURIComponent(repo.name)}`} className={card}>
            <div className={repoRow}>
              <span className={repoName}>
                <span className={owner}>{repo.owner} /</span>
                <span className={name}>{repo.name}</span>
              </span>
              <span className={repoMeta}>
                {repo.language ? (
                  <span className={langChip}><span className={langDot} />{repo.language}</span>
                ) : null}
                <span className={issueCount}>
                  {repo.openIssues} {repo.openIssues === 1 ? "issue" : "issues"}
                </span>
              </span>
            </div>
          </Link>
        ))}
        <Link to="/new" className={dashed}>New repository</Link>
      </section>

      <section className={column} aria-labelledby="issues-heading">
        <h1 id="issues-heading" className={heading}>Issue reports</h1>
        {issues.map((issue) => (
          <Link
            key={issue.id}
            to={`/r/${encodeURIComponent(issue.repoName)}`}
            className={card}
          >
            <div className={issueHead}>
              <span className={issueRepo}>{issue.owner} / {issue.repoName}</span>
              <Badge variant="premier">OPEN</Badge>
            </div>
            <div className={issueTitle}>{issue.title}</div>
            {issue.body ? <p className={issueBody}>{issue.body}</p> : null}
          </Link>
        ))}
        {defaultRepo ? (
          <Link to={`/r/${encodeURIComponent(defaultRepo)}/issues/new`} className={dashed}>
            New issue report
          </Link>
        ) : null}
      </section>
      <p className={tagline}>
        Witness, the Sunbeam forge for the Lore VCS. Lore by Epic Games. Design by{" "}
        <a href="https://rmv.fyi" className={taglineLink}>delphi</a>.
      </p>
    </main>
  );
}
