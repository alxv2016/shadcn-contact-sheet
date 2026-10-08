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
  /** Literal value instead of the chosen token (e.g. "0" for joined corners). */
  value?: string
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

// A Button rendered through a Radix trigger (<DropdownMenuTrigger asChild>)
// takes the trigger's data-slot but keeps the Button's data-variant/data-size.
const BUTTON_ELEMENTS = ['[data-slot="button"]', '[data-slot$="-trigger"][data-variant][data-size]']
const buttons = (suffix = "") => BUTTON_ELEMENTS.map((element) => `${element}${suffix}`).join(",\n")

const radius = (elements: string[], { grouped = false } = {}): OverrideSpec => ({
  hint: "Corner radius",
  targets: [
    { selector: elements.join(",\n"), declarations: ["border-radius"] },
    ...(grouped ? buttonGroupCorners(elements) : []),
  ],
})

const HORIZONTAL_GROUP = '[data-slot="button-group"]:not([data-orientation="vertical"])'
const VERTICAL_GROUP = '[data-slot="button-group"][data-orientation="vertical"]'

/**
 * Inside a ButtonGroup, a plain border-radius would round the joined corners
 * the group squares off, while the styles' important outer-edge utility
 * (rounded-r-lg! on the last item) would keep the style's radius. Mirror the
 * group's rules: joined corners stay square, the outer edge takes the token.
 */
function buttonGroupCorners(elements: string[]): OverrideTarget[] {
  const children = (group: string, pseudo: string) =>
    elements.map((element) => `${group} > ${element}${pseudo}`).join(",\n")
  const corners = (side: "left" | "right" | "top" | "bottom") =>
    side === "left" || side === "right"
      ? [`border-top-${side}-radius`, `border-bottom-${side}-radius`]
      : [`border-${side}-left-radius`, `border-${side}-right-radius`]
  const lastItem = ":not(:has(~ [data-slot]))"

  return [
    { selector: children(HORIZONTAL_GROUP, ":not(:first-child)"), declarations: corners("left"), value: "0" },
    { selector: children(HORIZONTAL_GROUP, ":not(:last-child)"), declarations: corners("right"), value: "0" },
    { selector: children(HORIZONTAL_GROUP, lastItem), declarations: corners("right"), important: true },
    { selector: children(VERTICAL_GROUP, ":not(:first-child)"), declarations: corners("top"), value: "0" },
    { selector: children(VERTICAL_GROUP, ":not(:last-child)"), declarations: corners("bottom"), value: "0" },
    { selector: children(VERTICAL_GROUP, lastItem), declarations: corners("bottom"), important: true },
  ]
}

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

const INPUT_ELEMENTS = ["input", "textarea", "select-trigger"].map((name) => `[data-slot="${name}"]`)
const INPUTS = INPUT_ELEMENTS.join(",\n")

export const OVERRIDE_COMPONENTS: OverrideComponent[] = [
  {
    id: "button",
    title: "Button",
    properties: {
      radius: radius(BUTTON_ELEMENTS, { grouped: true }),
      spacing: {
        hint: "Horizontal padding (icon buttons keep theirs)",
        targets: [
          {
            selector: buttons(':not([data-size^="icon"])'),
            declarations: ["padding-inline"],
          },
        ],
      },
      height: {
        hint: "Default and icon sizes (xs, sm, lg keep the style's)",
        targets: [
          { selector: buttons('[data-size="default"]'), declarations: ["height"] },
          {
            selector: buttons('[data-size="icon"]'),
            declarations: ["width", "height"],
          },
        ],
      },
      icon: {
        hint: "Icons without their own size class",
        targets: [
          { selector: buttons(` ${UNSIZED_SVG}`), declarations: ["width", "height"] },
        ],
      },
      text: { hint: "Label text size", targets: [{ selector: buttons(), declarations: ["font-size"] }] },
      weight: {
        hint: "Label font weight",
        targets: [{ selector: buttons(), declarations: ["font-weight"] }],
      },
    },
  },
  {
    id: "input",
    title: "Input & select",
    properties: {
      radius: radius(INPUT_ELEMENTS, { grouped: true }),
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
      radius: radius(['[data-slot="badge"]']),
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
      radius: radius(['[data-slot="card"]']),
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
      radius: radius(['[data-slot="dialog-content"]', '[data-slot="alert-dialog-content"]']),
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
      radius: radius(['[data-slot="popover-content"]']),
      spacing: {
        hint: "Padding",
        targets: [{ selector: slots("popover-content"), declarations: ["padding"] }],
      },
      text: titleText(slots("popover-title")),
      weight: titleWeight(slots("popover-title")),
    },
  },
  {
    id: "bubble",
    title: "Chat bubble",
    properties: {
      radius: radius(['[data-slot="bubble-content"]']),
      spacing: {
        hint: "Horizontal padding (vertical keeps the style's)",
        targets: [{ selector: slots("bubble-content"), declarations: ["padding-inline"] }],
      },
      text: {
        hint: "Message text size",
        targets: [{ selector: slots("bubble-content"), declarations: ["font-size"] }],
      },
    },
  },
]

/** Key in ThemeConfig.overrides, e.g. "button.radius". */
export function overrideKey(component: OverrideComponent, property: OverrideProperty) {
  return `${component.id}.${property}`
}
