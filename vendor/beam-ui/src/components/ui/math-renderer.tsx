import { css, cx } from "../../system.ts";

import { type ReactNode, useEffect, useMemo, useState } from "react";

/** Props for {@link MathRenderer}. */
export interface MathRendererProps {
  /** LaTeX math string (e.g., `"E = mc^2"`, `"\\int_0^\\infty e^{-x^2} dx"`). */
  math: string;
  /** If true, renders as block (centered, full-width). Defaults to `false` (inline). */
  display?: boolean;
  /** Optional CSS class for the container. */
  className?: string;
}

let katexModule: typeof import("katex") | null = null;
let katexCssLoaded = false;

/**
 * Renders LaTeX math expressions using KaTeX (lazy-loaded on first use).
 * Supports both inline and display (block) modes with automatic error fallback to code rendering.
 *
 * @example
 * ```tsx
 * <MathRenderer math="E = mc^2" />
 * <MathRenderer math="\\int_0^\\infty e^{-x^2} dx" display />
 * ```
 */
export function MathRenderer(
  { math, display = false, className }: MathRendererProps,
): ReactNode {
  const [ready, setReady] = useState(!!katexModule);

  useEffect(() => {
    if (katexModule) return;
    Promise.all([
      import("katex"),
      katexCssLoaded
        ? Promise.resolve()
        // deno-lint-ignore no-explicit-any
        : import("katex/dist/katex.min.css" as any).then(() => {
          katexCssLoaded = true;
        }),
    ]).then(([mod]) => {
      katexModule = mod;
      setReady(true);
    });
  }, []);

  const rendered = useMemo(() => {
    if (!katexModule) return { html: "", error: false };
    try {
      return {
        html: katexModule.default.renderToString(math, {
          displayMode: display,
          throwOnError: false,
        }),
        error: false,
      };
    } catch {
      return { html: "", error: true };
    }
  }, [math, display, ready]);

  if (rendered.error) {
    return (
      <span className={cx(errorStyle, className)}>
        {math}
      </span>
    );
  }

  if (display) {
    // KaTeX renderToString produces safe HTML from LaTeX math input (no raw user HTML).
    return (
      <div
        className={cx(displayStyle, className)}
        dangerouslySetInnerHTML={{ __html: rendered.html }}
      />
    );
  }

  // KaTeX renderToString produces safe HTML from LaTeX math input (no raw user HTML).
  return (
    <span
      className={cx(inlineStyle, className)}
      dangerouslySetInnerHTML={{ __html: rendered.html }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */
const displayStyle = css({
  display: "block",
  textAlign: "center",
  py: "6",
  px: "4",
  overflowX: "auto",
});

const inlineStyle = css({
  display: "inline",
});

const errorStyle = css({
  fontFamily: "mono",
  fontSize: "13",
  color: "sunbeam.orange",
  py: "1",
  px: "2",
  border: "1px solid",
  borderColor: "sunbeam.orange",
  backgroundColor: "accent.06",
});
