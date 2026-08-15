import { css, cx } from "../../system.ts";

import { type ReactNode, useState } from "react";
import { CollapsibleContent, CollapsibleRoot, CollapsibleTrigger } from "@ark-ui/react/collapsible";
import { Icon } from "./icon.tsx";

/** Node in a tree hierarchy. */
export interface TreeNode {
  /** Unique identifier for the node. */
  id: string;
  /** Display label. */
  label: string;
  /** Optional Material Symbols icon name. Defaults to "folder" for parents, "description" for leaves. */
  icon?: string;
  /** Child nodes forming a subtree. If present and non-empty, node is treated as a folder. */
  children?: TreeNode[];
  /** Called when a leaf node is clicked. */
  onClick?: () => void;
}

/** Props for {@link TreeView}. */
export interface TreeViewProps {
  /** Array of root tree nodes. */
  nodes: TreeNode[];
  /** ID of the currently active/selected node. */
  activeId?: string;
  /** Optional CSS class applied to the root container. */
  className?: string;
}

/**
 * Hierarchical tree view using Ark UI collapsibles with icon indicators.
 * Folders expand/collapse; leaves are clickable buttons. Active node is highlighted.
 *
 * @example
 * ```tsx
 * const nodes: TreeNode[] = [
 *   {
 *     id: "src",
 *     label: "src",
 *     children: [
 *       { id: "index.ts", label: "index.ts", onClick: "() => console.log("clicked") },
 *     ],
 *   },
 * ];
 * <TreeView nodes={nodes} activeId="index.ts" />
 * ```
 */
export function TreeView(
  { nodes, activeId, className }: TreeViewProps,
): ReactNode {
  return (
    <div className={cx(root, className)} role="tree">
      {nodes.map((node) => <TreeItem key={node.id} node={node} activeId={activeId} level={0} />)}
    </div>
  );
}

function TreeItem({
  node,
  activeId,
  level,
}: {
  node: TreeNode;
  activeId?: string;
  level: number;
}) {
  const isFolder = node.children && node.children.length > 0;
  const isActive = activeId === node.id;
  const [open, setOpen] = useState(true);

  if (isFolder) {
    return (
      <CollapsibleRoot
        defaultOpen
        open={open}
        onOpenChange={(d) => setOpen(d.open)}
      >
        <CollapsibleTrigger
          className={cx(itemRow, isActive && activeRow)}
          role="treeitem"
          aria-expanded={open}
        >
          <span
            style={{ paddingLeft: `${level * 16}px` }}
            className={itemInner}
          >
            <Icon name="expand_more" size={16} className={chevron} />
            <Icon
              name={node.icon ?? "folder"}
              size={18}
              className={folderIcon}
            />
            <span className={labelStyle}>{node.label}</span>
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent role="group">
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              activeId={activeId}
              level={level + 1}
            />
          ))}
        </CollapsibleContent>
      </CollapsibleRoot>
    );
  }

  return (
    <button
      className={cx(itemRow, isActive && activeRow)}
      onClick={node.onClick}
      type="button"
      role="treeitem"
    >
      <span style={{ paddingLeft: `${level * 16}px` }} className={itemInner}>
        <span className={css({ width: "4", flexShrink: 0 })} />
        <Icon
          name={node.icon ?? "description"}
          size={18}
          className={fileIcon}
        />
        <span className={labelStyle}>{node.label}</span>
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const root = css({
  fontFamily: "body",
  fontSize: "sm",
});

const itemRow = css({
  display: "flex",
  width: "100%",
  alignItems: "center",
  background: "none",
  border: "none",
  cursor: "pointer",
  paddingBlock: "1",
  paddingInline: "2",
  borderRadius: "md",
  transition: "background-color 0.15s ease",
  textAlign: "left",
  color: "text.primary",
  _hover: { backgroundColor: "bg.card" },
});

const activeRow = css({
  backgroundColor: "bg.card",
  fontWeight: "button",
});

const itemInner = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "1.5",
});

const chevron = css({
  color: "text.muted",
  transition: "transform 0.15s ease",
  "[data-state=closed] &": { transform: "rotate(-90deg)" },
});

const folderIcon = css({ color: "sunbeam.orange" });
const fileIcon = css({ color: "text.secondary" });

const labelStyle = css({
  lineHeight: 1,
  whiteSpace: "nowrap",
});
