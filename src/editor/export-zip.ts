import {
  ADAPTER_FILE_NAMES,
  buildAdapterFiles,
  buildGlobalsCss,
  buildShadcnThemeCss,
  TAILWIND_THEME_CSS,
  type ThemeConfig,
} from "@/theme/config"

// Design-system token sources from ./tokens, as raw text. The shadcn alias
// files are excluded here and regenerated from the editor's current config.
const TOKEN_SOURCES = import.meta.glob<string>("/tokens/*.json", {
  query: "?raw",
  import: "default",
})

const ROOT = "shadcn-theme-tokens"
const ALIAS_FILES = new Set<string>(Object.values(ADAPTER_FILE_NAMES))

async function collectFiles(config: ThemeConfig) {
  const files: Record<string, string> = {}

  for (const [path, load] of Object.entries(TOKEN_SOURCES)) {
    const name = path.split("/").pop()!
    if (!ALIAS_FILES.has(name)) files[`tokens/${name}`] = await load()
  }
  for (const [name, contents] of Object.entries(buildAdapterFiles(config))) {
    files[`tokens/${name}`] = contents
  }

  const { default: tokensCss } = await import("@/tokens/generated/tokens.css?raw")
  files["css/tokens.css"] = tokensCss
  files["css/tailwind.theme.css"] = TAILWIND_THEME_CSS
  files["css/shadcn.theme.css"] = buildShadcnThemeCss(config)
  files["css/globals.css"] = buildGlobalsCss(config)

  return files
}

/**
 * Downloads the current theme as a zip: the Style Dictionary sources plus the
 * shadcn mapping (tokens/) and the CSS a shadcn project needs (css/).
 * Returns the number of files written.
 */
export async function exportTokensZip(config: ThemeConfig) {
  const [{ strToU8, zipSync }, files] = await Promise.all([
    import("fflate"),
    collectFiles(config),
  ])

  const entries = Object.fromEntries(
    Object.entries(files)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([path, contents]) => [`${ROOT}/${path}`, strToU8(contents)])
  )
  const zip = zipSync(entries, { level: 6 })

  const date = new Date().toISOString().slice(0, 10)
  const url = URL.createObjectURL(new Blob([zip], { type: "application/zip" }))
  const link = Object.assign(document.createElement("a"), {
    href: url,
    download: `${ROOT}-${date}.zip`,
  })
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)

  return Object.keys(files).length
}
