import * as React from "react"
import type { HighlighterCore } from "shiki/core"

import { cn } from "@/lib/utils"

export type CodeLanguage = "json" | "css"

const THEME = "github-dark-default"

// One shared highlighter, loaded the first time code is shown. Only the JSON
// and CSS grammars are bundled, and the JavaScript regex engine avoids
// shipping Oniguruma's WebAssembly.
let highlighter: Promise<HighlighterCore> | undefined

function getHighlighter() {
  highlighter ??= Promise.all([
    import("shiki/core"),
    import("shiki/engine/javascript"),
  ]).then(([{ createHighlighterCore }, { createJavaScriptRegexEngine }]) =>
    createHighlighterCore({
      themes: [import("shiki/themes/github-dark-default.mjs")],
      langs: [import("shiki/langs/json.mjs"), import("shiki/langs/css.mjs")],
      engine: createJavaScriptRegexEngine(),
    })
  )
  return highlighter
}

export function languageOf(fileName: string): CodeLanguage {
  return fileName.endsWith(".css") ? "css" : "json"
}

/**
 * Syntax-highlighted, scrollable code. Renders the plain text until the
 * highlighter is ready so the layout doesn't change when colors arrive.
 */
export function CodeBlock({
  code,
  language,
  className,
}: {
  code: string
  language: CodeLanguage
  className?: string
}) {
  const [html, setHtml] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setHtml(null)
    getHighlighter().then((h) => {
      if (!cancelled) setHtml(h.codeToHtml(code, { lang: language, theme: THEME }))
    })
    return () => {
      cancelled = true
    }
  }, [code, language])

  const classes = cn(
    "overflow-auto rounded-lg bg-muted p-4 font-mono text-xs leading-relaxed",
    // Shiki sets its theme background inline; keep the dialog's surface.
    "[&_pre]:bg-transparent! [&_pre]:font-mono [&_code]:font-mono",
    className
  )

  return html ? (
    // Shiki escapes the source; the input is code this app generated.
    <div className={classes} dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <div className={classes}>
      <pre>{code}</pre>
    </div>
  )
}
