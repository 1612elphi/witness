import { css } from "../../system.ts";

import { type ReactNode, useEffect, useRef } from "react";
import { useSplitter } from "@ark-ui/react/splitter";
import type { SizeChangeDetails } from "@zag-js/splitter";

/** Props for {@link Splitter}. */
export interface SplitterProps {
  /** Exactly two child elements to split. */
  children: [ReactNode, ReactNode];
  /** Split direction. Defaults to `"horizontal"`. */
  direction?: "horizontal" | "vertical";
  /** Initial size of left/top panel as percentage (0–100). Defaults to `50`. */
  defaultSize?: number;
  /** Called when the user finishes resizing a panel. */
  onSizeChangeEnd?: (details: SizeChangeDetails) => void;
  /** Whether the first panel is collapsed to its minimum size. */
  collapsed?: boolean;
  /** Size of the first panel when collapsed, in percent. Defaults to `0`. */
  collapsedSize?: number;
}

/**
 * Resizable two-panel splitter using Ark UI.
 * Drag handle shows on hover and highlights on drag.
 *
 * @example
 * ```tsx
 * <Splitter direction="horizontal" defaultSize={30}>
 *   <LeftPanel />
 *   <RightPanel />
 * </Splitter>
 * ```
 */
export function Splitter({
  children,
  direction = "horizontal",
  defaultSize = 50,
  onSizeChangeEnd,
  collapsed,
  collapsedSize = 0,
}: SplitterProps): ReactNode {
  const orientation = direction === "horizontal" ? "horizontal" : "vertical";
  const initialSize = collapsed ? collapsedSize : defaultSize;

  const splitter = useSplitter({
    id: "splitter",
    orientation,
    defaultSize: [
      { id: "panel-a", size: initialSize, minSize: 0 },
      { id: "panel-b", size: 100 - initialSize },
    ],
    onSizeChangeEnd,
  });

  const splitterRef = useRef(splitter);
  splitterRef.current = splitter;

  useEffect(() => {
    if (collapsed !== undefined) {
      splitterRef.current.setSize(
        "panel-a",
        collapsed ? collapsedSize : defaultSize,
      );
    }
  }, [collapsed, collapsedSize, defaultSize]);

  return (
    <div {...splitter.getRootProps()} className={root}>
      <div
        {...splitter.getPanelProps({ id: "panel-a" })}
        className={panel}
      >
        {children[0]}
      </div>

      <button
        {...splitter.getResizeTriggerProps({ id: "panel-a:panel-b" })}
        className={direction === "horizontal" ? handleH : handleV}
        type="button"
      >
        <div
          className={direction === "horizontal" ? handleBarH : handleBarV}
        />
      </button>

      <div
        {...splitter.getPanelProps({ id: "panel-b" })}
        className={panel}
      >
        {children[1]}
      </div>
    </div>
  );
}

const root = css({
  display: "flex",
  width: "100%",
  height: "100%",
});

const panel = css({
  overflow: "auto",
});

const handleH = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2",
  cursor: "col-resize",
  backgroundColor: "transparent",
  border: "none",
  padding: 0,
  transition: "all 0.15s ease",
  _hover: {
    "& > div": {
      backgroundColor: "sunbeam.orange",
    },
  },
  _active: {
    "& > div": {
      backgroundColor: "sunbeam.orange",
    },
  },
});

const handleV = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "2",
  cursor: "row-resize",
  backgroundColor: "transparent",
  border: "none",
  padding: 0,
  transition: "all 0.15s ease",
  _hover: {
    "& > div": {
      backgroundColor: "sunbeam.orange",
    },
  },
  _active: {
    "& > div": {
      backgroundColor: "sunbeam.orange",
    },
  },
});

const handleBarH = css({
  width: "0.5",
  height: "8",
  backgroundColor: "border.default",
  borderRadius: "full",
  transition: "background-color 0.15s ease",
});

const handleBarV = css({
  height: "0.5",
  width: "8",
  backgroundColor: "border.default",
  borderRadius: "full",
  transition: "background-color 0.15s ease",
});
