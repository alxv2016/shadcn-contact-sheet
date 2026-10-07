import catalogJson from "@/tokens/generated/catalog.json"

export type TokenTier = "primitive" | "semantic"

export type DesignToken = {
  /** Dot path as referenced in token files, e.g. "color.bg-default". */
  path: string
  /** CSS custom property emitted by Style Dictionary, e.g. "--color-bg-default". */
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
}

export const TOKENS = catalogJson.tokens as DesignToken[]

export const TOKENS_BY_PATH = new Map(TOKENS.map((token) => [token.path, token]))

export function getToken(path: string | undefined) {
  return path ? TOKENS_BY_PATH.get(path) : undefined
}

/** Follows aliases to the primitive, e.g. bg-default -> color.white. */
export function getAliasChain(path: string) {
  const chain: DesignToken[] = []
  let token = getToken(path)

  while (token && !chain.includes(token)) {
    chain.push(token)
    token = getToken(token.ref ?? undefined)
  }

  return chain
}

export function cssVarFor(path: string) {
  return getToken(path)?.cssVar ?? `--${path.replace(/\./g, "-")}`
}

/**
 * Color families available in the primitive palette, derived from
 * "color.<family>-<step>" tokens, e.g. { blue: ["color.blue-50", ...] }.
 */
export const COLOR_FAMILIES = TOKENS.reduce<Record<string, string[]>>(
  (families, token) => {
    const match =
      token.tier === "primitive" && token.path.match(/^color\.([a-z]+)-(\d+)$/)

    if (match) {
      families[match[1]] = [...(families[match[1]] ?? []), token.path]
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
  const path = `color.${family}-${step}`
  return TOKENS_BY_PATH.has(path) ? path : undefined
}
