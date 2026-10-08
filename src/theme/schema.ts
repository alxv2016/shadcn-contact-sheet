import { type DesignToken } from "@/theme/catalog"

import {
  SHADCN_SECTIONS,
  type ThemeGroup,
  type ThemeVar,
  type TokenKind,
} from "@/theme/shadcn-theme.mjs"

export type { ThemeGroup, ThemeVar, TokenKind }

// The variable list lives in shadcn-theme.mjs so the Node token build and the
// app share it; these are the editor's views of it.
function section(id: string) {
  const found = SHADCN_SECTIONS.find((s) => s.id === id)
  if (!found) throw new Error(`Unknown shadcn theme section "${id}"`)
  return found
}

export const COLOR_GROUPS: ThemeGroup[] = SHADCN_SECTIONS.filter((s) =>
  s.vars.every((v) => v.scope === "mode")
)

export const RADIUS_VAR = section("radius").vars[0]
export const TYPOGRAPHY_VARS = section("typography").vars
export const SPACING_VAR = section("spacing").vars[0]
export const SHADOW_GROUP = section("shadows")
export const FOCUS_GROUP = section("focus")

export const COLOR_VARS = COLOR_GROUPS.flatMap((group) => group.vars)

export const GLOBAL_VARS = [
  RADIUS_VAR,
  ...TYPOGRAPHY_VARS,
  SPACING_VAR,
  ...SHADOW_GROUP.vars,
  ...FOCUS_GROUP.vars,
]

/** Global vars that live in the Token Bridge adapter file (shadcn.semantic.json). */
export const ADAPTER_GLOBAL_VARS = new Set(["radius"])

export const TOKEN_FILTERS: Record<TokenKind, (token: DesignToken) => boolean> = {
  color: (token) => token.type === "color",
  // Radius and spacing set a base unit that each style scales per component,
  // so semantic names like radius.card would be misleading here.
  radius: (token) => token.group === "radius" && token.tier === "primitive",
  font: (token) => token.group === "font-stack",
  spacing: (token) => token.group === "spacing" && token.tier === "primitive",
  shadow: (token) => token.group === "elevation",
  border: (token) => token.group === "border",
  // Theme overrides: semantic sizes only where their name fits the use.
  "control-size": (token) =>
    token.group === "size" && (token.tier === "primitive" || token.path.startsWith("size.control-")),
  "icon-size": (token) =>
    token.group === "size" && (token.tier === "primitive" || token.path.startsWith("size.icon-")),
  "font-size": (token) => token.group === "font-size",
  "font-weight": (token) => token.group === "font-weight",
}

