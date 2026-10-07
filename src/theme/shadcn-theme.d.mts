export type TokenKind = "color" | "radius" | "font" | "spacing" | "shadow" | "border"

export type ThemeVar = {
  /** shadcn CSS variable name without the leading "--". */
  name: string
  kind: TokenKind
  /** "mode" vars have separate light/dark aliases; "global" vars have one. */
  scope: "mode" | "global"
  hint?: string
}

export type ThemeGroup = {
  id: string
  title: string
  vars: ThemeVar[]
}

export type ResolvedToken = {
  /** CSS custom property of the aliased DS token, e.g. "--color-bg-default". */
  cssVar: string
  /** Alias chain starting at the aliased token, e.g. ["color.bg-default", "color.white"]. */
  chain: string[]
  /** Final resolved value. */
  value?: string
}

export declare const SHADCN_SECTIONS: ThemeGroup[]
export declare const SHADCN_VAR_NAMES: Set<string>

export declare function formatShadcnThemeCss(options: {
  light: Record<string, string>
  dark: Record<string, string>
  global: Record<string, string>
  resolve: (path: string) => ResolvedToken
  selectors?: { root?: string; dark?: string }
  header?: boolean
}): string
