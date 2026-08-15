/**
 * A single navigation item with optional nested children.
 *
 * Used in navigation structures (headers, sidebars, breadcrumbs).
 */
export interface NavItem {
  /** Display label text. */
  label: string;
  /** Navigation target URL path. */
  href: string;
  /** Optional icon identifier (used with Icon component). */
  icon?: string;
  /** Optional nested child items (for collapsible menus). */
  children?: NavItem[];
}

/**
 * A group of related navigation items under a single section heading.
 *
 * Used to organize navigation into categories (e.g., "Foundations", "Components").
 */
export interface NavSection {
  /** Section heading text. */
  title: string;
  /** Array of navigation items in this section. */
  items: NavItem[];
}

/**
 * Top-level navigation menu items displayed in the page header.
 *
 * Consumers render these as a horizontal nav bar linking to major documentation sections.
 */
export const headerLinks: NavItem[] = [];

/**
 * Navigation tree for the Beam Design Language documentation site.
 *
 * Rendered by {@link Sidebar} component in the left rail.
 * Organizes all design foundations, shell components, layouts, and component library items.
 * Supports nested collapsible sections (e.g., "AuthForms", "Charts").
 */
export const docsSidebar: NavSection[] = [
  {
    title: "FOUNDATIONS",
    items: [
      { label: "Accessibility", href: "/foundations/accessibility" },
      { label: "Colors", href: "/foundations/colors" },
      { label: "Typography", href: "/foundations/typography" },
      { label: "Spacing", href: "/foundations/spacing" },
      { label: "Elevation", href: "/foundations/elevation" },
      { label: "LLM Integration", href: "/foundations/llm-integration" },
      { label: "Installation", href: "/foundations/installation" },
    ],
  },
  {
    title: "SHELL",
    items: [
      { label: "Shell", href: "/shell/shell" },
      { label: "Header", href: "/shell/header" },
      { label: "Footer", href: "/shell/footer" },
      { label: "Sidebar", href: "/shell/sidebar" },
      { label: "RightRail", href: "/shell/right-rail" },
      { label: "Breadcrumbs", href: "/shell/breadcrumbs" },
    ],
  },
  {
    title: "LAYOUTS",
    items: [
      { label: "Docs Layout", href: "/layouts/docs" },
      { label: "API Layout", href: "/layouts/api" },
      { label: "Fullwidth Layout", href: "/layouts/fullwidth" },
      { label: "Creations Layout", href: "/layouts/creators" },
    ],
  },
  {
    title: "COMPONENTS",
    items: [
      { label: "Accordion", href: "/components/accordion" },
      { label: "ActivityHeatmap", href: "/components/activity-heatmap" },
      { label: "AssigneePicker", href: "/components/assignee-picker" },
      {
        label: "AuthForms",
        href: "/components/auth-form",
        children: [
          { label: "LoginForm", href: "/components/login-form" },
          { label: "SignUpForm", href: "/components/signup-form" },
          {
            label: "ForgotPasswordForm",
            href: "/components/forgot-password-form",
          },
          { label: "TwoFactorForm", href: "/components/two-factor-form" },
        ],
      },
      { label: "Avatar", href: "/components/avatar" },
      { label: "Badge", href: "/components/badge" },
      { label: "BranchSelector", href: "/components/branch-selector" },
      { label: "Button", href: "/components/button" },
      { label: "Callout", href: "/components/callout" },
      { label: "Card", href: "/components/card" },
      {
        label: "Charts",
        href: "/components/charts",
        children: [
          { label: "LineChart", href: "/components/line-chart" },
          { label: "BarChart", href: "/components/bar-chart" },
          { label: "PieChart", href: "/components/pie-chart" },
          { label: "AreaChart", href: "/components/area-chart" },
        ],
      },
      { label: "Checkbox", href: "/components/checkbox" },
      { label: "Clipboard", href: "/components/clipboard" },
      { label: "CodeBlock", href: "/components/code-block" },
      { label: "CodeEditor", href: "/components/code-editor" },
      { label: "ColorPicker", href: "/components/color-picker" },
      { label: "Combobox", href: "/components/combobox" },
      { label: "CommentThread", href: "/components/comment-thread" },
      { label: "CommitGraph", href: "/components/commit-graph" },
      { label: "ContextMenu", href: "/components/context-menu" },
      { label: "DatePicker", href: "/components/date-picker" },
      { label: "DiagramRenderer", href: "/components/diagram-renderer" },
      { label: "Dialog", href: "/components/dialog" },
      { label: "DiffViewer", href: "/components/diff-viewer" },
      { label: "DropdownMenu", href: "/components/dropdown-menu" },
      { label: "Editable", href: "/components/editable" },
      { label: "EmptyState", href: "/components/empty-state" },
      { label: "FileList", href: "/components/file-list" },
      { label: "FileUpload", href: "/components/file-upload" },
      { label: "HoverCard", href: "/components/hover-card" },
      { label: "Icon", href: "/components/icon" },
      {
        label: "Kanban",
        href: "/components/kanban-board",
        children: [
          { label: "KanbanBoard", href: "/components/kanban-board" },
          { label: "KanbanCard", href: "/components/kanban-card" },
        ],
      },
      { label: "Kbd", href: "/components/kbd" },
      { label: "LabelPicker", href: "/components/label-picker" },
      { label: "List", href: "/components/list" },
      {
        label: "Markdown",
        href: "/components/markdown-renderer",
        children: [
          { label: "MarkdownRenderer", href: "/components/markdown-renderer" },
          { label: "MarkdownEditor", href: "/components/markdown-editor" },
        ],
      },
      { label: "MathRenderer", href: "/components/math-renderer" },
      { label: "MilestonePicker", href: "/components/milestone-picker" },
      { label: "NotificationCenter", href: "/components/notification-center" },
      { label: "NumberInput", href: "/components/number-input" },
      { label: "Pagination", href: "/components/pagination" },
      { label: "PinInput", href: "/components/pin-input" },
      { label: "Popover", href: "/components/popover" },
      { label: "ProgressBar", href: "/components/progress-bar" },
      { label: "RadioGroup", href: "/components/radio-group" },
      { label: "ReactionPicker", href: "/components/reaction-picker" },
      { label: "ScrollArea", href: "/components/scroll-area" },
      { label: "SearchInput", href: "/components/search-input" },
      { label: "Select", href: "/components/select" },
      { label: "Skeleton", href: "/components/skeleton" },
      { label: "Slider", href: "/components/slider" },
      { label: "Spinner", href: "/components/spinner" },
      { label: "Splitter", href: "/components/splitter" },
      { label: "Steps", href: "/components/steps" },
      { label: "Switch", href: "/components/switch" },
      { label: "SyntaxHighlighter", href: "/components/syntax-highlighter" },
      { label: "Table", href: "/components/table" },
      { label: "Tabs", href: "/components/tabs" },
      { label: "TagsInput", href: "/components/tags-input" },
      { label: "TextInput", href: "/components/text-input" },
      { label: "ThemeToggle", href: "/components/theme-toggle" },
      { label: "Toast", href: "/components/toast" },
      { label: "Toggle", href: "/components/toggle" },
      { label: "ToggleGroup", href: "/components/toggle-group" },
      { label: "Tooltip", href: "/components/tooltip" },
      { label: "TransferList", href: "/components/transfer-list" },
      { label: "TreeView", href: "/components/tree-view" },
      { label: "Wizard", href: "/components/wizard" },
      { label: "WorkItemList", href: "/components/work-item-list" },
    ],
  },
  {
    title: "EXAMPLES",
    items: [
      { label: "Docs Home", href: "/docs" },
      { label: "Interior Docs", href: "/docs/chat-completions/usage" },
      {
        label: "Models",
        href: "/models",
        children: [
          { label: "Model Gallery", href: "/models" },
          { label: "Model Detail", href: "/models/solstice-4-vision" },
        ],
      },
      { label: "Guide", href: "/guides/procedural-terrain" },
      { label: "API Reference", href: "/api" },
      { label: "Cookbooks", href: "/guides" },
      { label: "Creators", href: "/community" },
    ],
  },
];

