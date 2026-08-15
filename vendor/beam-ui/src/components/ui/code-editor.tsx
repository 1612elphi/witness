import { css, cx, token } from "../../system.ts";

import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { EditorState, type Extension } from "@codemirror/state";
import {
  EditorView,
  highlightActiveLine,
  keymap,
  lineNumbers,
  placeholder as cmPlaceholder,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { HighlightStyle, indentOnInput, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { searchKeymap } from "@codemirror/search";
import { useTheme } from "../../hooks/use-theme.ts";

/* Beam syntax highlighting — matches syn.* tokens */
const beamHighlightDark = HighlightStyle.define([
  { tag: tags.keyword, color: token.var("colors.syn.keyword") }, // syn.keyword — purple
  { tag: tags.controlKeyword, color: token.var("colors.syn.keyword") },
  { tag: tags.operatorKeyword, color: token.var("colors.syn.keyword") },
  { tag: tags.definitionKeyword, color: token.var("colors.syn.keyword") },
  { tag: tags.moduleKeyword, color: token.var("colors.syn.keyword") },
  { tag: tags.function(tags.variableName), color: token.var("colors.syn.fn") }, // syn.fn — blue
  {
    tag: tags.function(tags.definition(tags.variableName)),
    color: token.var("colors.syn.fn"),
  },
  { tag: tags.string, color: token.var("colors.syn.string") }, // syn.string — green
  { tag: tags.special(tags.string), color: token.var("colors.syn.string") },
  { tag: tags.propertyName, color: token.var("colors.syn.prop") }, // syn.prop — orange
  { tag: tags.number, color: token.var("colors.syn.number") }, // syn.number — deeper orange
  { tag: tags.bool, color: token.var("colors.syn.number") },
  { tag: tags.null, color: token.var("colors.syn.number") },
  { tag: tags.typeName, color: token.var("colors.syn.builtin") }, // syn.builtin — yellow
  { tag: tags.className, color: token.var("colors.syn.builtin") },
  { tag: tags.standard(tags.typeName), color: token.var("colors.syn.builtin") },
  {
    tag: tags.comment,
    color: token.var("colors.chrome.35"),
    fontStyle: "italic",
  },
  {
    tag: tags.lineComment,
    color: token.var("colors.chrome.35"),
    fontStyle: "italic",
  },
  {
    tag: tags.blockComment,
    color: token.var("colors.chrome.35"),
    fontStyle: "italic",
  },
  { tag: tags.operator, color: token.var("colors.sunshine.700") },
  { tag: tags.punctuation, color: token.var("colors.chrome.50") },
  { tag: tags.variableName, color: "#e2e8f0" }, // no token counterpart — dark-variable slate
  { tag: tags.regexp, color: token.var("colors.syn.number") },
  { tag: tags.tagName, color: token.var("colors.syn.prop") },
  { tag: tags.attributeName, color: token.var("colors.syn.fn") },
  { tag: tags.attributeValue, color: token.var("colors.syn.string") },
  {
    tag: tags.heading,
    color: token.var("colors.sunbeam.orange"),
    fontWeight: "bold",
  },
  { tag: tags.strong, fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
]);

const beamHighlightLight = HighlightStyle.define([
  { tag: tags.keyword, color: "#7c3aed" },
  { tag: tags.controlKeyword, color: "#7c3aed" },
  { tag: tags.operatorKeyword, color: "#7c3aed" },
  { tag: tags.definitionKeyword, color: "#7c3aed" },
  { tag: tags.moduleKeyword, color: "#7c3aed" },
  { tag: tags.function(tags.variableName), color: "#2563eb" },
  { tag: tags.function(tags.definition(tags.variableName)), color: "#2563eb" },
  { tag: tags.string, color: "#16a34a" },
  { tag: tags.special(tags.string), color: "#16a34a" },
  { tag: tags.propertyName, color: "#c2410c" },
  { tag: tags.number, color: "#ea580c" },
  { tag: tags.bool, color: "#ea580c" },
  { tag: tags.null, color: "#ea580c" },
  { tag: tags.typeName, color: "#a16207" },
  { tag: tags.className, color: "#a16207" },
  { tag: tags.standard(tags.typeName), color: "#a16207" },
  { tag: tags.comment, color: "#7f6315", fontStyle: "italic" },
  { tag: tags.lineComment, color: "#7f6315", fontStyle: "italic" },
  { tag: tags.blockComment, color: "#7f6315", fontStyle: "italic" },
  { tag: tags.operator, color: "#b45309" },
  { tag: tags.punctuation, color: "#7f6315" },
  { tag: tags.variableName, color: "#1f1f1f" },
  { tag: tags.regexp, color: "#ea580c" },
  { tag: tags.tagName, color: "#c2410c" },
  { tag: tags.attributeName, color: "#2563eb" },
  { tag: tags.attributeValue, color: "#16a34a" },
  { tag: tags.heading, color: "#fa520f", fontWeight: "bold" },
  { tag: tags.strong, fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
]);

/** Props for {@link CodeEditor}. */
export interface CodeEditorProps {
  /** Controlled text value (the code being edited). */
  value: string;
  /** Callback fired when the user edits the code; receives the new text. */
  onChange: (value: string) => void;
  /** Language for syntax highlighting (e.g., "javascript", "typescript", "python", "rust"). Defaults to no highlighting. */
  language?: string;
  /** CSS height of the editor viewport. Defaults to `"300px"`. */
  height?: string;
  /** If true, the editor is read-only and cannot be modified. Defaults to false. */
  readOnly?: boolean;
  /** If true, line numbers are shown in the left gutter. Defaults to true. */
  showLineNumbers?: boolean;
  /** If true, long lines wrap instead of scrolling horizontally. Defaults to false. */
  softWrap?: boolean;
  /** Placeholder text shown when the editor is empty. */
  placeholder?: string;
  /** Extra CSS class names to apply to the root container. */
  className?: string;
  /** Extra CodeMirror extensions to append. Typed as unknown[] to avoid Extension symbol mismatch when the caller uses a different @codemirror/state instance (e.g. a file:-linked monorepo package). */
  extensions?: readonly unknown[];
}

/* ------------------------------------------------------------------ */
/* Language loading                                                     */
/* ------------------------------------------------------------------ */
async function loadLanguage(lang: string | undefined) {
  if (!lang) return null;

  const normalized = lang.toLowerCase();

  switch (normalized) {
    case "javascript":
    case "js": {
      const { javascript } = await import("@codemirror/lang-javascript");
      return javascript();
    }
    case "typescript":
    case "ts": {
      const { javascript } = await import("@codemirror/lang-javascript");
      return javascript({ typescript: true });
    }
    case "tsx": {
      const { javascript } = await import("@codemirror/lang-javascript");
      return javascript({ typescript: true, jsx: true });
    }
    case "jsx": {
      const { javascript } = await import("@codemirror/lang-javascript");
      return javascript({ jsx: true });
    }
    case "python":
    case "py": {
      const { python } = await import("@codemirror/lang-python");
      return python();
    }
    case "html": {
      const { html } = await import("@codemirror/lang-html");
      return html();
    }
    case "css": {
      const { css: cssLang } = await import("@codemirror/lang-css");
      return cssLang();
    }
    case "json": {
      const { json } = await import("@codemirror/lang-json");
      return json();
    }
    case "markdown":
    case "md": {
      const { markdown } = await import("@codemirror/lang-markdown");
      return markdown();
    }
    case "rust":
    case "rs": {
      const { rust } = await import("@codemirror/lang-rust");
      return rust();
    }
    case "go": {
      const { go } = await import("@codemirror/lang-go");
      return go();
    }
    case "java": {
      const { java } = await import("@codemirror/lang-java");
      return java();
    }
    case "cpp":
    case "c++":
    case "c": {
      const { cpp } = await import("@codemirror/lang-cpp");
      return cpp();
    }
    case "xml": {
      const { xml } = await import("@codemirror/lang-xml");
      return xml();
    }
    case "sql": {
      const { sql } = await import("@codemirror/lang-sql");
      return sql();
    }
    case "yaml":
    case "yml": {
      const { yaml } = await import("@codemirror/lang-yaml");
      return yaml();
    }
    case "php": {
      const { php } = await import("@codemirror/lang-php");
      return php();
    }
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* Custom CodeMirror theme using Beam tokens                           */
/* ------------------------------------------------------------------ */
function createBeamTheme(isDark: boolean) {
  const bg = isDark ? token.var("colors.card.dark") : token.var("colors.cream");
  // "#ffffff" has no token counterpart — pure white editor foreground
  const fg = isDark ? "#ffffff" : token.var("colors.sunbeam.black");
  // "#7f6315" has no token counterpart — intentional light-mode muted warm
  const muted = isDark ? token.var("colors.chrome.40") : "#7f6315";
  const mono = "'Monaspace Argon', 'SF Mono', 'Fira Code', monospace";

  return EditorView.theme(
    {
      "&": {
        backgroundColor: bg,
        color: fg,
        fontSize: token.var("fontSizes.13"),
        fontFamily: mono,
      },
      ".cm-content": {
        caretColor: token.var("colors.sunbeam.orange"),
        padding: `${token.var("spacing.3")} 0`,
      },
      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: token.var("colors.sunbeam.orange"),
        borderLeftWidth: "2px",
      },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
        backgroundColor: isDark ? token.var("colors.accent.20") : token.var("colors.accent.15"),
      },
      ".cm-activeLine": {
        // rgba(0,0,0,0.02) has no token counterpart — light-mode active-line wash
        backgroundColor: isDark ? token.var("colors.chrome.03") : "rgba(0, 0, 0, 0.02)",
      },
      ".cm-gutters": {
        // rgba(255,255,255,0.02) and rgba(0,0,0,0.02) have no token counterparts
        backgroundColor: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)",
        color: muted,
        border: "none",
        paddingRight: token.var("spacing.2"),
      },
      ".cm-activeLineGutter": {
        // rgba(0,0,0,0.04) has no token counterpart — light-mode active-gutter wash
        backgroundColor: isDark ? token.var("colors.chrome.05") : "rgba(0, 0, 0, 0.04)",
      },
      ".cm-lineNumbers .cm-gutterElement": {
        fontSize: token.var("fontSizes.xs"),
        minWidth: token.var("sizes.8"),
        padding: `0 ${token.var("spacing.1")} 0 ${token.var("spacing.2")}`,
      },
      ".cm-placeholder": {
        color: muted,
        fontStyle: "italic",
      },
      "&.cm-focused": {
        outline: "none",
      },
      ".cm-scroller": {
        fontFamily: mono,
        lineHeight: "1.6",
      },
    },
    { dark: isDark },
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * CodeMirror-based syntax-highlighting code editor with theme-aware Beam colors.
 *
 * Supports 15+ languages with smart indentation, search, history, line numbers, and soft wrapping.
 * Automatically responds to dark/light theme changes.
 *
 * @example
 * ```tsx
 * <CodeEditor
 *   value={code}
 *   onChange={setCode}
 *   language="typescript"
 *   height="400px"
 *   showLineNumbers
 * />
 * ```
 */
export function CodeEditor({
  value,
  onChange,
  language,
  height = "300px",
  readOnly = false,
  showLineNumbers = true,
  softWrap = false,
  placeholder,
  className,
  extensions,
}: CodeEditorProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const { theme } = useTheme();

  // Keep onChange ref fresh
  onChangeRef.current = onChange;

  const buildExtensions = useCallback(
    async () => {
      const isDark = theme === "dark";
      const exts = [
        createBeamTheme(isDark),
        syntaxHighlighting(isDark ? beamHighlightDark : beamHighlightLight),
        indentOnInput(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
        highlightActiveLine(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
      ];

      if (showLineNumbers) {
        exts.push(lineNumbers());
      }

      if (softWrap) {
        exts.push(EditorView.lineWrapping);
      }

      if (placeholder) {
        exts.push(cmPlaceholder(placeholder));
      }

      if (readOnly) {
        exts.push(EditorState.readOnly.of(true));
        exts.push(EditorView.editable.of(false));
      }

      const langExtension = await loadLanguage(language);
      if (langExtension) {
        exts.push(langExtension);
      }

      if (extensions?.length) exts.push(...(extensions as Extension[]));

      return exts;
    },
    [
      theme,
      showLineNumbers,
      softWrap,
      placeholder,
      readOnly,
      language,
      extensions,
    ],
  );

  // Create / recreate the editor when config changes
  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    (async () => {
      const extensions = await buildExtensions();
      if (cancelled || !containerRef.current) return;

      // Destroy previous view
      viewRef.current?.destroy();

      const state = EditorState.create({
        doc: value,
        extensions,
      });

      const view = new EditorView({
        state,
        parent: containerRef.current,
      });

      viewRef.current = view;
    })();

    return () => {
      cancelled = true;
      viewRef.current?.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildExtensions]);

  // Sync external value changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== value) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      role="textbox"
      aria-label={`Code editor${language ? ` (${language})` : ""}${readOnly ? " (read-only)" : ""}`}
      aria-multiline="true"
      aria-readonly={readOnly || undefined}
      className={cx(editorContainer, className)}
      style={{ height }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const editorContainer = css({
  border: "1px solid",
  borderColor: "border.default",
  overflow: "hidden",
  borderRadius: "0",
  "& .cm-editor": {
    height: "100%",
  },
  "& .cm-scroller": {
    overflow: "auto",
  },
});
