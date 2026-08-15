import { css, cx, token } from "../../system.ts";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { useTheme } from "../../hooks/use-theme.ts";
import type { Highlighter } from "shiki";

/** Props for {@link SyntaxHighlighter}. */
export interface SyntaxHighlighterProps {
  /** Source code string to highlight. */
  code: string;
  /** Language identifier (e.g., "javascript", "python", "rust"). */
  language: string;
  /** Theme override. Defaults to theme from `useTheme()`. */
  theme?: "light" | "dark";
  /** Show line numbers in a gutter. Defaults to `false`. */
  showLineNumbers?: boolean;
  /** Array of 1-based line numbers to highlight (e.g., `[1, 3, 5]`). */
  highlightLines?: number[];
  /** Additional CSS class. */
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Lazy singleton highlighter                                          */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* Custom Beam themes for Shiki                                        */
/* ------------------------------------------------------------------ */

const BEAM_DARK = {
  name: "beam-dark",
  type: "dark" as const,
  colors: {
    "editor.background": token.var("colors.card.dark"),
    "editor.foreground": token.var("colors.code.text"),
  },
  settings: [
    { settings: { foreground: token.var("colors.code.text") } }, // default text
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: {
        foreground: token.var("colors.chrome.35"),
        fontStyle: "italic",
      },
    },
    {
      scope: ["keyword", "storage.type", "storage.modifier"],
      settings: { foreground: token.var("colors.syn.keyword") },
    }, // syn.keyword — purple
    {
      scope: ["entity.name.function", "support.function", "meta.function-call"],
      settings: { foreground: token.var("colors.syn.fn") },
    }, // syn.fn — blue
    {
      scope: ["string", "string.quoted"],
      settings: { foreground: token.var("colors.syn.string") },
    }, // syn.string — green
    {
      scope: [
        "variable.other.property",
        "entity.name.tag",
        "support.type.property-name",
      ],
      settings: { foreground: token.var("colors.syn.prop") },
    }, // syn.prop — orange
    {
      scope: ["constant.numeric", "constant.language"],
      settings: { foreground: token.var("colors.syn.number") },
    }, // syn.number — deeper orange
    {
      scope: ["support.class", "entity.name.type", "storage.type.builtin"],
      settings: { foreground: token.var("colors.syn.builtin") },
    }, // syn.builtin — yellow
    {
      scope: ["variable", "variable.other"],
      settings: { foreground: "#e2e8f0" },
    }, // no token counterpart — dark-variable slate
    {
      scope: ["punctuation", "meta.brace"],
      settings: { foreground: token.var("colors.chrome.50") },
    },
    {
      scope: ["entity.name.class", "entity.name.type.class"],
      settings: { foreground: token.var("colors.syn.builtin") },
    },
    {
      scope: ["constant.other", "variable.other.constant"],
      settings: { foreground: token.var("colors.syn.number") },
    },
    {
      scope: ["keyword.operator"],
      settings: { foreground: token.var("colors.sunshine.700") },
    }, // sunshine.700
    {
      scope: ["meta.decorator", "punctuation.decorator"],
      settings: { foreground: token.var("colors.sunshine.300") },
    }, // sunshine.300
    {
      scope: ["markup.heading"],
      settings: {
        foreground: token.var("colors.sunbeam.orange"),
        fontStyle: "bold",
      },
    }, // sunbeam.orange
    { scope: ["markup.bold"], settings: { fontStyle: "bold" } },
    { scope: ["markup.italic"], settings: { fontStyle: "italic" } },
    {
      scope: ["markup.inline.raw", "markup.fenced_code"],
      settings: { foreground: token.var("colors.syn.string") },
    },
  ],
};

const BEAM_LIGHT = {
  name: "beam-light",
  type: "light" as const,
  colors: {
    "editor.background": "#fff0c2",
    "editor.foreground": "#1f1f1f",
  },
  settings: [
    { settings: { foreground: "#1f1f1f" } },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#7f6315", fontStyle: "italic" },
    },
    {
      scope: ["keyword", "storage.type", "storage.modifier"],
      settings: { foreground: "#7c3aed" },
    }, // darker purple for light bg
    {
      scope: ["entity.name.function", "support.function", "meta.function-call"],
      settings: { foreground: "#2563eb" },
    }, // darker blue
    { scope: ["string", "string.quoted"], settings: { foreground: "#16a34a" } }, // darker green
    {
      scope: [
        "variable.other.property",
        "entity.name.tag",
        "support.type.property-name",
      ],
      settings: { foreground: "#c2410c" },
    }, // darker orange
    {
      scope: ["constant.numeric", "constant.language"],
      settings: { foreground: "#ea580c" },
    },
    {
      scope: ["support.class", "entity.name.type", "storage.type.builtin"],
      settings: { foreground: "#a16207" },
    }, // darker yellow/gold
    {
      scope: ["variable", "variable.other"],
      settings: { foreground: "#1f1f1f" },
    },
    {
      scope: ["punctuation", "meta.brace"],
      settings: { foreground: "#7f6315" },
    },
    {
      scope: ["entity.name.class", "entity.name.type.class"],
      settings: { foreground: "#a16207" },
    },
    {
      scope: ["constant.other", "variable.other.constant"],
      settings: { foreground: "#ea580c" },
    },
    { scope: ["keyword.operator"], settings: { foreground: "#b45309" } },
    {
      scope: ["meta.decorator", "punctuation.decorator"],
      settings: { foreground: "#a16207" },
    },
    {
      scope: ["markup.heading"],
      settings: { foreground: "#fa520f", fontStyle: "bold" },
    },
    { scope: ["markup.bold"], settings: { fontStyle: "bold" } },
    { scope: ["markup.italic"], settings: { fontStyle: "italic" } },
    {
      scope: ["markup.inline.raw", "markup.fenced_code"],
      settings: { foreground: "#16a34a" },
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Lazy singleton highlighter                                          */
/* ------------------------------------------------------------------ */
let highlighterPromise: Promise<Highlighter> | null = null;

function getOrCreateHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = import("shiki").then(({ createHighlighter }) => {
      return createHighlighter({
        themes: [BEAM_DARK, BEAM_LIGHT],
        langs: [
          "javascript",
          "typescript",
          "python",
          "rust",
          "go",
          "java",
          "json",
          "html",
          "css",
          "bash",
          "markdown",
          "tsx",
          "jsx",
          "sql",
          "yaml",
          "xml",
          "cpp",
          "c",
          "ruby",
          "php",
        ],
      });
    });
  }
  return highlighterPromise;
}