/**
 * Navigation tree for the API reference documentation site.
 *
 * Rendered by {@link Sidebar} component in the left rail.
 * Organizes API endpoints and features (chat, embeddings, files, batch operations, etc.).
 */
export const apiSidebar: NavSection[] = [
  {
    title: "GETTING STARTED",
    items: [
      {
        label: "Chat",
        href: "/api/chat",
        children: [{ label: "POST Chat Completion", href: "/api" }],
      },
      { label: "Fim", href: "/api/fim" },
      { label: "Embeddings", href: "/api/embeddings" },
      { label: "Classifiers", href: "/api/classifiers" },
      { label: "Files", href: "/api/files" },
      { label: "Models", href: "/api/models" },
      { label: "Batch", href: "/api/batch" },
      { label: "Ocr", href: "/api/ocr" },
      { label: "Audio Speech", href: "/api/audio-speech" },
      { label: "Audio Transcriptions", href: "/api/audio-transcriptions" },
    ],
  },
  {
    title: "BETA",
    items: [
      { label: "Beta Agents", href: "/api/beta-agents" },
      { label: "Beta Conversations", href: "/api/beta-conversations" },
      { label: "Beta Libraries", href: "/api/beta-libraries" },
    ],
  },
];

/**
 * Navigation structure for the page footer.
 *
 * Organized into labeled sections (e.g., "Product", "Resources") with internal links and external references.
 * Rendered by Footer component across documentation and API reference sites.
 */
export const footerSections = [
  {
    title: "Product",
    links: [
      { label: "Foundations", href: "/foundations/accessibility" },
      { label: "Shell", href: "/shell/shell" },
      { label: "Layouts", href: "/layouts/docs" },
      { label: "Components", href: "/components/accordion" },
    ],
  },
  {
    title: "Resources",
    links: [
      {
        label: "Source Control",
        href: "https://src.sunbeam.pt/studio/beam-ui",
      },
      {
        label: "Contact Us",
        href:
          "mailto:hello@sunbeam.pt?subject=Beam%20Design%20Language%20Question!&body=Hi!%0A%0AI%20have%20some%20questions%20about%20the%20Beam%20Design%20Language!%0A%0AMy%20question%20is%3A%20%0A%0AI%20look%20forward%20to%20hearing%20from%20you%20%3C3%0A%0ABest%2C%0A",
      },
    ],
  },
];
