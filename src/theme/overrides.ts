import { type TokenKind } from "@/theme/schema"

// Component-level overrides that replace what the shadcn style sets for a
// component. Rules target shadcn's data-slot attributes, which every style and
// every generated shadcn project keeps, so the exported CSS works whichever
// style a project was created with.

export type OverrideProperty = "radius" | "spacing" | "height" | "icon" | "text" | "weight"

export type OverrideTarget = {
  selector: string
  declarations: string[]
  /** Needed where the style itself uses an important utility (e.g. size-3!). */
  important?: boolean
}

export type OverrideSpec = {
  hint: string
  /** Row label when it differs from the property's, e.g. "title size". */
  label?: string
  targets: OverrideTarget[]
}

export type OverrideComponent = {
  id: string
  title: string
  properties: Partial<Record<OverrideProperty, OverrideSpec>>
}

export const OVERRIDE_PROPERTIES: { id: OverrideProperty; label: string; kind: TokenKind }[] = [
  { id: "radius", label: "radius", kind: "radius" },
  { id: "spacing", label: "spacing", kind: "spacing" },
  { id: "height", label: "height", kind: "control-size" },
  { id: "icon", label: "icon size", kind: "icon-size" },
  { id: "text", label: "text size", kind: "font-size" },
  { id: "weight", label: "font weight", kind: "font-weight" },
]

const slots = (...names: string[]) => names.map((name) => `[data-slot="${name}"]`).join(",\n")
// Same svgs the styles size with [&_svg:not([class*='size-'])]:size-4.
const UNSIZED_SVG = 'svg:not([class*="size-"])'

const radius = (selector: string): OverrideSpec => ({
  hint: "Corner radius",
  targets: [{ selector, declarations: ["border-radius"] }],
})

const titleText = (selector: string): OverrideSpec => ({
  hint: "Title text size",
  label: "title size",
  targets: [{ selector, declarations: ["font-size"] }],
})

const titleWeight = (selector: string): OverrideSpec => ({
  hint: "Title font weight",
  label: "title weight",
  targets: [{ selector, declarations: ["font-weight"] }],
})

const INPUTS = slots("input", "textarea", "select-trigger")

export const OVERRIDE_COMPONENTS: OverrideComponent[] = [
  {
    id: "button",
    title: "Button",
    properties: {
      radius: radius(slots("button")),
      spacing: {
        hint: "Horizontal padding (icon buttons keep theirs)",
        targets: [
          {
            selector: '[data-slot="button"]:not([data-size^="icon"])',
            declarations: ["padding-inline"],
          },
        ],
      },
      height: {
        hint: "Default and icon sizes (xs, sm, lg keep the style's)",
        targets: [
          { selector: '[data-slot="button"][data-size="default"]', declarations: ["height"] },
          {
            selector: '[data-slot="button"][data-size="icon"]',
            declarations: ["width", "height"],
          },
        ],
      },
      icon: {
        hint: "Icons without their own size class",
        targets: [
          { selector: `[data-slot="button"] ${UNSIZED_SVG}`, declarations: ["width", "height"] },
        ],
      },
      text: { hint: "Label text size", targets: [{ selector: slots("button"), declarations: ["font-size"] }] },
      weight: {
        hint: "Label font weight",
        targets: [{ selector: slots("button"), declarations: ["font-weight"] }],
      },
    },
  },
  {
    id: "input",
    title: "Input & select",
    properties: {
      radius: radius(INPUTS),
      spacing: {
        hint: "Horizontal padding",
        targets: [{ selector: INPUTS, declarations: ["padding-inline"] }],
      },
      height: {
        hint: "Input and default-size select (textarea keeps its own)",
        targets: [
          {
            selector: '[data-slot="input"],\n[data-slot="select-trigger"][data-size="default"]',
            declarations: ["height"],
          },
        ],
      },
      icon: {
        hint: "Select chevron",
        targets: [
          {
            selector: `[data-slot="select-trigger"] ${UNSIZED_SVG}`,
            declarations: ["width", "height"],
          },
        ],
      },
      text: {
        hint: "Typed text size (below 16px, iOS zooms in on focus)",
        targets: [{ selector: INPUTS, declarations: ["font-size"] }],
      },
    },
  },
  {
    id: "badge",
    title: "Badge",
    properties: {
      radius: radius(slots("badge")),
      spacing: {
        hint: "Horizontal padding",
        targets: [{ selector: slots("badge"), declarations: ["padding-inline"] }],
      },
      icon: {
        hint: "Icons",
        targets: [
          { selector: '[data-slot="badge"] > svg', declarations: ["width", "height"], important: true },
        ],
      },
      text: { hint: "Label text size", targets: [{ selector: slots("badge"), declarations: ["font-size"] }] },
      weight: {
        hint: "Label font weight",
        targets: [{ selector: slots("badge"), declarations: ["font-weight"] }],
      },
    },
  },
  {
    id: "card",
    title: "Card",
    properties: {
      radius: radius(slots("card")),
      spacing: {
        hint: "Padding and gap between sections",
        targets: [{ selector: slots("card"), declarations: ["--card-spacing"] }],
      },
      text: titleText(slots("card-title")),
      weight: titleWeight(slots("card-title")),
    },
  },
  {
    id: "dialog",
    title: "Dialog",
    properties: {
      radius: radius(slots("dialog-content", "alert-dialog-content")),
      spacing: {
        hint: "Padding",
        targets: [
          { selector: slots("dialog-content", "alert-dialog-content"), declarations: ["padding"] },
        ],
      },
      text: titleText(slots("dialog-title", "alert-dialog-title")),
      weight: titleWeight(slots("dialog-title", "alert-dialog-title")),
    },
  },
  {
    id: "popover",
    title: "Popover",
    properties: {
      radius: radius(slots("popover-content")),
      spacing: {
        hint: "Padding",
        targets: [{ selector: slots("popover-content"), declarations: ["padding"] }],
      },
      text: titleText(slots("popover-title")),
      weight: titleWeight(slots("popover-title")),
    },
  },
]

/** Key in ThemeConfig.overrides, e.g. "button.radius". */
export function overrideKey(component: OverrideComponent, property: OverrideProperty) {
  return `${component.id}.${property}`
}
