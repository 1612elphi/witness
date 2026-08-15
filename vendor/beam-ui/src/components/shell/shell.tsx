import { css } from "../../system.ts";

import type { ReactNode } from "react";
import { Header } from "./header.tsx";
import { Footer } from "./footer.tsx";
import type { HeaderProps } from "./header.tsx";

/** Props for {@link Shell}. */
export interface ShellProps extends
  Pick<
    HeaderProps,
    | "showThemeToggle"
    | "brand"
    | "navLinks"
    | "breadcrumbs"
    | "drawerSections"
    | "searchItems"
    | "searchPlaceholder"
    | "showSearch"
    | "fullWidth"
    | "currentPath"
    | "linkAs"
    | "onNavigate"
    | "isActive"
  > {
  /** Extra elements rendered in the header's right group before the theme toggle */
  headerActions?: ReactNode;
  /** Replace the default Header with a custom element. */
  header?: ReactNode;
  /** Replace the default Footer with a custom element. */
  footer?: ReactNode;
  /** Content to render. */
  children?: ReactNode;
  className?: string;
}

const shellStyle = css({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
});

const mainStyle = css({
  flex: 1,
  minHeight: 0,
  overflow: "hidden",
  position: "relative",
});

/**
 * Top-level layout component combining Header, main content area, and Footer.
 *
 * Arranges content in a flexible column.
 * Accepts custom Header and Footer via props, or renders defaults.
 * The default Header is wired with the router-agnostic props passed to Shell.
 *
 * @example
 * ```tsx
 * <Shell showThemeToggle currentPath="/docs" linkAs={Link} onNavigate={navigate}>
 *   <MyPageContent />
 * </Shell>
 * ```
 */
export function Shell({
  showThemeToggle = true,
  headerActions,
  header,
  footer,
  children,
  className,
  brand,
  navLinks,
  breadcrumbs,
  drawerSections,
  searchItems,
  searchPlaceholder,
  showSearch,
  fullWidth,
  currentPath,
  linkAs,
  onNavigate,
  isActive,
}: ShellProps): ReactNode {
  return (
    <div className={className ?? shellStyle}>
      {header !== undefined ? header : (
        <Header
          showThemeToggle={showThemeToggle}
          actions={headerActions}
          brand={brand}
          navLinks={navLinks}
          breadcrumbs={breadcrumbs}
          drawerSections={drawerSections}
          searchItems={searchItems}
          searchPlaceholder={searchPlaceholder}
          showSearch={showSearch}
          fullWidth={fullWidth}
          currentPath={currentPath}
          linkAs={linkAs}
          onNavigate={onNavigate}
          isActive={isActive}
        />
      )}
      <div className={mainStyle}>
        {children}
      </div>
      {footer !== undefined ? footer : <Footer linkAs={linkAs} />}
    </div>
  );
}
