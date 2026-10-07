// Builds the design-system tokens in ./tokens with Style Dictionary v5.
//
// Outputs (src/tokens/generated/):
//   tokens.css          DS tokens as CSS custom properties. Semantic tokens keep
//                       their aliases as var() references to primitives.
//   shadcn.theme.css    The shadcn theme token mapping: every shadcn/ui theme
//                       variable (:root + .dark) as an alias of a DS token,
//                       grouped and annotated with what it resolves to. From
//                       tokens/shadcn.semantic.json, dark.shadcn.semantic.json
//                       and shadcn.extensions.json.
//   catalog.json        Every DS token with its tier, kind, alias and resolved
//                       value. Drives the token pickers in the theme editor.
//   tailwind.theme.css  Tailwind v4 theme with the default scales the DS
//                       covers reset to `initial` and rebuilt from DS tokens,
//                       so Tailwind only contributes utility classes.
//
// Variable names follow the Token Bridge convention (path segments joined
// with "-", no prefix), so CSS generated here is interchangeable with the
// output of the original token package.
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { createRequire } from "node:module"
import StyleDictionary from "style-dictionary"

import {
  formatShadcnThemeCss,
  SHADCN_VAR_NAMES,
} from "../src/theme/shadcn-theme.mjs"

const TOKENS_DIR = "tokens"
const BUILD_PATH = "src/tokens/generated/"

// The Token Bridge export authored rem values against a 22px root
// ("Base unit for rem conversion: 22"). Browsers default to a 16px root, so
// rem dimensions are rebased here to keep the px sizes designed in Figma.
const SOURCE_REM_BASE = Number(process.env.TOKENS_SOURCE_REM_BASE ?? 22)
const TARGET_REM_BASE = Number(process.env.TOKENS_TARGET_REM_BASE ?? 16)

const ADAPTER_FILES = {
  light: `${TOKENS_DIR}/shadcn.semantic.json`,
  dark: `${TOKENS_DIR}/dark.shadcn.semantic.json`,
  extensions: `${TOKENS_DIR}/shadcn.extensions.json`,
}

const DS_FILE = /^(primitives?|semantics?)\..+\.json$/u
const dsFiles = readdirSync(TOKENS_DIR)
  .filter((file) => DS_FILE.test(file))
  .sort()
  .map((file) => `${TOKENS_DIR}/${file}`)

function sanitizeSegment(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/-+/gu, "-")
    .replace(/^-|-$/gu, "")
}

function tierOf(filePath) {
  const fileName = String(filePath).split("/").pop() ?? ""
  return fileName.startsWith("primitive") ? "primitive" : "semantic"
}

function formatNumber(value) {
  return Number(value.toFixed(4)).toString()
}

// Source rem values were rounded to 3 decimals, so 16px arrives as
// 0.727rem * 22 = 15.994px. Snap to whole pixels when that close.
function remToPx(rem) {
  const px = rem * SOURCE_REM_BASE
  const whole = Math.round(px)
  return Math.abs(px - whole) < 0.05 ? whole : Math.round(px * 100) / 100
}

function referenceOf(token) {
  const original = token.original?.$value ?? token.original?.value
  return typeof original === "string" && /^\{[^}]+\}$/u.test(original)
    ? original.slice(1, -1)
    : null
}

StyleDictionary.registerTransform({
  name: "contact-sheet/name",
  type: "name",
  transform: (token) => token.path.map(sanitizeSegment).filter(Boolean).join("-"),
})

StyleDictionary.registerTransform({
  name: "contact-sheet/rem-rebase",
  type: "value",
  transitive: true,
  filter: (token) =>
    typeof (token.$value ?? token.value) === "string" &&
    /^-?\d*\.?\d+rem$/u.test(token.$value ?? token.value),
  transform: (token) => {
    const px = remToPx(Number.parseFloat(token.$value ?? token.value))
    return `${formatNumber(px / TARGET_REM_BASE)}rem`
  },
})

const TRANSFORMS = ["contact-sheet/name", "contact-sheet/rem-rebase"]

