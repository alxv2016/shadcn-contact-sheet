// The "Theme Tokens" table from https://ui.shadcn.com/docs/theming
// (apps/v4/content/docs/(root)/theming.mdx), plus the tokens this theme adds.

export type ThemeDocRow = {
  tokens: string[]
  controls: string
  usedBy: string
  /** "pair" renders surface + foreground, "line" a border/ring sample. */
  sample: "pair" | "surface" | "line" | "ring" | "palette"
}

export const THEME_DOC_ROWS: ThemeDocRow[] = [
  { tokens: ["background", "foreground"], sample: "pair", controls: "The default app background and text color.", usedBy: "The page shell, page sections, and default text." },
  { tokens: ["card", "card-foreground"], sample: "pair", controls: "Elevated surfaces and the content inside them.", usedBy: "Card, dashboard panels, settings panels." },
  { tokens: ["popover", "popover-foreground"], sample: "pair", controls: "Floating surfaces and the content inside them.", usedBy: "Popover, DropdownMenu, ContextMenu, and other overlays." },
  { tokens: ["primary", "primary-foreground"], sample: "pair", controls: "High-emphasis actions and brand surfaces.", usedBy: "Default Button, selected states, badges, and active accents." },
  { tokens: ["secondary", "secondary-foreground"], sample: "pair", controls: "Lower-emphasis filled actions and supporting surfaces.", usedBy: "Secondary buttons, secondary badges, and supporting UI." },
  { tokens: ["muted", "muted-foreground"], sample: "pair", controls: "Subtle surfaces and lower-emphasis content.", usedBy: "Descriptions, placeholders, empty states, helper text, and subdued surfaces." },
  { tokens: ["accent", "accent-foreground"], sample: "pair", controls: "Interactive hover, focus, and active surfaces.", usedBy: "Ghost buttons, menu highlight states, hovered rows, and selected items." },
  { tokens: ["destructive"], sample: "surface", controls: "Destructive actions and error emphasis.", usedBy: "Destructive buttons, invalid states, and destructive menu items." },
  { tokens: ["border"], sample: "line", controls: "Default borders and separators.", usedBy: "Cards, menus, tables, separators, and layout dividers." },
  { tokens: ["input"], sample: "line", controls: "Form control borders and input surface treatment.", usedBy: "Input, Textarea, Select, and outline-style controls." },
  { tokens: ["ring"], sample: "ring", controls: "Focus rings and outlines.", usedBy: "Buttons, inputs, checkboxes, menus, and other focusable controls." },
  { tokens: ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"], sample: "palette", controls: "The default chart palette.", usedBy: "Charts and chart-driven dashboard blocks." },
  { tokens: ["sidebar", "sidebar-foreground"], sample: "pair", controls: "The base sidebar surface and default sidebar text.", usedBy: "The Sidebar container and its default content." },
  { tokens: ["sidebar-primary", "sidebar-primary-foreground"], sample: "pair", controls: "High-emphasis actions inside the sidebar.", usedBy: "Active items, icon tiles, badges, and sidebar CTAs." },
  { tokens: ["sidebar-accent", "sidebar-accent-foreground"], sample: "pair", controls: "Hover and selected states inside the sidebar.", usedBy: "Sidebar menu hover states, open items, and interactive rows." },
  { tokens: ["sidebar-border"], sample: "line", controls: "Sidebar-specific borders and separators.", usedBy: "Sidebar headers, groups, and internal dividers." },
  { tokens: ["sidebar-ring"], sample: "ring", controls: "Sidebar-specific focus rings.", usedBy: "Focused controls inside the sidebar." },
]

export const EXTRA_DOC_ROWS: ThemeDocRow[] = [
  { tokens: ["destructive", "destructive-foreground"], sample: "pair", controls: "Text and icons on destructive surfaces.", usedBy: "Solid destructive buttons and alerts." },
  { tokens: ["warning", "warning-foreground"], sample: "pair", controls: "Warning surfaces (the docs' “Adding New Tokens” example).", usedBy: "bg-warning / text-warning-foreground utilities." },
  { tokens: ["ring-offset"], sample: "surface", controls: "Fill between an element and its focus ring.", usedBy: "Global :focus-visible style for every interactive element." },
  { tokens: ["selection", "selection-foreground"], sample: "pair", controls: "Highlighted text selection.", usedBy: "::selection across the app." },
]

export const RADIUS_SCALE = [
  { name: "sm", factor: 0.6 },
  { name: "md", factor: 0.8 },
  { name: "lg", factor: 1 },
  { name: "xl", factor: 1.4 },
  { name: "2xl", factor: 1.8 },
  { name: "3xl", factor: 2.2 },
  { name: "4xl", factor: 2.6 },
]
