import { css, cx } from "../../system.ts";

import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { useTheme } from "../../hooks/use-theme.ts";

let mermaidModule: typeof import("mermaid").default | null = null;

/** Props for {@link DiagramRenderer}. */
export interface DiagramRendererProps {
  /** Mermaid diagram syntax (flowchart, sequence, gantt, etc.). */
  code: string;
  /** Extra CSS class names to apply to the container. */
  className?: string;
}

/**
 * Mermaid diagram renderer with Beam-themed dark and light modes.
 *
 * Lazily loads the mermaid library and renders diagram code to SVG.
 * Automatically responds to theme changes. Shows error state with fallback if rendering fails.
 * Supports all mermaid diagram types (flowchart, sequence, gantt, class, state, etc.).
 *
 * @example
 * ```tsx
 * <DiagramRenderer code="flowchart LR\n  A[Start] --> B[End]" />
 * ```
 */
export function DiagramRenderer(
  { code, className }: DiagramRendererProps,
): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string>("");
  const reactId = useId();
  const idRef = useRef(0);
  const { theme } = useTheme();

  // Initialize mermaid lazily with Beam theme colors
  useEffect(() => {
    import("mermaid").then((mod) => {
      mermaidModule = mod.default;
      mermaidModule.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: theme === "dark"
          ? {
            // Flowchart nodes — soft steel blue
            primaryColor: "#1e2a3a",
            primaryTextColor: "#e2e8f0",
            primaryBorderColor: "#4a9eff",
            // Edges
            lineColor: "#7a8a9a",
            // Secondary nodes — muted teal
            secondaryColor: "#1a2e2a",
            secondaryTextColor: "#e2e8f0",
            secondaryBorderColor: "#5bb8a6",
            // Tertiary nodes — warm sand
            tertiaryColor: "#2e2618",
            tertiaryTextColor: "#e2e8f0",
            tertiaryBorderColor: "#c4956a",
            // Notes — warm amber highlight
            noteBkgColor: "#332b10",
            noteTextColor: "#ffd06a",
            noteBorderColor: "#ffa110",
            // Sequence diagrams — actors in slate
            actorBkg: "#252830",
            actorTextColor: "#e2e8f0",
            actorBorder: "#4a9eff",
            signalColor: "#7a8a9a",
            signalTextColor: "#e2e8f0",
            labelTextColor: "#c0c8d4",
            loopTextColor: "#c0c8d4",
            // Activations — sunbeam orange accent
            activationBorderColor: "#fa520f",
            activationBkgColor: "#2e1a0a",
            sequenceNumberColor: "#1f1f1f",
            // Gantt — alternating cool/warm sections
            sectionBkgColor: "#1e2a3a",
            altSectionBkgColor: "#252830",
            gridColor: "rgba(122,138,154,0.2)",
            // Tasks — use different fills for states
            taskBorderColor: "#4a9eff",
            taskBkgColor: "#1e2a3a",
            taskTextColor: "#e2e8f0",
            doneTaskBkgColor: "#1a3a2a",
            doneTaskBorderColor: "#5bb8a6",
            activeTaskBorderColor: "#fa520f",
            activeTaskBkgColor: "#2e1a0a",
            // Class diagrams
            classText: "#e2e8f0",
            // General
            fontFamily: "var(--fonts-body, sans-serif)",
            fontSize: "14px",
          }
          : {
            // Flowchart nodes — soft blue
            primaryColor: "#e8f0fe",
            primaryTextColor: "#1a2233",
            primaryBorderColor: "#4a9eff",
            // Edges
            lineColor: "#8896a6",
            // Secondary nodes — soft teal
            secondaryColor: "#e4f5f0",
            secondaryTextColor: "#1a2e2a",
            secondaryBorderColor: "#3da690",
            // Tertiary nodes — warm sand
            tertiaryColor: "#fef3e2",
            tertiaryTextColor: "#3a2a10",
            tertiaryBorderColor: "#c4956a",
            // Notes — warm amber
            noteBkgColor: "#fff4d6",
            noteTextColor: "#6b4f00",
            noteBorderColor: "#ffa110",
            // Sequence diagrams — actors in light slate
            actorBkg: "#f0f3f8",
            actorTextColor: "#1a2233",
            actorBorder: "#4a9eff",
            signalColor: "#8896a6",
            signalTextColor: "#1a2233",
            labelTextColor: "#4a5568",
            loopTextColor: "#4a5568",
            // Activations — sunbeam accent
            activationBorderColor: "#fa520f",
            activationBkgColor: "#fff4e8",
            sequenceNumberColor: "#ffffff",
            // Gantt — alternating
            sectionBkgColor: "#e8f0fe",
            altSectionBkgColor: "#f0f3f8",
            gridColor: "rgba(136,150,166,0.2)",
            // Tasks
            taskBorderColor: "#4a9eff",
            taskBkgColor: "#e8f0fe",
            taskTextColor: "#1a2233",
            doneTaskBkgColor: "#e4f5f0",
            doneTaskBorderColor: "#3da690",
            activeTaskBorderColor: "#fa520f",
            activeTaskBkgColor: "#fff4e8",
            // Class diagrams
            classText: "#1a2233",
            // General
            fontFamily: "var(--fonts-body, sans-serif)",
            fontSize: "14px",
          },
      });
    });
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    idRef.current += 1;
    const uniqueId = `mermaid-${reactId.replace(/:/g, "")}-${idRef.current}`;

    async function render() {
      if (!mermaidModule) {
        const mod = await import("mermaid");
        mermaidModule = mod.default;
      }
      try {
        const { svg: renderedSvg } = await mermaidModule.render(uniqueId, code);
        if (!cancelled) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to render diagram",
          );
          setSvg("");
        }
        // Clean up any orphaned render element mermaid may have left
        const orphan = document.getElementById("d" + uniqueId);
        orphan?.remove();
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [code, theme, reactId]);

  if (error) {
    return (
      <div className={cx(containerStyle, errorContainer, className)}>
        <pre className={errorPre}>{code}</pre>
      </div>
    );
  }

  // Mermaid's render() returns sanitized SVG — safe to inject directly.
  return (
    <div
      ref={containerRef}
      className={cx(containerStyle, className)}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const containerStyle = css({
  padding: "6",
  backgroundColor: "bg.card",
  borderRadius: "0",
  "& svg": {
    maxWidth: "100%",
    height: "auto",
  },
});

const errorContainer = css({
  borderLeftWidth: "1",
  borderLeftStyle: "solid",
  borderLeftColor: "sunbeam.orange",
});

const errorPre = css({
  fontFamily: "mono",
  fontSize: "13",
  color: "text.secondary",
  margin: 0,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
});
