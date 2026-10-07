import * as React from "react"

import {
  DEFAULT_CONFIG,
  isSameConfig,
  type Mode,
  type PreviewItem,
  type ThemeConfig,
} from "@/theme/config"
import { TOKENS_BY_PATH } from "@/theme/catalog"
import { isChartType, type ChartType } from "@/theme/chart-types"

const STORAGE_KEY = "contact-sheet:editor"

type Persisted = { config: ThemeConfig; mode: Mode; item: PreviewItem; chart: ChartType }

// Drops aliases to tokens that no longer exist (e.g. after tokens:sync).
function sanitize(config: Partial<ThemeConfig> | undefined): ThemeConfig {
  const clean = (aliases: Record<string, string> | undefined, fallback: Record<string, string>) => ({
    ...fallback,
    ...Object.fromEntries(
      Object.entries(aliases ?? {}).filter(([, path]) => TOKENS_BY_PATH.has(path))
    ),
  })

  return {
    style: config?.style ?? DEFAULT_CONFIG.style,
    light: clean(config?.light, DEFAULT_CONFIG.light),
    dark: clean(config?.dark, DEFAULT_CONFIG.dark),
    global: clean(config?.global, DEFAULT_CONFIG.global),
  }
}

function load(): Persisted {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<Persisted> | null
    return {
      config: sanitize(saved?.config),
      mode: saved?.mode === "dark" ? "dark" : "light",
      item: saved?.item ?? "preview",
      chart: isChartType(saved?.chart) ? saved.chart : "area",
    }
  } catch {
    return { config: DEFAULT_CONFIG, mode: "light", item: "preview", chart: "area" }
  }
}

export function useThemeEditor() {
  const [initial] = React.useState(load)
  const [config, setConfig] = React.useState<ThemeConfig>(initial.config)
  const [mode, setMode] = React.useState<Mode>(initial.mode)
  const [item, setItem] = React.useState<PreviewItem>(initial.item)
  const [chart, setChart] = React.useState<ChartType>(initial.chart)
  // Hover previews: shown in the iframe without committing to the config.
  const [override, setOverride] = React.useState<ThemeConfig | null>(null)

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ config, mode, item, chart }))
    } catch {
      // Storage unavailable (private mode); the session still works.
    }
  }, [config, mode, item, chart])

  const update = React.useCallback(
    (next: ThemeConfig | ((current: ThemeConfig) => ThemeConfig)) => {
      setOverride(null)
      setConfig((current) => {
        const value = typeof next === "function" ? next(current) : next
        return isSameConfig(value, current) ? current : value
      })
    },
    []
  )

  return {
    config,
    effectiveConfig: override ?? config,
    mode,
    item,
    chart,
    setChart,
    setMode,
    toggleMode: React.useCallback(() => setMode((m) => (m === "light" ? "dark" : "light")), []),
    setItem,
    update,
    reset: React.useCallback(() => update(DEFAULT_CONFIG), [update]),
    isDefault: isSameConfig(config, DEFAULT_CONFIG),
    preview: setOverride,
  }
}

export type ThemeEditor = ReturnType<typeof useThemeEditor>