StyleDictionary.registerFormat({
  name: "contact-sheet/catalog",
  format: ({ dictionary }) => {
    const tokens = dictionary.allTokens.map((token) => {
      const value = token.$value ?? token.value
      const remMatch =
        typeof value === "string" ? value.match(/^(-?\d*\.?\d+)rem$/u) : null

      return {
        path: token.path.join("."),
        cssVar: `--${token.name}`,
        type: token.$type ?? token.type ?? "string",
        tier: tierOf(token.filePath),
        group: token.path[0],
        value,
        px: remMatch
          ? Math.round(Number(remMatch[1]) * TARGET_REM_BASE * 100) / 100
          : undefined,
        ref: referenceOf(token),
        description: token.$description ?? token.description ?? undefined,
      }
    })

    return `${JSON.stringify({ remBase: TARGET_REM_BASE, tokens }, null, 2)}\n`
  },
})

mkdirSync(BUILD_PATH, { recursive: true })

const ds = new StyleDictionary(
  {
    source: dsFiles,
    log: { verbosity: "silent" },
    platforms: {
      css: {
        transforms: TRANSFORMS,
        buildPath: BUILD_PATH,
        files: [
          {
            destination: "tokens.css",
            format: "css/variables",
            options: { outputReferences: true, selector: ":root" },
          },
          { destination: "catalog.json", format: "contact-sheet/catalog" },
        ],
      },
    },
  },
  { verbosity: "silent" }
)
await ds.buildAllPlatforms()

// ---------------------------------------------------------------------------
// Tailwind theme: the design system is the single source of truth.
//
// 1. Every default namespace the DS covers is reset with `initial`, so none
//    of Tailwind's own values reach the CSS.
// 2. DS tokens are exposed as utilities under their own names
//    (bg-blue-500, text-body, rounded-card, shadow-raised, gap-stack-md…).
// 3. Tailwind's scale names that components rely on (text-sm, font-medium,
//    leading-tight…) are re-pointed at the nearest DS token, but only when it
//    is within COMPAT_TOLERANCE of Tailwind's default; others are dropped.
//
// Utilities are declared `@theme inline reference`: values are inlined as
// var(--<ds-token>) and nothing is emitted, which avoids self-references
// such as --color-blue-500: var(--color-blue-500).
// ---------------------------------------------------------------------------

const COMPAT_TOLERANCE = 0.1
const RESET_NAMESPACES = [
  "color",
  "font",
  "font-weight",
  "text",
  "leading",
  "radius",
  "shadow",
  "breakpoint",
]
// shadcn derives these from --radius / the shadow aliases (src/styles/theme.css).
const SHADCN_RADIUS_KEYS = new Set(["sm", "md", "lg", "xl", "2xl", "3xl", "4xl"])

const require = createRequire(import.meta.url)

function readTailwindDefaults() {
  const css = readFileSync(require.resolve("tailwindcss/theme.css"), "utf8")
  const defaults = new Map()
  for (const [, name, value] of css.matchAll(/^\s*--([a-z0-9-]+):\s*([^;]+);/gmu)) {
    defaults.set(name, value.trim())
  }
  return defaults
}

// "0.875rem" -> 14, "calc(1.25 / 0.875)" -> 1.4286, "1.5" -> 1.5, "96rem" -> 1536
function toNumber(value) {
  const calc = value.match(/^calc\(\s*([\d.]+)\s*\/\s*([\d.]+)\s*\)$/u)
  if (calc) return Number(calc[1]) / Number(calc[2])
  const rem = value.match(/^([\d.]+)rem$/u)
  if (rem) return Number(rem[1]) * TARGET_REM_BASE
  const px = value.match(/^([\d.]+)px$/u)
  if (px) return Number(px[1])
  return Number(value)
}

function tokenNumber(token) {
  return token.px ?? toNumber(String(token.value))
}

// Nearest DS token to a Tailwind default; ties go to the larger token.
function nearest(tokens, target, { tolerance = Infinity } = {}) {
  let best
  for (const token of tokens) {
    const distance = Math.abs(tokenNumber(token) - target)
    const bestDistance = best ? Math.abs(tokenNumber(best) - target) : Infinity
    if (
      distance < bestDistance ||
      (distance === bestDistance && tokenNumber(token) > tokenNumber(best))
    ) {
      best = token
    }
  }
  return best && Math.abs(tokenNumber(best) - target) <= target * tolerance
    ? best
    : undefined
}

