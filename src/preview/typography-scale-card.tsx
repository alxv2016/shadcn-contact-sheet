import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/radix/ui/card"
import { localPath, TOKENS } from "@/theme/catalog"

// The design system's type scale, straight from the text, font-weight and
// leading tokens (rendered through their CSS variables).

const byPx = (group: string) =>
  TOKENS.filter((t) => t.group === group).sort((a, b) => (b.px ?? 0) - (a.px ?? 0))

const byValue = (group: string) =>
  TOKENS.filter((t) => t.group === group).sort((a, b) => Number(a.value) - Number(b.value))

const FONT_SIZES = byPx("text")
const FONT_WEIGHTS = byValue("font-weight")
const LINE_HEIGHTS = byValue("leading")
const FONT_STACK = TOKENS.find((t) => t.group === "font")
const HEADING_MIN_PX = 20

// "extra-large-title-2-3" -> "XL Title 2.3", "title-1" -> "Title 1"
function humanize(path: string) {
  const name = path
    .split(".")
    .pop()!
    .replace(/^extra-large-/, "xl-")
    .replace(/(\d)-(\d)/g, "$1.$2")
  return name
    .split("-")
    .map((word) => (word === "xl" ? "XL" : word[0].toUpperCase() + word.slice(1)))
    .join(" ")
}

export function TypographyScaleCard({ className }: { className?: string }) {
  const family = String(FONT_STACK?.value ?? "").split(",")[0]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Typography Scale</CardTitle>
        <CardDescription>
          {FONT_SIZES.length} font-size tokens · {family}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col">
          {FONT_SIZES.map((token) => (
            <div
              key={token.path}
              className="flex min-w-0 flex-col gap-1 border-b border-border/60 py-2.5 first:pt-0 last:border-0 last:pb-0"
            >
              <div className="flex items-baseline justify-between gap-2 font-mono text-[10px] text-muted-foreground">
                <span>{localPath(token.path)}</span>
                <span className="shrink-0">
                  {token.px}px · {token.value}
                </span>
              </div>
              <div
                className={cn(
                  "min-w-0 truncate leading-tight",
                  (token.px ?? 0) >= HEADING_MIN_PX && "cn-font-heading font-semibold"
                )}
                style={{ fontSize: `var(${token.cssVar})` }}
              >
                {humanize(token.path)}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {FONT_WEIGHTS.map((token) => (
            <div key={token.path} className="flex flex-col items-center gap-1 rounded-lg bg-muted py-2">
              <span className="text-xl" style={{ fontWeight: `var(${token.cssVar})` }}>
                Aa
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {token.path.split(".").pop()} {token.value}
              </span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {LINE_HEIGHTS.map((token) => (
            <div key={token.path} className="flex flex-col gap-1">
              <p
                className="line-clamp-3 rounded-md bg-muted px-1.5 text-[10px]"
                style={{ lineHeight: `var(${token.cssVar})` }}
              >
                Rhythm keeps long text readable and calm.
              </p>
              <span className="text-center font-mono text-[10px] text-muted-foreground">
                {token.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
