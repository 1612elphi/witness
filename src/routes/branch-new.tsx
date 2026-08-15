import { Form, Link, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Button } from "@sunbeam/beam-ui";
import { css } from "styled-system/css";
import { forge } from "../lib/forge/index.ts";
import { requireRepo } from "./util.ts";

export async function loader({ params }: LoaderFunctionArgs) {
  const repo = await requireRepo(params.repo);
  const branches = await forge.listBranches(repo.id);
  return { repo, branches };
}

export async function action({ params, request }: ActionFunctionArgs) {
  const repo = await requireRepo(params.repo);
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const fromBranchId = String(form.get("fromBranchId") ?? "").trim();
  if (!name || !fromBranchId) return { error: "Name required" };
  try {
    await forge.createBranch(repo.id, {
      name,
      fromBranchId,
      category: String(form.get("category") ?? "").trim() || undefined,
      creator: "you",
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Create failed" };
  }
  return redirect(`/r/${encodeURIComponent(repo.name)}/branches`);
}

const wrap = css({ px: { base: "4", md: "8" }, py: { base: "8", md: "10" }, maxWidth: "40rem", marginX: "auto", width: "100%" });
const crumb = css({ fontSize: "sm", color: "text.secondary", textDecoration: "none", _hover: { color: "sunbeam.orange" } });
const title = css({ fontFamily: "heading", fontWeight: "bold", fontSize: "3xl", marginTop: "2", marginBottom: "6" });
const cardForm = css({ display: "flex", flexDirection: "column", gap: "5", bg: "bg.card", borderWidth: "1px", borderStyle: "solid", borderColor: "border.subtle", borderRadius: "sm", p: { base: "5", md: "6" } });
const field = css({ display: "flex", flexDirection: "column", gap: "1.5" });
const label = css({ fontSize: "sm", fontWeight: "bold", color: "text.secondary" });
const control = css({ bg: "bg.page", borderWidth: "1px", borderStyle: "solid", borderColor: "border.default", borderRadius: "sm", px: "3", py: "2", color: "text.primary", fontSize: "md", width: "100%", _focus: { outline: "none", borderColor: "sunbeam.orange" }, _placeholder: { color: "text.muted" } });
const errorText = css({ color: "sunbeam.orange", fontSize: "sm", fontWeight: "bold" });
const actions = css({ display: "flex", alignItems: "center", gap: "3" });
const cancel = css({ color: "text.secondary", textDecoration: "none", fontSize: "sm", _hover: { color: "sunbeam.orange" } });

export default function BranchNew() {
  const { repo, branches } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  const base = `/r/${encodeURIComponent(repo.name)}`;

  return (
    <main className={wrap}>
      <Link to={`${base}/branches`} className={crumb}>{repo.owner}/{repo.name} · branches</Link>
      <h1 className={title}>New branch</h1>
      <Form method="post" className={cardForm}>
        <div className={field}>
          <label className={label} htmlFor="name">Branch name</label>
          <input className={control} id="name" name="name" placeholder="feature/new-thing" autoFocus autoComplete="off" />
        </div>
        <div className={field}>
          <label className={label} htmlFor="fromBranchId">Based on</label>
          <select className={control} id="fromBranchId" name="fromBranchId" defaultValue={repo.defaultBranchId}>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </div>
        <div className={field}>
          <label className={label} htmlFor="category">Category</label>
          <input className={control} id="category" name="category" placeholder="feature" autoComplete="off" />
        </div>
        <div className={actions}>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create branch"}
          </Button>
          <Link to={`${base}/branches`} className={cancel}>Cancel</Link>
        </div>
        {data?.error ? <p className={errorText}>{data.error}</p> : null}
      </Form>
    </main>
  );
}