function buildTailwindTheme(tokens) {
  const defaults = readTailwindDefaults()
  const group = (name, tier) =>
    tokens.filter((t) => t.group === name && (!tier || t.tier === tier))
  const leaf = (token) => token.path.split(".").slice(1).join("-")
  const defaultKeys = (namespace) =>
    [...defaults.keys()]
      .filter((key) => key.startsWith(`${namespace}-`) && !key.includes("--"))
      .map((key) => key.slice(namespace.length + 1))

  const resets = RESET_NAMESPACES.map((ns) => `  --${ns}-*: initial;`)
  const literal = []
  const utilities = []
  const section = (title, lines) => {
    if (lines.length) utilities.push(`\n  /* ${title} */`, ...lines)
  }

  // Breakpoints feed media queries at build time, so they must be literal.
  const breakpointLines = []
  const byPx = (a, b) => tokenNumber(a) - tokenNumber(b)
  const primitiveBreakpoints = group("breakpoint", "primitive").sort(byPx)
  for (const token of primitiveBreakpoints) {
    breakpointLines.push(`  --breakpoint-${leaf(token)}: ${token.value};`)
  }
  for (const token of group("breakpoint", "semantic").sort(byPx)) {
    breakpointLines.push(`  --breakpoint-${leaf(token)}: ${token.value};`)
  }
  for (const key of defaultKeys("breakpoint")) {
    if (primitiveBreakpoints.some((t) => leaf(t) === key)) continue
    const match = nearest(primitiveBreakpoints, toNumber(defaults.get(`breakpoint-${key}`)), {
      tolerance: COMPAT_TOLERANCE,
    })
    if (match) breakpointLines.push(`  --breakpoint-${key}: ${match.value}; /* ≈ ${match.path} */`)
  }
  literal.push("\n  /* Breakpoints (literal: media queries cannot read var()) */", ...breakpointLines)

  // Spacing unit stays a real variable so the theme editor can re-alias it.
  const extensions = existsSync(ADAPTER_FILES.extensions)
    ? JSON.parse(readFileSync(ADAPTER_FILES.extensions, "utf8"))
    : {}
  const spacingRef = referenceOf({ original: extensions.spacing ?? {} })
  if (spacingRef) {
    literal.push(
      "\n  /* Spacing unit: p-4 = calc(var(--spacing) * 4) */",
      `  --spacing: var(--${spacingRef.split(".").map(sanitizeSegment).join("-")});`
    )
  }

  section(
    "Colors: every DS color token",
    tokens.filter((t) => t.type === "color").map((t) => `  ${t.cssVar}: var(${t.cssVar});`)
  )

  const fontSizes = group("font-size")
  const lineHeights = group("line-height")
  section("Font sizes: DS names", fontSizes.map((t) => `  --text-${leaf(t)}: var(${t.cssVar});`))
  section(
    "Font sizes: Tailwind names -> nearest DS token",
    defaultKeys("text").flatMap((key) => {
      const match = nearest(fontSizes, toNumber(defaults.get(`text-${key}`)), {
        tolerance: COMPAT_TOLERANCE,
      })
      if (!match) return []
      const lineHeight = defaults.get(`text-${key}--line-height`)
      const leading = lineHeight && nearest(lineHeights, toNumber(lineHeight))
      return [
        `  --text-${key}: var(${match.cssVar});`,
        ...(leading ? [`  --text-${key}--line-height: var(${leading.cssVar});`] : []),
      ]
    })
  )

  const weights = group("font-weight")
  section("Font weights: DS names", weights.map((t) => `  --font-weight-${leaf(t)}: var(${t.cssVar});`))
  section(
    "Font weights: Tailwind names -> nearest DS token",
    defaultKeys("font-weight").flatMap((key) => {
      if (weights.some((t) => leaf(t) === key)) return []
      const match = nearest(weights, toNumber(defaults.get(`font-weight-${key}`)), {
        tolerance: COMPAT_TOLERANCE,
      })
      return match ? [`  --font-weight-${key}: var(${match.cssVar});`] : []
    })
  )

  section("Line heights: DS names", lineHeights.map((t) => `  --leading-${leaf(t)}: var(${t.cssVar});`))
  section(
    "Line heights: Tailwind names -> nearest DS token",
    defaultKeys("leading").flatMap((key) => {
      const match = nearest(lineHeights, toNumber(defaults.get(`leading-${key}`)), {
        tolerance: COMPAT_TOLERANCE,
      })
      return match ? [`  --leading-${key}: var(${match.cssVar});`] : []
    })
  )

  // Primitive radius names (sm, lg…) would clash with the shadcn scale, so
  // semantic radii are exposed by name and other Tailwind keys by nearest.
  section("Radius: DS semantic names", group("radius", "semantic").map((t) => `  --radius-${leaf(t)}: var(${t.cssVar});`))
  section(
    "Radius: Tailwind names -> nearest DS token (sm-4xl come from --radius)",
    defaultKeys("radius").flatMap((key) => {
      if (SHADCN_RADIUS_KEYS.has(key)) return []
      const match = nearest(group("radius", "primitive"), toNumber(defaults.get(`radius-${key}`)), {
        tolerance: COMPAT_TOLERANCE,
      })
      return match ? [`  --radius-${key}: var(${match.cssVar});`] : []
    })
  )

  section(
    "Shadows: DS elevation names (xs-2xl come from the shadcn shadow aliases)",
    group("elevation", "semantic").map((t) => `  --shadow-${leaf(t)}: var(${t.cssVar});`)
  )

  // Only semantic spacing: primitive names (sm, lg…) would hijack
  // max-w-lg & co., which fall back to the spacing namespace.
  section(
    "Spacing: DS semantic names (gap-stack-md, p-inset-card…)",
    group("spacing", "semantic").map((t) => `  --spacing-${leaf(t)}: var(${t.cssVar});`)
  )

  return `/**
 * Do not edit directly, this file was auto-generated by scripts/build-tokens.mjs.
 * Tailwind theme built from design-system tokens. Tailwind's own defaults for
 * the namespaces below are reset, so the DS is the single source of truth.
 */

@theme {
${resets.join("\n")}
${literal.join("\n")}
}

@theme inline reference {${utilities.join("\n")}
}
`
}

