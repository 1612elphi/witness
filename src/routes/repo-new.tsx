import { useState } from "react";
import { Form, Link, redirect, useActionData, useNavigation } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { Button, Select } from "@sunbeam/beam-ui";
import { css } from "styled-system/css";
import { forge } from "../lib/forge/index.ts";

const LICENSE_OPTIONS = [
  { value: "", label: "No license" },
  { value: "0BSD", label: "Zero-Clause BSD" },
  { value: "MIT", label: "MIT" },
  { value: "AGPL-3.0", label: "AGPL 3.0" },
  { value: "Apache-2.0", label: "Apache 2.0" },
];

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  if (!name) return { error: "Name required" };
  try {
    const repo = await forge.createRepository({
      name,
      description: String(form.get("description") ?? "").trim() || undefined,
      defaultBranchName: String(form.get("defaultBranch") ?? "").trim() || undefined,
      license: String(form.get("license") ?? "").trim() || undefined,
      creator: "you",
    });
    return redirect(`/r/${encodeURIComponent(repo.name)}`);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Create failed" };
  }
}

/* ---- styles ---- */
const wrap = css({ px: { base: "4", md: "8" }, py: { base: "8", md: "10" }, maxWidth: "40rem", marginX: "auto", width: "100%" });
const crumb = css({ fontSize: "sm", color: "text.secondary", textDecoration: "none", _hover: { color: "sunbeam.orange" } });
const title = css({ fontFamily: "heading", fontWeight: "bold", fontSize: "3xl", marginTop: "2", marginBottom: "6" });

const cardForm = css({
  display: "flex",
  flexDirection: "column",
  gap: "5",
  bg: "bg.card",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border.subtle",
  borderRadius: "sm",
  p: { base: "5", md: "6" },
});

const field = css({ display: "flex", flexDirection: "column", gap: "1.5" });
const label = css({ fontSize: "sm", fontWeight: "bold", color: "text.secondary" });
const inputBase = {
  bg: "bg.page",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border.default",
  borderRadius: "sm",
  px: "3",
  py: "2",
  color: "text.primary",
  fontSize: "md",
  width: "100%",
  _focus: { outline: "none", borderColor: "sunbeam.orange" },
  _placeholder: { color: "text.muted" },
} as const;
const input = css(inputBase);
const textarea = css({ ...inputBase, resize: "vertical", minHeight: "20" });

const nameControl = css({
  display: "flex",
  alignItems: "stretch",
  bg: "bg.page",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border.default",
  borderRadius: "sm",
  overflow: "hidden",
  _focusWithin: { borderColor: "sunbeam.orange" },
});
const ownerPart = css({ display: "flex", alignItems: "center", px: "3", color: "text.muted", bg: "accent.06", whiteSpace: "nowrap", fontWeight: "bold" });
const nameInput = css({ flex: "1", border: "none", outline: "none", bg: "transparent", px: "3", py: "2", color: "text.primary", fontSize: "md", fontWeight: "bold", _placeholder: { color: "text.muted", fontWeight: "normal" } });

const errorText = css({ color: "sunbeam.orange", fontSize: "sm", fontWeight: "bold" });
const actions = css({ display: "flex", alignItems: "center", gap: "3", marginTop: "1" });
const cancel = css({ color: "text.secondary", textDecoration: "none", fontSize: "sm", _hover: { color: "sunbeam.orange" } });

export default function RepoNew() {
  const data = useActionData<typeof action>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  const [license, setLicense] = useState("");

  return (
    <main className={wrap}>
      <Link to="/" className={crumb}>Repositories</Link>
      <h1 className={title}>New repository</h1>
      <Form method="post" className={cardForm}>
        <div className={field}>
          <label className={label} htmlFor="name">Repository name</label>
          <div className={nameControl}>
            <span className={ownerPart}>delphi /</span>
            <input className={nameInput} id="name" name="name" placeholder="my-project" autoFocus autoComplete="off" />
          </div>
        </div>

        <div className={field}>
          <label className={label} htmlFor="description">Description</label>
          <textarea className={textarea} id="description" name="description" rows={3} />
        </div>

        <div className={field}>
          <label className={label} htmlFor="defaultBranch">Default branch</label>
          <input className={input} id="defaultBranch" name="defaultBranch" defaultValue="main" autoComplete="off" />
        </div>

        <div className={field}>
          <label className={label} htmlFor="license">License</label>
          <Select
            options={LICENSE_OPTIONS}
            value={license}
            onChange={setLicense}
            placeholder="License"
          />
          <input type="hidden" name="license" value={license} />
        </div>

        {data?.error ? <p className={errorText}>{data.error}</p> : null}

        <div className={actions}>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create repository"}
          </Button>
          <Link to="/" className={cancel}>Cancel</Link>
        </div>
      </Form>
    </main>
  );
}
