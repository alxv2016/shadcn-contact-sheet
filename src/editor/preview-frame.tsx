import * as React from "react"

import { cn } from "@/lib/utils"
import { type ThemeEditor } from "@/editor/use-theme-editor"
import { CHART_TYPES } from "@/theme/chart-types"
import { buildThemeCss, type PreviewItem } from "@/theme/config"
import {
  isMessage,
  type EditorMessage,
  type PreviewMessage,
  type PreviewState,
} from "@/theme/messages"

const PREVIEW_ITEMS: { label: string; value: PreviewItem }[] = [
  { label: "01", value: "preview" },
  { label: "02", value: "preview-02" },
  { label: "Components", value: "components" },
  { label: "Charts", value: "charts" },
  { label: "Tokens", value: "tokens" },
]

const CHART_OPTIONS = CHART_TYPES.map((t) => ({ label: t.label, value: t.type }))

/** Floating segmented control pinned to the bottom of the preview. */
function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string
  options: readonly { label: string; value: T }[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "absolute bottom-3 z-20 flex items-center gap-1 rounded-xl bg-card/90 p-1 shadow-xl ring-1 ring-foreground/10 backdrop-blur-xl",
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          data-active={value === option.value}
          className={cn(
            "h-7 min-w-8 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors outline-none hover:text-foreground",
            "data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function PreviewFrame({
  editor,
  onShortcut,
}: {
  editor: ThemeEditor
  onShortcut: (shortcut: Extract<PreviewMessage, { type: "contact-sheet:shortcut" }>) => void
}) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const { effectiveConfig, mode, item, chart } = editor

  const state = React.useMemo<PreviewState>(
    () => ({
      css: buildThemeCss(effectiveConfig, { boost: true }),
      style: effectiveConfig.style,
      mode,
      item,
      chart,
      aliases: { ...effectiveConfig[mode], ...effectiveConfig.global },
      font: effectiveConfig.global["font-sans"],
      fontHeading: effectiveConfig.global["font-heading"],
    }),
    [effectiveConfig, mode, item, chart]
  )

  const stateRef = React.useRef(state)
  stateRef.current = state

  const send = React.useCallback((next: PreviewState) => {
    const message: EditorMessage = { type: "contact-sheet:state", state: next }
    iframeRef.current?.contentWindow?.postMessage(message, location.origin)
  }, [])

  React.useEffect(() => send(state), [state, send])

  const onShortcutRef = React.useRef(onShortcut)
  onShortcutRef.current = onShortcut

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== location.origin ||
        event.source !== iframeRef.current?.contentWindow
      ) {
        return
      }
      if (isMessage<PreviewMessage>(event.data, "contact-sheet:ready")) {
        send(stateRef.current)
      } else if (isMessage<PreviewMessage>(event.data, "contact-sheet:shortcut")) {
        onShortcutRef.current(event.data as Extract<PreviewMessage, { type: "contact-sheet:shortcut" }>)
      }
    }

    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [send])

  // Initial params only; later changes travel over postMessage so the
  // iframe never reloads (keeps scroll position and open popovers).
  const [src] = React.useState(
    () =>
      `/preview.html?${new URLSearchParams({ style: state.style, mode, item, chart }).toString()}`
  )

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl ring-1 ring-foreground/10">
      <div className="absolute inset-0 bg-muted/30" />
      <iframe ref={iframeRef} src={src} title="Theme preview" className="z-10 size-full flex-1" />
      <Segmented
        className="right-3"
        label="Preview"
        options={PREVIEW_ITEMS}
        value={item}
        onChange={editor.setItem}
      />
      {item === "charts" && (
        <Segmented
          className="left-3"
          label="Chart type"
          options={CHART_OPTIONS}
          value={chart}
          onChange={editor.setChart}
        />
      )}
    </div>
  )
}
