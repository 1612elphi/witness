import { css, cx } from "../../system.ts";

import { type ReactNode, useState } from "react";
import { TabContent, TabList, TabsRoot, TabTrigger } from "@ark-ui/react/tabs";
import { Icon } from "./icon.tsx";

/** Represents a single code tab. */
interface CodeTab {
  /** Tab label (e.g., "JavaScript", "Python"). */
  label: string;
  /** Content keyed by toggle combo (e.g., "Non-streaming|V2|Synchronous"). Falls back to "default" key if no exact match. */
  variants?: Record<string, ReactNode>;
  /** Static content when no variants are used. */
  content?: ReactNode;
}

/** Toggle control group for filtering code variants. */
interface ToggleGroup {
  /** Array of option strings (e.g., ["Streaming", "Non-streaming"]). */
  options: string[];
  /** Initially selected option. Defaults to first option. */
  defaultValue?: string;
}

/** Props for {@link CodeBlock}. */
export interface CodeBlockProps {
  /** Array of code tabs to display. */
  tabs: CodeTab[];
  /** Optional streaming mode toggle (appears in top bar). */
  streamToggle?: ToggleGroup;
  /** Optional version toggle (appears in controls bar as pill group). */
  versionToggle?: ToggleGroup;
  /** Optional mode toggle (appears in controls bar as pill group). */
  modeToggle?: ToggleGroup;
  /** If true, line numbers are shown next to the code. Defaults to true. */
  showLineNumbers?: boolean;
  /** Additional Panda CSS classes. */
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Small pill toggle                                                   */
/* ------------------------------------------------------------------ */
function PillToggle({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      role="group"
      className={css({
        display: "flex",
        backgroundColor: "sunbeam.black",
        borderRadius: "md",
        padding: "0.5",
      })}
    >
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          aria-pressed={value === opt}
          className={cx(
            css({
              py: "1",
              px: "3",
              fontSize: "2xs",
              fontWeight: "button",
              borderRadius: "md",
              textTransform: "uppercase",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
              fontFamily: "body",
            }),
            value === opt ? css({ backgroundColor: "code.activePill", color: "white" }) : css({
              backgroundColor: "transparent",
              color: "chrome.35",
              _hover: { color: "chrome.70" },
            }),
          )}
          type="button"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CodeBlock                                                           */
/* ------------------------------------------------------------------ */

/**
 * Tabbed code block with copy button and optional variant toggles.
 *
 * Renders multiple language/framework tabs. Each tab can have static content or
 * variant-keyed content selected by toggles (stream mode, version, execution mode).
 * Includes a copy button and syntax highlighting helpers via the `syn` export.
 *
 * Variant resolution: exact key match first, then partial matches, then "default" fallback.
 *
 * @example
 * ```tsx
 * <CodeBlock
 *   tabs={[
 *     {
 *       label: "JavaScript",
 *       variants: {
 *         "Streaming|V2": <code>// streaming v2 code</code>,
 *         "default": <code>// fallback code</code>
 *       }
 *     }
 *   ]}
 *   streamToggle={{ options: ["Streaming", "Non-streaming"] }}
 *   versionToggle={{ options: ["V1", "V2"] }}
 * />
 * ```
 */
/* ------------------------------------------------------------------ */
/* Code content with optional line numbers                             */
/* ------------------------------------------------------------------ */
function CodeContent({
  content,
  showLineNumbers,
}: {
  content: ReactNode;
  showLineNumbers: boolean;
}) {
  if (!showLineNumbers || typeof content !== "string") {
    return <>{content}</>;
  }

  const lines = content.split("\n");
  return (
    <div className={codeLines}>
      {lines.map((line, i) => (
        <div key={i} className={codeLine}>
          <span className={lineNumber}>{i + 1}</span>
          <span className={lineContent}>{line || " "}</span>
        </div>
      ))}
    </div>
  );
}

export function CodeBlock({
  tabs,
  streamToggle,
  versionToggle,
  modeToggle,
  showLineNumbers = true,
  className,
}: CodeBlockProps): ReactNode {
  const [stream, setStream] = useState(
    streamToggle?.defaultValue ?? streamToggle?.options[0] ?? "",
  );
  const [version, setVersion] = useState(
    versionToggle?.defaultValue ?? versionToggle?.options[0] ?? "",
  );
  const [mode, setMode] = useState(
    modeToggle?.defaultValue ?? modeToggle?.options[0] ?? "",
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const el = document.querySelector("[data-code-content]");
    if (el) {
      await navigator.clipboard.writeText(el.textContent ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  /** Build the variant key from current toggle state */
  const variantKey = [stream, version, mode].filter(Boolean).join("|");

  /** Resolve content for a tab given the current toggles */
  const resolveContent = (tab: CodeTab): ReactNode => {
    if (tab.content) return tab.content;
    if (!tab.variants) return null;
    // Try exact match, then partial matches, then "default"
    return tab.variants[variantKey] ?? tab.variants["default"] ??
      Object.values(tab.variants)[0] ??
      null;
  };

  return (
    <TabsRoot
      defaultValue={tabs[0]?.label}
      className={cx(codeBlockRoot, className)}
    >
      {/* Stream / copy bar */}
      {streamToggle && (
        <div className={topBar}>
          <div className={css({ display: "flex", gap: "4" })}>
            {streamToggle.options.map((opt) => (
              <button
                key={opt}
                onClick={() => setStream(opt)}
                aria-pressed={stream === opt}
                className={cx(
                  css({
                    fontSize: "xs",
                    fontWeight: "button",
                    letterSpacing: "-0.01em",
                    textTransform: "uppercase",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    paddingBottom: "1",
                    transition: "all 0.15s ease",
                    fontFamily: "body",
                  }),
                  stream === opt
                    ? css({
                      color: "white",
                      borderBottomWidth: "0.5",
                      borderBottomStyle: "solid",
                      borderBottomColor: "sunbeam.orange",
                    })
                    : css({
                      color: "chrome.35",
                      _hover: { color: "chrome.60" },
                    }),
                )}
                type="button"
              >
                {opt}
              </button>
            ))}
          </div>
          <button
            onClick={handleCopy}
            className={copyBtn}
            title="Copy code"
            aria-label="Copy code"
            type="button"
          >
            <Icon
              name={copied ? "check" : "content_copy"}
              size={16}
              className={css({ color: copied ? "code.success" : "chrome.35" })}
            />
            <span
              aria-live="polite"
              className={css({
                fontSize: "2xs",
                color: "code.success",
                fontFamily: "body",
                fontWeight: "button",
                textTransform: "uppercase",
              })}
            >
              {copied ? "Copied!" : ""}
            </span>
          </button>
        </div>
      )}

      {/* Language + version + mode bar */}
      <div className={controlsBar}>
        <div
          className={css({ display: "flex", gap: "3", alignItems: "center" })}
        >
          <TabList className={tabList}>
            {tabs.map((tab) => (
              <TabTrigger
                key={tab.label}
                value={tab.label}
                className={tabTrigger}
              >
                {tab.label}
              </TabTrigger>
            ))}
          </TabList>
          {versionToggle && (
            <PillToggle
              options={versionToggle.options}
              value={version}
              onChange={setVersion}
            />
          )}
        </div>
        {modeToggle && (
          <PillToggle
            options={modeToggle.options}
            value={mode}
            onChange={setMode}
          />
        )}
        {!streamToggle && (
          <button
            onClick={handleCopy}
            className={copyBtn}
            title="Copy code"
            aria-label="Copy code"
            type="button"
          >
            <Icon
              name={copied ? "check" : "content_copy"}
              size={16}
              className={css({ color: copied ? "code.success" : "chrome.35" })}
            />
            <span
              aria-live="polite"
              className={css({
                fontSize: "2xs",
                color: "code.success",
                fontFamily: "body",
                fontWeight: "button",
                textTransform: "uppercase",
              })}
            >
              {copied ? "Copied!" : ""}
            </span>
          </button>
        )}
      </div>

      {/* Code panels — re-render when toggles change */}
      {tabs.map((tab) => (
        <TabContent key={tab.label} value={tab.label} className={codeBody}>
          <div data-code-content="">
            <CodeContent
              content={resolveContent(tab)}
              showLineNumbers={showLineNumbers}
            />
          </div>
        </TabContent>
      ))}
    </TabsRoot>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const codeBlockRoot = css({
  borderRadius: "0",
  overflow: "hidden",
  backgroundColor: "sunbeam.black",
  color: "code.text",
  fontFamily: "mono",
  fontSize: "sm",
  shadow: "code",
  borderWidth: "0.25",
  borderStyle: "solid",
  borderColor: "chrome.05",
});

const topBar = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  py: "2",
  px: "4",
  backgroundColor: "scrim.50",
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderBottomColor: "chrome.05",
});

const controlsBar = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  py: "3",
  px: "4",
  backgroundColor: "sunbeam.black",
  borderBottomWidth: "0.25",
  borderBottomStyle: "solid",
  borderBottomColor: "chrome.05",
  flexWrap: "wrap",
  gap: "2",
});

const tabList = css({
  display: "flex",
  backgroundColor: "sunbeam.black",
  borderRadius: "md",
  padding: "0.5",
  gap: 0,
});

const tabTrigger = css({
  py: "1",
  px: "3",
  fontSize: "2xs",
  fontWeight: "button",
  textTransform: "uppercase",
  borderRadius: "md",
  border: "none",
  cursor: "pointer",
  transition: "all 0.15s ease",
  color: "chrome.35",
  backgroundColor: "transparent",
  fontFamily: "body",
  _hover: { color: "chrome.70" },
  _selected: { backgroundColor: "code.activePill", color: "white" },
});

const copyBtn = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "1.5",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "1",
  borderRadius: "md",
  transition: "all 0.15s ease",
  _hover: { backgroundColor: "chrome.10" },
});

const codeBody = css({
  padding: "6",
  overflowX: "auto",
  lineHeight: 1.7,
  "& pre": { margin: 0, fontFamily: "mono" },
});

const codeLines = css({
  display: "flex",
  flexDirection: "column",
  fontFamily: "mono",
});

const codeLine = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "4",
});

const lineNumber = css({
  display: "inline-block",
  width: "6",
  textAlign: "right",
  color: "chrome.30",
  fontSize: "sm",
  userSelect: "none",
});

const lineContent = css({
  flex: 1,
  whiteSpace: "pre",
});

/* ------------------------------------------------------------------ */
/* Syntax span helpers (use as className on <span>)                    */
/* ------------------------------------------------------------------ */
export const syn: Record<
  "keyword" | "fn" | "string" | "prop" | "number" | "builtin" | "comment",
  string
> = {
  keyword: css({ color: "syn.keyword" }),
  fn: css({ color: "syn.fn" }),
  string: css({ color: "syn.string" }),
  prop: css({ color: "syn.prop" }),
  number: css({ color: "syn.number" }),
  builtin: css({ color: "syn.builtin" }),
  comment: css({ color: "chrome.30", fontStyle: "italic" }),
};
