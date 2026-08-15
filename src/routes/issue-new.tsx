import { Form, Link, redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Button } from "@sunbeam/beam-ui";
import { css } from "styled-system/css";
import { forge } from "../lib/forge/index.ts";

export async function loader({ params }: LoaderFunctionArgs) {
  const repo = await forge.getRepository(params.repo!);
  if (!repo) throw new Response(null, { status: 404 });
  return { repo };
}

export async function action({ params, request }: ActionFunctionArgs) {
  const repo = await forge.getRepository(params.repo!);
  if (!repo) throw new Response(null, { status: 404 });
  const form = await request.formData();
  const title = String(form.get("title") ?? "").trim();
  const body = String(form.get("body") ?? "").trim();
  if (!title) return { error: "title-required" };
  await forge.createIssue(repo.id, { title, body, author: "you" });
  return redirect(`/r/${encodeURIComponent(repo.name)}`);
}

const wrap = css({ px: { base: "4", md: "8" }, py: "8", maxWidth: "42rem", marginX: "auto", width: "100%" });
const title = css({ fontFamily: "heading", fontWeight: "bold", fontSize: "2xl", marginBottom: "4" });
const crumb = css({ color: "text.secondary", textDecoration: "none", _hover: { color: "sunbeam.orange" } });
const field = css({ display: "flex", flexDirection: "column", gap: "1", marginBottom: "4" });
const label = css({ fontSize: "sm", fontWeight: "bold", color: "text.secondary" });
const input = css({
  bg: "bg.card",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border.default",
  borderRadius: "sm",
  px: "3",
  py: "2",
  color: "text.primary",
  fontSize: "md",
  _focus: { outline: "none", borderColor: "sunbeam.orange" },
});

export default function IssueNew() {
  const { repo } = useLoaderData<typeof loader>();
  return (
    <main className={wrap}>
      <p>
        <Link to={`/r/${encodeURIComponent(repo.name)}`} className={crumb}>
          {repo.owner}/{repo.name}
        </Link>
      </p>
      <h1 className={title}>New issue</h1>
      <Form method="post">
        <div className={field}>
          <label className={label} htmlFor="title">Title</label>
          <input className={input} id="title" name="title" placeholder="Short summary of the issue" autoFocus />
        </div>
        <div className={field}>
          <label className={label} htmlFor="body">Description</label>
          <textarea className={input} id="body" name="body" rows={6} />
        </div>
        <Button variant="primary" type="submit">Create</Button>
      </Form>
    </main>
  );
}
