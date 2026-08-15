/**
 * Sunbeam Studios design system — main entry point.
 *
 * Re-exports every UI component, layout shell, hook, and curated
 * navigation/status data set. Components are unstyled at import time and pick
 * up styling from a consumer's Panda CSS pipeline; wire {@link beamPreset}
 * (from `@sunbeam/beam-ui/preset`) into your `panda.config.ts` to get the
 * full design language.
 *
 * @example
 * ```tsx
 * import { Button, Card, useTheme } from "@sunbeam/beam-ui";
 *
 * export function Hero() {
 *   const { theme, toggle } = useTheme();
 *   return (
 *     <Card>
 *       <Button variant="primary" onClick={toggle}>
 *         Switch to {theme === "dark" ? "light" : "dark"} mode
 *       </Button>
 *     </Card>
 *   );
 * }
 * ```
 *
 * @module
 */

// UI primitives
export * from "./components/ui/index.ts";

// Tweak palette
export { TweakRadio, TweakSection, TweakToggle } from "./components/tweak/index.ts";

// Command palette
export * from "./components/command-palette/index.ts";
export type { CommandPaletteProps } from "./components/command-palette/command-palette.tsx";

// Shell
export { Breadcrumbs } from "./components/shell/breadcrumbs.tsx";
export type { BreadcrumbItem, BreadcrumbsProps } from "./components/shell/breadcrumbs.tsx";
export { Footer } from "./components/shell/footer.tsx";
export type { FooterProps } from "./components/shell/footer.tsx";
export { Header } from "./components/shell/header.tsx";
export type {
  HeaderBreadcrumbItem,
  HeaderNavLink,
  HeaderProps,
  HeaderSearchItem,
} from "./components/shell/header.tsx";
export { RightRail } from "./components/shell/right-rail.tsx";
export type { RightRailProps } from "./components/shell/right-rail.tsx";
export { Shell } from "./components/shell/shell.tsx";
export type { ShellProps } from "./components/shell/shell.tsx";
export { Sidebar } from "./components/shell/sidebar.tsx";
export type { SidebarItemProps, SidebarProps } from "./components/shell/sidebar.tsx";

// Layouts
export { ApiLayout, apiLeftPanel, apiRightPanel } from "./components/layouts/api-layout.tsx";
export type { ApiLayoutProps } from "./components/layouts/api-layout.tsx";
export { DocsLayout, useDocsContext } from "./components/layouts/docs-layout.tsx";
export type { DocsLayoutProps, DocsTocItem } from "./components/layouts/docs-layout.tsx";
export { FullwidthLayout } from "./components/layouts/fullwidth-layout.tsx";
export type { FullwidthLayoutProps } from "./components/layouts/fullwidth-layout.tsx";

// Polymorphic helpers
export type { LinkComponent } from "./utils/polymorphic.ts";

// Form
export { Form, FormField, useForm, z, zodResolver } from "./form/index.tsx";

// Data
export { apiSidebar, docsSidebar, footerSections, headerLinks } from "./data/navigation.ts";
export type { NavItem, NavSection } from "./data/navigation.ts";
export {
  allStatuses,
  issueStatuses,
  priorities,
  prStatuses,
  releaseStages,
} from "./data/statuses.ts";
export type { StatusDef } from "./data/statuses.ts";

// Hooks
export { useTheme } from "./hooks/use-theme.ts";
