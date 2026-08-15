import { css } from "../../system.ts";

import type { ReactNode } from "react";
import { Sidebar } from "../shell/sidebar.tsx";
import { docsSidebar } from "../../data/navigation.ts";
import type { LinkComponent } from "../../utils/polymorphic.ts";

const srOnly = css({
  position: "absolute",
  width: "0.25",
  height: "0.25",
  padding: 0,
  margin: "-0.25",
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  borderWidth: 0,
  _focus: {
    position: "fixed",
    top: "1",
    left: "1",
    width: "auto",
    height: "auto",
    py: "2",
    px: "4",
    margin: 0,
    overflow: "visible",
    clip: "auto",
    whiteSpace: "normal",
    zIndex: 9999,
    bg: "bg.card",
    color: "accent",
    fontWeight: "button",
    fontSize: "sm",
    borderWidth: "0.5",
    borderStyle: "solid",
    borderColor: "accent",
  },
});

const body = css({
  display: "flex",
  maxWidth: "360",
  marginInline: "auto",
  width: "100%",
});

const sidebarWrapper = css({
  display: { base: "none", lg: "block" },
});

const content = css({
  flex: 1,
  minWidth: 0,
  maxWidth: "225",
  paddingInline: { base: "6", md: "12", lg: "30" },
  paddingBlock: "8",
  overflow: "visible",
});

/** Props for {@link FullwidthLayout}. */
export interface FullwidthLayoutProps {
  /** Page content. */
  children: ReactNode;
  /** Current path used to compute active sidebar item. */
  currentPath?: string;
  /** Component used to render links. Defaults to a plain `<a>`. */
  linkAs?: LinkComponent;
}

/**
 * Two-column layout with sidebar and full-width centered content.
 * Sidebar hides on tablet and below. No right rail or additional columns.
 *
 * @example
 * ```tsx
 * <FullwidthLayout currentPath="/models">
 *   <MyPage />
 * </FullwidthLayout>
 * ```
 */
export function FullwidthLayout({
  children,
  currentPath = "",
  linkAs,
}: FullwidthLayoutProps): ReactNode {
  return (
    <>
      <a href="#main-content" className={srOnly}>Skip to main content</a>
      <div className={body}>
        <div className={sidebarWrapper}>
          <Sidebar
            sections={docsSidebar}
            currentPath={currentPath}
            linkAs={linkAs}
          />
        </div>
        <main className={content} id="main-content">
          {children}
        </main>
      </div>
    </>
  );
}
