import catalogJson from "@/tokens/generated/catalog.json"

export type TokenTier = "primitive" | "semantic"
export type TokenMode = "light" | "dark"

export type DesignToken = {
  /** Dot path as referenced in token files, e.g. "cp.color.bg-default". */
  path: string
  /** CSS custom property emitted by Style Dictionary, e.g. "--cp-color-bg-default". */
  cssVar: string
  type: string
  tier: TokenTier
  group: string
  /** Resolved value (aliases followed). */
  value: string | number
  /** Pixel equivalent for rem dimensions. */
  px?: number
  /** Path of the token this one aliases, if any. */
  ref: string | null
  description?: string
  /** Value and alias under .dark, for tokens with a dark mode. */
  dark?: { value: string | number; ref: string | null }
}

export const TOKENS = catalogJson.tokens as DesignToken[]

/** Top-level group every token path starts with, e.g. "cp". */
export const NAMESPACE = catalogJson.namespace

/** tokenPath("color", "white") -> "cp.color.white" */
export function tokenPath(...segments: string[]) {
  return [NAMESPACE, ...segments].join(".")
}

/** Path without the namespace, for labels: "cp.color.white" -> "color.white". */
export function localPath(path: string) {
  return path.startsWith(`${NAMESPACE}.`) ? path.slice(NAMESPACE.length + 1) : path
}

const COLOR_PRIMITIVE = new RegExp(`^${NAMESPACE}\\.color\\.([a-z]+)-(\\d+)$`)

/** Family of a primitive color path, e.g. "cp.color.blue-500" -> "blue". */
export function colorFamilyOf(path: string | undefined) {
  return path?.match(COLOR_PRIMITIVE)?.[1]
}

export const TOKENS_BY_PATH = new Map(TOKENS.map((token) => [token.path, token]))

export function getToken(path: string | undefined) {
  return path ? TOKENS_BY_PATH.get(path) : undefined
}

/** The token's value as seen in `mode`. */
export function tokenValue(token: DesignToken | undefined, mode: TokenMode = "light") {
  return mode === "dark" && token?.dark ? token.dark.value : token?.value
}

/**
 * Follows aliases to the primitive, e.g. bg-default -> color.white. In dark
 * mode, tokens with a dark value follow their dark alias.
 */
export function getAliasChain(path: string, mode: TokenMode = "light") {
  const chain: DesignToken[] = []
  let token = getToken(path)

  while (token && !chain.includes(token)) {
    chain.push(token)
    const ref = mode === "dark" && token.dark ? token.dark.ref : token.ref
    token = getToken(ref ?? undefined)
  }

  return chain
}

export function cssVarFor(path: string) {
  return getToken(path)?.cssVar ?? `--${path.replace(/\./g, "-")}`
}

/**
 * Color families available in the primitive palette, derived from
 * "cp.color.<family>-<step>" tokens, e.g. { blue: ["cp.color.blue-50", ...] }.
 */
export const COLOR_FAMILIES = TOKENS.reduce<Record<string, string[]>>(
  (families, token) => {
    const family = token.tier === "primitive" ? colorFamilyOf(token.path) : undefined

    if (family) {
      families[family] = [...(families[family] ?? []), token.path]
    }

    return families
  },
  {}
)

for (const family of Object.values(COLOR_FAMILIES)) {
  family.sort((a, b) => stepOf(a) - stepOf(b))
}

function stepOf(path: string) {
  return Number(path.split("-").pop())
}

export function familyStep(family: string, step: number) {
  const path = tokenPath("color", `${family}-${step}`)
  return TOKENS_BY_PATH.has(path) ? path : undefined
}
