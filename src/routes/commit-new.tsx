import { Form, Link, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Button } from "@sunbeam/beam-ui";
import { css } from "styled-system/css";
import { forge } from "../lib/forge/index.ts";
import { decodeRef, requireRepo } from "./util.ts";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const repo = await requireRepo(params.repo);
  const ref = decodeRef(params.ref);
  const branch = await forge.getBranch(repo.id, ref);
  if (!branch) throw new Response(null, { status: 404 });
  const editPath = new URL(request.url).searchParams.get("path") ?? "";
  const existing = editPath ? await forge.readFile(repo.id, branch.name, editPath) : null;
  const initialText = existing && !existing.binary ? (existing.text ?? "") : "";
  return { repo, branch, editPath, initialText };
}

export async function action({ params, request }: ActionFunctionArgs) {
  const repo = await requireRepo(params.repo);
  const ref = decodeRef(params.ref);
  const branch = await forge.getBranch(repo.id, ref);
  if (!branch) throw new Response(null, { status: 404 });
  const form = await request.formData();
  const path = String(form.get("path") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();
  if (!path || !message) return { error: "Path and message required" };
  const revision = await forge.commit(repo.id, branch.id, {
    message,
    creator: "you",
    edits: [{ path, content: String(form.get("content") ?? "") }],
  });
  return redirect(`/r/${encodeURIComponent(repo.name)}/commit/${encodeURIComponent(revision.signature)}`);
}

const wrap = css({ px: { base: "4", md: "8" }, py: { base: "8", md: "10" }, maxWidth: "52rem", marginX: "auto", width: "100%" });
const crumb = css({ fontSize: "sm", color: "text.secondary", textDecoration: "none", _hover: { color: "sunbeam.orange" } });
const title = css({ fontFamily: "heading", fontWeight: "bold", fontSize: "3xl", marginTop: "2" });
const branchLine = css({ fontFamily: "mono", fontSize: "sm", color: "text.muted", marginBottom: "6" });
const cardForm = css({ display: "flex", flexDirection: "column", gap: "5", bg: "bg.card", borderWidth: "1px", borderStyle: "solid", borderColor: "border.subtle", borderRadius: "sm", p: { base: "5", md: "6" } });
const field = css({ display: "flex", flexDirection: "column", gap: "1.5" });
const label = css({ fontSize: "sm", fontWeight: "bold", color: "text.secondary" });
const control = css({ bg: "bg.page", borderWidth: "1px", borderStyle: "solid", borderColor: "border.default", borderRadius: "sm", px: "3", py: "2", color: "text.primary", fontSize: "md", width: "100%", _focus: { outline: "none", borderColor: "sunbeam.orange" }, _placeholder: { color: "text.muted" } });
const codeArea = css({ bg: "bg.page", borderWidth: "1px", borderStyle: "solid", borderColor: "border.default", borderRadius: "sm", px: "3", py: "2", color: "text.primary", fontFamily: "mono", fontSize: "13px", lineHeight: "1.6", width: "100%", minHeight: "64", resize: "vertical", _focus: { outline: "none", borderColor: "sunbeam.orange" } });
const errorText = css({ color: "sunbeam.orange", fontSize: "sm", fontWeight: "bold" });
const actions = css({ display: "flex", alignItems: "center", gap: "3" });
const cancel = css({ color: "text.secondary", textDecoration: "none", fontSize: "sm", _hover: { color: "sunbeam.orange" } });

export default function CommitNew() {
  const { repo, branch, editPath, initialText } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  const base = `/r/${encodeURIComponent(repo.name)}`;

  return (
    <main className={wrap}>
      <Link to={base} className={crumb}>{repo.owner}/{repo.name}</Link>
      <h1 className={title}>New commit</h1>
      <p className={branchLine}>on {branch.name}</p>
      <Form method="post" className={cardForm}>
        <div className={field}>
          <label className={label} htmlFor="path">Path</label>
          <input className={control} id="path" name="path" defaultValue={editPath} placeholder="src/app.tsx" autoComplete="off" autoFocus={!editPath} />
        </div>
        <div className={field}>
          <label className={label} htmlFor="content">Content</label>
          <textarea className={codeArea} id="content" name="content" rows={14} defaultValue={initialText} />
        </div>
        <div className={field}>
          <label className={label} htmlFor="message">Commit message</label>
          <input className={control} id="message" name="message" placeholder="Add landing page" autoComplete="off" autoFocus={!!editPath} />
        </div>
        <div className={actions}>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? "Committing…" : "Commit"}
          </Button>
          <Link to={base} className={cancel}>Cancel</Link>
        </div>
        {data?.error ? <p className={errorText}>{data.error}</p> : null}
      </Form>
    </main>
  );
}
