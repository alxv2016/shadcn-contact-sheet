import * as React from "react"

import Preview01 from "@/registry/radix/blocks/preview"
import Preview02 from "@/registry/radix/blocks/preview-02"
import { Toaster } from "@/registry/radix/ui/sonner"
import { TooltipProvider } from "@/registry/radix/ui/tooltip"
import { ChartsGallery } from "@/preview/charts-gallery"
import { ComponentsGallery } from "@/preview/components-gallery"
import { TokensView } from "@/preview/tokens-view"
import { DesignSystemProvider } from "@/preview/design-system"
import { isChartType, type ChartType } from "@/theme/chart-types"
import { DEFAULT_CONFIG, type PreviewItem, type StyleName } from "@/theme/config"
import {
  isMessage,
  type EditorMessage,
  type PreviewMessage,
  type PreviewState,
} from "@/theme/messages"

const THEME_STYLE_ID = "contact-sheet-theme"

// Opened directly (outside the editor) the preview falls back to the
// committed theme in ./tokens and these URL params.
function initialState(): PreviewState {
  const params = new URLSearchParams(location.search)
  const mode = params.get("mode") === "dark" ? "dark" : "light"
  return {
    css: "",
    style: (params.get("style") as StyleName) ?? "nova",
    mode,
    aliases: { ...DEFAULT_CONFIG[mode], ...DEFAULT_CONFIG.global },
    item: (params.get("item") as PreviewItem) ?? "preview",
    chart: isChartType(params.get("chart")) ? (params.get("chart") as ChartType) : "area",
    font: DEFAULT_CONFIG.global["font-sans"],
    fontHeading: DEFAULT_CONFIG.global["font-heading"],
  }
}

function postToEditor(message: PreviewMessage) {
  if (window.parent !== window) {
    window.parent.postMessage(message, location.origin)
  }
}

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  )
}

export function PreviewApp() {
  const [state, setState] = React.useState(initialState)

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== location.origin) return
      if (isMessage<EditorMessage>(event.data, "contact-sheet:state")) {
        setState(event.data.state)
      }
    }

    // Forward the editor's `d` (light/dark) shortcut typed while the preview has focus.
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTyping(event.target) || event.altKey) return
      const meta = event.metaKey || event.ctrlKey
      const key = event.key.toLowerCase()
      if (key === "d" && !meta) {
        event.preventDefault()
        postToEditor({
          type: "contact-sheet:shortcut",
          key,
          meta,
        })
      }
    }

    window.addEventListener("message", onMessage)
    window.addEventListener("keydown", onKeyDown)
    postToEditor({ type: "contact-sheet:ready" })

    return () => {
      window.removeEventListener("message", onMessage)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  React.useLayoutEffect(() => {
    let style = document.getElementById(THEME_STYLE_ID)
    if (!style) {
      style = document.createElement("style")
      style.id = THEME_STYLE_ID
      document.head.appendChild(style)
    }
    style.textContent = state.css

    document.documentElement.classList.toggle("dark", state.mode === "dark")
    document.documentElement.style.colorScheme = state.mode
    document.body.className = `style-${state.style}`
  }, [state.css, state.mode, state.style])

  const { css: _css, ...params } = state

  return (
    <DesignSystemProvider value={params}>
      <TooltipProvider>
        {state.item === "components" ? (
          <ComponentsGallery />
        ) : state.item === "charts" ? (
          <ChartsGallery />
        ) : state.item === "tokens" ? (
          <TokensView />
        ) : (
          <div className="relative bg-background">
            {state.item === "preview-02" ? <Preview02 /> : <Preview01 />}
          </div>
        )}
      </TooltipProvider>
      <Toaster theme={state.mode} />
    </DesignSystemProvider>
  )
}
