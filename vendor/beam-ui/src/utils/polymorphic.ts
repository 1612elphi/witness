/**
 * Router-agnostic link type.
 *
 * The design system does not ship a router; consumers pass their own `Link`
 * (from React Router, TanStack Router, Fresh, Next.js, etc.) and we only
 * require the minimal props we need.
 *
 * @module
 */
import type { ComponentType, ReactNode } from "react";

/**
 * A component that renders a link. The design system does not ship a router;
 * consumers pass their own `Link` (from React Router, TanStack Router, Fresh,
 * Next.js, etc.) and we only require the minimal props we need.
 */
export type LinkComponent = ComponentType<{
  href: string;
  children: ReactNode;
  className?: string;
  [key: string]: unknown;
}>;