/**
 * Syntax highlighter using Shiki with beam-branded light/dark themes.
 * Supports 19+ languages, optional line numbers, and per-line highlighting.
 * Falls back to plain text while loading.
 *
 * @example
 * ```tsx
 * <SyntaxHighlighter
 *   code="const x = 42;"
 *   language="javascript"
 *   showLineNumbers
 *   highlightLines={[1]}
 *   theme="dark"
 * />
 * ```
 */
export function SyntaxHighlighter({
  code,
  language,
  theme: themeProp,
  showLineNumbers = false,
  highlightLines = [],
  className,
}: SyntaxHighlighterProps): ReactNode {
  const { theme: currentTheme } = useTheme();
  const resolvedTheme = themeProp ?? currentTheme;
  const [html, setHtml] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    getOrCreateHighlighter().then((highlighter) => {
      if (cancelled) return;

      const shikiTheme = resolvedTheme === "dark" ? "beam-dark" : "beam-light";

      try {
        const result = highlighter.codeToHtml(code, {
          lang: language,
          theme: shikiTheme,
        });
        setHtml(result);
      } catch {
        // If the language isn't loaded, fall back to plain text
        setHtml(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [code, language, resolvedTheme]);

  const lines = code.split("\n");
  const highlightSet = new Set(highlightLines);

  /* Fallback: plain text while loading */
  if (!html) {
    return (
      <div className={cx(wrapper, className)}>
        <pre className={fallbackPre}>
          {showLineNumbers ? (
            <table className={lineTable}>
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i} className={highlightSet.has(i + 1) ? highlightRow : undefined}>
                    <td className={gutterCell}>{i + 1}</td>
                    <td className={codeCell}>{line}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>
    );
  }

  /* Highlighted output — no line numbers or line highlighting needed */
  if (!showLineNumbers && highlightLines.length === 0) {
    // Shiki output is generated from the user-provided `code` string, not from
    // untrusted external HTML. The content is safe to render.
    return (
      <div
        className={cx(wrapper, shikiWrapper, className)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  /* With line numbers or line highlighting — parse the HTML and wrap lines */
  return (
    <div className={cx(wrapper, shikiWrapper, className)}>
      <div
        ref={containerRef}
        style={{ display: "none" }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <pre className={fallbackPre}>
        <table className={lineTable}>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className={highlightSet.has(i + 1) ? highlightRow : undefined}>
                {showLineNumbers && <td className={gutterCell}>{i + 1}</td>}
                <td className={codeCell}>
                  <LineFromHtml html={html} lineIndex={i} fallback={line} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Helper: extract a single line from Shiki HTML output                */
/* ------------------------------------------------------------------ */
function LineFromHtml(
  { html, lineIndex, fallback }: {
    html: string;
    lineIndex: number;
    fallback: string;
  },
) {
  const [lineHtml, setLineHtml] = useState<string | null>(null);

  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const codeEl = doc.querySelector("code");
    if (!codeEl) return;

    const lineEls = codeEl.querySelectorAll(".line");
    if (lineEls.length > 0 && lineEls[lineIndex]) {
      setLineHtml(lineEls[lineIndex].innerHTML);
    } else {
      const allLines = codeEl.innerHTML.split("\n");
      if (allLines[lineIndex] !== undefined) {
        setLineHtml(allLines[lineIndex]);
      }
    }
  }, [html, lineIndex]);

  if (lineHtml) {
    // Content originates from Shiki's codeToHtml which processes the code
    // string through a syntax grammar — it does not pass through arbitrary HTML.
    return <span dangerouslySetInnerHTML={{ __html: lineHtml }} />;
  }
  return <span>{fallback}</span>;
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const wrapper = css({
  backgroundColor: "bg.card",
  border: "1px solid",
  borderColor: "border.default",
  borderRadius: "0",
  overflowX: "auto",
  fontFamily: "mono",
  fontSize: "sm",
  lineHeight: 1.7,
});

const shikiWrapper = css({
  "& pre": {
    margin: 0,
    padding: "5",
    backgroundColor: "transparent !important",
    fontFamily: "mono",
  },
  "& code": {
    fontFamily: "mono",
  },
});

const fallbackPre = css({
  margin: 0,
  padding: "5",
  fontFamily: "mono",
  fontSize: "sm",
  lineHeight: 1.7,
  color: "text.primary",
  whiteSpace: "pre",
});

const lineTable = css({
  borderCollapse: "collapse",
  width: "100%",
  fontFamily: "mono",
});

const gutterCell = css({
  width: "0.25",
  whiteSpace: "nowrap",
  paddingRight: "4",
  textAlign: "right",
  userSelect: "none",
  color: "text.muted",
  fontSize: "xs",
  verticalAlign: "top",
  opacity: 0.5,
});

const codeCell = css({
  whiteSpace: "pre",
  paddingLeft: "2",
});

const highlightRow = css({
  backgroundColor: "accent.08",
});
