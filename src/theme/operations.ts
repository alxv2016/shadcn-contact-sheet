import { STYLES } from "@/registry/styles"
import {
  COLOR_FAMILIES,
  colorFamilyOf,
  familyStep,
  getAliasChain,
  getToken,
  tokenPath,
  TOKENS,
} from "@/theme/catalog"
import { DEFAULT_CONFIG, type Aliases, type ThemeConfig } from "@/theme/config"

/** Primitive a token ultimately resolves to, e.g. cp.color.bg-action-primary -> cp.color.grey-900. */
export function primitiveOf(path: string | undefined) {
  return path ? getAliasChain(path).at(-1)?.path : undefined
}

export function familyOf(path: string | undefined) {
  return colorFamilyOf(primitiveOf(path))
}

export const FAMILY_NAMES = Object.keys(COLOR_FAMILIES)

function relativeLuminance(path: string) {
  const match = String(getToken(path)?.value).match(
    /hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%/
  )
  if (!match) return 0.5

  const [h, s, l] = [Number(match[1]), Number(match[2]) / 100, Number(match[3]) / 100]
  const a = s * Math.min(l, 1 - l)
  const channel = (n: number) => {
    const k = (n + h / 30) % 12
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }

  return 0.2126 * channel(0) + 0.7152 * channel(8) + 0.0722 * channel(4)
}

/** WCAG contrast ratio between two color tokens. */
export function contrast(a: string, b: string) {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** Picks whichever candidate token reads best on `background`. */
export function bestForeground(background: string, candidates: string[]) {
  return candidates.reduce((best, candidate) =>
    contrast(background, candidate) > contrast(background, best) ? candidate : best
  )
}

/**
 * Prefer the alias already committed in ./tokens when it lands on the same
 * primitive, so picking "grey" restores semantic tokens such as
 * cp.color.bg-action-primary instead of raw cp.color.grey-900.
 */
function preferDefault(defaults: Aliases, name: string, path: string | undefined) {
  if (!path) return undefined
  return primitiveOf(defaults[name]) === primitiveOf(path) ? defaults[name] : path
}

function withSteps(
  aliases: Aliases,
  defaults: Aliases,
  family: string,
  steps: Record<string, number>
) {
  const next = { ...aliases }

  for (const [name, step] of Object.entries(steps)) {
    const path = preferDefault(defaults, name, familyStep(family, step))
    if (path) next[name] = path
  }

  return next
}

function withFamily(
  aliases: Aliases,
  defaults: Aliases,
  family: string,
  steps: Record<string, number>,
  foregrounds: string[]
) {
  const next = withSteps(aliases, defaults, family, steps)

  for (const [surface, fg] of [
    ["primary", "primary-foreground"],
    ["sidebar-primary", "sidebar-primary-foreground"],
  ]) {
    const candidates = [defaults[fg], ...foregrounds].filter(Boolean)
    next[fg] = bestForeground(next[surface], candidates)
  }

  return next
}

/** shadcn's "Theme" picker, driven by a DS color family. */
export function applyThemeFamily(config: ThemeConfig, family: string): ThemeConfig {
  return {
    ...config,
    light: withFamily(
      config.light,
      DEFAULT_CONFIG.light,
      family,
      {
        primary: 600,
        ring: 500,
        "sidebar-primary": 600,
        "sidebar-ring": 500,
        selection: 100,
        "selection-foreground": 900,
      },
      ["text-inverse", "text-default", "white", "grey-900"].map((name) => tokenPath("color", name))
    ),
    dark: withFamily(
      config.dark,
      DEFAULT_CONFIG.dark,
      family,
      {
        primary: 500,
        ring: 400,
        "sidebar-primary": 500,
        "sidebar-ring": 400,
        selection: 800,
      },
      ["white", "grey-900"].map((name) => tokenPath("color", name))
    ),
  }
}

/** shadcn's "Chart color" picker: chart-1…chart-5 as a light-to-dark ramp of one family. */
export function applyChartFamily(config: ThemeConfig, family: string): ThemeConfig {
  return {
    ...config,
    light: withSteps(config.light, DEFAULT_CONFIG.light, family, {
      "chart-1": 300,
      "chart-2": 500,
      "chart-3": 600,
      "chart-4": 700,
      "chart-5": 800,
    }),
    dark: withSteps(config.dark, DEFAULT_CONFIG.dark, family, {
      "chart-1": 200,
      "chart-2": 400,
      "chart-3": 500,
      "chart-4": 600,
      "chart-5": 700,
    }),
  }
}

function sample<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

export function randomize(config: ThemeConfig): ThemeConfig {
  const radii = TOKENS.filter(
    (t) => t.group === "radius" && t.tier === "primitive" && (t.px ?? 0) <= 24
  )

  const family = sample(FAMILY_NAMES)

  return {
    ...applyChartFamily(applyThemeFamily(config, family), family),
    style: sample(STYLES.map((s) => s.name)),
    global: { ...config.global, radius: sample(radii).path },
  }
}