const catalog = JSON.parse(readFileSync(`${BUILD_PATH}catalog.json`, "utf8"))
writeFileSync(`${BUILD_PATH}tailwind.theme.css`, buildTailwindTheme(catalog.tokens))

// ---------------------------------------------------------------------------
// shadcn theme token mapping (shadcn.theme.css), formatted by the same module
// the theme editor uses, so the file matches what the editor shows.
// ---------------------------------------------------------------------------

const tokensByPath = new Map(catalog.tokens.map((token) => [token.path, token]))

// { "primary": { "$value": "{color.bg-action-primary}" } } -> { primary: "color.bg-action-primary" }
function readAliases(file) {
  if (!existsSync(file)) return {}
  const aliases = {}
  for (const [name, token] of Object.entries(JSON.parse(readFileSync(file, "utf8")))) {
    if (name.startsWith("$")) continue
    const ref = referenceOf({ original: token })
    if (!ref) continue
    if (!SHADCN_VAR_NAMES.has(name)) {
      console.warn(`  ${file}: "${name}" is not a shadcn theme variable, skipped`)
      continue
    }
    if (!tokensByPath.has(ref)) {
      throw new Error(`${file}: "${name}" aliases {${ref}}, which is not a design token`)
    }
    aliases[name] = ref
  }
  return aliases
}

function resolveAlias(path) {
  const chain = []
  for (let token = tokensByPath.get(path); token && !chain.includes(token); ) {
    chain.push(token)
    token = token.ref ? tokensByPath.get(token.ref) : undefined
  }
  return {
    cssVar: tokensByPath.get(path).cssVar,
    chain: chain.map((token) => token.path),
    value: chain.length ? String(chain.at(-1).value) : undefined,
  }
}

const lightAliases = readAliases(ADAPTER_FILES.light)
writeFileSync(
  `${BUILD_PATH}shadcn.theme.css`,
  formatShadcnThemeCss({
    light: lightAliases,
    dark: readAliases(ADAPTER_FILES.dark),
    global: { ...lightAliases, ...readAliases(ADAPTER_FILES.extensions) },
    resolve: resolveAlias,
  })
)
// Replaced by shadcn.theme.css.
rmSync(`${BUILD_PATH}shadcn.adapter.css`, { force: true })

console.log(
  `Built ${dsFiles.length} token files -> ${BUILD_PATH} (rem base ${SOURCE_REM_BASE} -> ${TARGET_REM_BASE})`
)
