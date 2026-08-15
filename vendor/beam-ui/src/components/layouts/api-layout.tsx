import { css } from "../../system.ts";

import type { ReactNode } from "react";
import { Sidebar } from "../shell/sidebar.tsx";
import { apiSidebar } from "../../data/navigation.ts";
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
  flex: 1,
  overflow: "hidden",
  height: { base: "auto", lg: "calc(100vh - 64px)" },
  minHeight: { base: "calc(100vh - 64px)", lg: "auto" },
  flexDirection: { base: "column", lg: "row" },
});

const sidebarWrapper = css({
  display: { base: "none", lg: "block" },
});

const panels = css({
  display: "flex",
  flex: 1,
  overflow: { base: "visible", lg: "hidden" },
  flexDirection: { base: "column", lg: "row" },
});

/** CSS class for API layout's left content panel (55% width on desktop). */
export const apiLeftPanel: string = css({
  width: { base: "100%", lg: "55%" },
  overflowY: "auto",
  bg: "bg.page",
  paddingInline: "6",
});

/** CSS class for API layout's right panel (45% width on desktop, dark background). */
export const apiRightPanel: string = css({
  width: { base: "100%", lg: "45%" },
  overflowY: "auto",
  bg: "sunbeam.black",
  color: "white",
});

/** Props for {@link ApiLayout}. */
export interface ApiLayoutProps {
  /** Page content. */
  children: ReactNode;
  /** Current path used to compute active sidebar item. */
  currentPath?: string;
  /** Component used to render links. Defaults to a plain `<a>`. */
  linkAs?: LinkComponent;
}

/**
 * Two-column layout for API documentation. Sidebar on the left (hidden on mobile),
 * split main content area with left panel for prose and right panel for code examples.
 *
 * @example
 * ```tsx
 * <ApiLayout currentPath="/api/chat">
 *   <MyApiPage />
 * </ApiLayout>
 * ```
 */
export function ApiLayout(
  { children, currentPath = "", linkAs }: ApiLayoutProps,
): ReactNode {
  return (
    <>
      <a href="#main-content" className={srOnly}>Skip to main content</a>
      <div className={body}>
        <div className={sidebarWrapper}>
          <Sidebar
            sections={apiSidebar}
            currentPath={currentPath}
            linkAs={linkAs}
          />
        </div>
        <main className={panels} id="main-content">
          {children}
        </main>
      </div>
    </>
  );
}
