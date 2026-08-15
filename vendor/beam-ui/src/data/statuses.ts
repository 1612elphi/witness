/**
 * Beam Design Language — Recommended Status Labels
 *
 * Standardized status vocabulary for issues, pull requests, and work items.
 * Each status maps to a Badge variant for visual consistency.
 */

/**
 * Status color palette.
 *
 * Hex literals are intentional: this data file is the single source of truth
 * for status colors. Components (e.g. `Badge`) import these constants instead
 * of hardcoding their own values.
 */
export const statusColors = {
  /** Badge background for the "open" work status (dark enough for white text). */
  open: "#166534",
  /** Accent color for the open issue indicator (brighter than the badge background). */
  issueOpen: "#22c55e",
  /** Badge background for the "draft" work status. */
  draft: "#525252",
  /** Badge background for the "review" work status. */
  review: "#92400e",
  /** Badge background for the "approved" work status. */
  approved: "#15803d",
  /** Badge background for the "revision" work status. */
  revision: "#c2410c",
  /** Badge background for the "merged" work status. */
  merged: "#7e22ce",
  /** Badge background for the "closed" work status. */
  closed: "#991b1b",
  /** Badge background for "critical" priority. */
  critical: "#dc2626",
  /** Badge background for "high" priority. */
  high: "#ea580c",
  /** Badge background for "medium" priority. */
  medium: "#d97706",
  /** Badge background for "low" priority. */
  low: "#0d9488",
  /** Surface for the blocked indicator (kanban cards). */
  blockedBg: "#fef2f2",
  /** Border for the blocked indicator (kanban cards). */
  blockedBorder: "#fca5a5",
  /** Fill for completed progress bars (kanban checklists). Same as approved. */
  progressDone: "#15803d",
} as const;

/**
 * Definition of a status with visual styling and metadata.
 *
 * Used to render consistent status badges across issues, PRs, and work items.
 */
export interface StatusDef {
  /** Display text for the status (e.g., "Open", "Approved", "Draft"). */
  label: string;
  /** Badge variant name for styling (e.g., "open", "closed", "review"). */
  variant: string;
  /** Optional Material Design icon name (e.g., "circle", "check_circle"). */
  icon?: string;
  /** Optional hex color for visual overrides. */
  color?: string;
  /** Human-readable explanation of what this status means. */
  description: string;
}

/**
 * Standard issue status definitions.
 *
 * Used to render consistent status badges on issue lists and detail pages.
 * Consumers filter and display these statuses to show issue workflow state.
 */
export const issueStatuses: StatusDef[] = [
  {
    label: "Open",
    variant: "open",
    icon: "circle",
    color: statusColors.issueOpen,
    description: "Issue is active and accepting contributions",
  },
  {
    label: "Closed",
    variant: "closed",
    icon: "cancel",
    color: statusColors.closed,
    description: "Issue has been resolved or won't be fixed",
  },
  {
    label: "Duplicate",
    variant: "closed",
    icon: "content_copy",
    color: statusColors.closed,
    description: "Issue duplicates an existing one",
  },
];

/**
 * Standard pull request status definitions.
 *
 * Used to render consistent status badges on PR lists and detail pages.
 * Consumers track PR workflow through Draft → Review → Approved/Revision → Merged/Declined states.
 */
export const prStatuses: StatusDef[] = [
  {
    label: "Draft",
    variant: "draft",
    icon: "edit_note",
    color: statusColors.draft,
    description: "PR is a work in progress, not ready for review",
  },
  {
    label: "Review",
    variant: "review",
    icon: "rate_review",
    color: statusColors.review,
    description: "PR is awaiting code review",
  },
  {
    label: "Approved",
    variant: "approved",
    icon: "check_circle",
    color: statusColors.approved,
    description: "PR has been approved and is ready to merge",
  },
  {
    label: "Revision",
    variant: "revision",
    icon: "edit",
    color: statusColors.revision,
    description: "Reviewer has requested changes",
  },
  {
    label: "Merged",
    variant: "merged",
    icon: "merge",
    color: statusColors.merged,
    description: "PR has been merged into the target branch",
  },
  {
    label: "Declined",
    variant: "closed",
    icon: "close",
    color: statusColors.closed,
    description: "PR has been closed without merging",
  },
];

/**
 * Priority level definitions for issues and work items.
 *
 * Used to sort and filter backlog items by urgency.
 * Consumers assign priorities to track and communicate work importance.
 */
export const priorities: StatusDef[] = [
  {
    label: "Critical",
    variant: "critical",
    icon: "priority_high",
    color: statusColors.critical,
    description: "Requires immediate attention",
  },
  {
    label: "High",
    variant: "high",
    icon: "arrow_upward",
    color: statusColors.high,
    description: "Should be addressed soon",
  },
  {
    label: "Medium",
    variant: "medium",
    icon: "remove",
    color: statusColors.medium,
    description: "Normal priority",
  },
  {
    label: "Low",
    variant: "low",
    icon: "arrow_downward",
    color: statusColors.low,
    description: "Can be addressed when convenient",
  },
];

/**
 * Feature release stage definitions.
 *
 * Used to badge features and APIs by maturity level.
 * Consumers show these in documentation to set user expectations about stability and support.
 */
export const releaseStages: StatusDef[] = [
  {
    label: "Stable",
    variant: "stable",
    description: "Production-ready, fully supported",
  },
  {
    label: "Beta",
    variant: "beta",
    description: "Feature-complete but may have bugs",
  },
  {
    label: "Preview",
    variant: "preview",
    description: "Early access, API may change",
  },
  {
    label: "Experimental",
    variant: "experimental",
    description: "Proof of concept, not for production",
  },
  {
    label: "Deprecated",
    variant: "deprecated",
    description: "Scheduled for removal, migrate away",
  },
];

/**
 * Convenience object combining all status arrays by category.
 *
 * Useful for bulk operations or rendering all available statuses.
 */
export const allStatuses = {
  issue: issueStatuses,
  pr: prStatuses,
  priority: priorities,
  release: releaseStages,
};
