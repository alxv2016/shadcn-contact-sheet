import * as React from "react"

import { Customizer } from "@/editor/customizer"
import { PreviewFrame } from "@/editor/preview-frame"
import { useThemeEditor } from "@/editor/use-theme-editor"
import { TOKENS } from "@/theme/catalog"

const TOKEN_SUMMARY = `${TOKENS.filter((t) => t.tier === "semantic").length} semantic · ${
  TOKENS.filter((t) => t.tier === "primitive").length
} primitive tokens`

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  )
}

export function App() {
  const editor = useThemeEditor()
  const { toggleMode } = editor

  const handleShortcut = React.useCallback(
    ({ key, meta }: { key: string; meta: boolean }) => {
      if (key === "d" && !meta) {
        toggleMode()
        return true
      }
      return false
    },
    [toggleMode]
  )

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTyping(event.target) || event.altKey) return
      // Leave keys alone while a picker/dialog has focus.
      if (document.querySelector("[data-slot=popover-content],[data-slot=dialog-content]")) return
      const handled = handleShortcut({
        key: event.key.toLowerCase(),
        meta: event.metaKey || event.ctrlKey,
      })
      if (handled) event.preventDefault()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [handleShortcut])

  return (
    <div className="flex h-svh flex-col bg-background text-foreground [--customizer-width:--spacing(64)] 2xl:[--customizer-width:--spacing(72)]">
      <header className="flex h-12 shrink-0 items-center gap-3 px-4 md:px-6">
        <div className="flex size-6 items-center justify-center rounded-md bg-foreground text-background">
          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        </div>
        <span className="text-sm font-semibold">Contact Sheet</span>
        <span className="hidden text-sm text-muted-foreground sm:inline">
          shadcn/ui theme creator for your design tokens
        </span>
        <span className="ml-auto hidden font-mono text-xs text-muted-foreground md:inline">
          {TOKEN_SUMMARY}
        </span>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 pt-0 md:flex-row-reverse md:gap-6 md:p-6 md:pt-0">
        <PreviewFrame editor={editor} onShortcut={handleShortcut} />
        <Customizer editor={editor} />
      </div>
    </div>
  )
}
