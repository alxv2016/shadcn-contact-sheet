import * as React from "react"
import { ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/radix/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/radix/ui/table"
import { useDesignSystemSearchParams } from "@/preview/design-system"
import { TypographyScaleCard } from "@/preview/typography-scale-card"
import { Badge } from "@/registry/radix/ui/badge"
import { Button } from "@/registry/radix/ui/button"
import { Input } from "@/registry/radix/ui/input"
import { Switch } from "@/registry/radix/ui/switch"
import { getAliasChain, getToken } from "@/theme/catalog"
import { contrast } from "@/theme/operations"
import { SHADOW_GROUP } from "@/theme/schema"
import {
  EXTRA_DOC_ROWS,
  RADIUS_SCALE,
  THEME_DOC_ROWS,
  type ThemeDocRow,
} from "@/theme/theme-docs"

// Live version of https://ui.shadcn.com/docs/theming: every theme token,
// rendered with the current theme and traced back to the design-system token
// it aliases.

function useAliases() {
  const [{ aliases }] = useDesignSystemSearchParams()
  return aliases
}

function AliasChain({ name }: { name: string }) {
  const aliases = useAliases()
  const chain = aliases[name] ? getAliasChain(aliases[name]) : []
  const resolved = chain.at(-1)

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-1 font-mono text-[11px] leading-5">
      <span className="text-foreground">--{name}</span>
      {chain.map((token) => (
        <React.Fragment key={token.path}>
          <ChevronRightIcon className="size-3 text-muted-foreground" />
          <span className={token.tier === "semantic" ? "text-foreground" : "text-muted-foreground"}>
            {token.path}
          </span>
        </React.Fragment>
      ))}
      {resolved && (
        <span className="text-muted-foreground">
          = {resolved.px !== undefined ? `${resolved.px}px` : String(resolved.value)}
        </span>
      )}
    </div>
  )
}

// Same treatment as src/styles/focus-ring.css, drawn statically.
function focusStyle(ring = "var(--ring)"): React.CSSProperties {
  return {
    outline: `var(--focus-ring-width) solid ${ring}`,
    outlineOffset: "var(--focus-ring-offset)",
    boxShadow: "0 0 0 var(--focus-ring-offset) var(--ring-offset)",
  }
}

function Sample({ row }: { row: ThemeDocRow }) {
  const [base, fg] = row.tokens
  const box = "flex h-10 w-16 shrink-0 items-center justify-center rounded-md text-sm font-medium"

  switch (row.sample) {
    case "pair":
      return (
        <div
          className={cn(box, "ring-1 ring-foreground/10")}
          style={{ background: `var(--${base})`, color: `var(--${fg})` }}
        >
          Aa
        </div>
      )
    case "surface":
      return <div className={cn(box, "ring-1 ring-foreground/10")} style={{ background: `var(--${base})` }} />
    case "line":
      return <div className={cn(box, "border-2 bg-background")} style={{ borderColor: `var(--${base})` }} />
    case "ring":
      return (
        <div className="flex h-10 w-16 shrink-0 items-center justify-center">
          <div
            className="h-7 w-12 rounded-md border bg-background"
            style={focusStyle(`var(--${base})`)}
          />
        </div>
      )
    case "palette":
      return (
        <div className="flex h-10 w-16 shrink-0 overflow-hidden rounded-md ring-1 ring-foreground/10">
          {row.tokens.map((token) => (
            <div key={token} className="flex-1" style={{ background: `var(--${token})` }} />
          ))}
        </div>
      )
  }
}

function TokenTable({ rows }: { rows: ThemeDocRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">Sample</TableHead>
          <TableHead>Shadcn theme token → design-system token</TableHead>
          <TableHead className="w-64">What it controls</TableHead>
          <TableHead className="w-72">Used by</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.tokens.join()}>
            <TableCell className="align-top">
              <Sample row={row} />
            </TableCell>
            <TableCell className="align-top whitespace-normal">
              <div className="flex flex-col gap-0.5">
                {row.tokens.map((token) => (
                  <AliasChain key={token} name={token} />
                ))}
              </div>
            </TableCell>
            <TableCell className="align-top text-sm whitespace-normal text-muted-foreground">
              {row.controls}
            </TableCell>
            <TableCell className="align-top text-sm whitespace-normal text-muted-foreground">
              {row.usedBy}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function RadiusScaleCard() {
  const aliases = useAliases()
  const basePx = getAliasChain(aliases.radius ?? "").at(-1)?.px ?? 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Radius Scale</CardTitle>
        <CardDescription>
          Derived from <code className="font-mono">--radius</code>; changing it updates the whole scale.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <AliasChain name="radius" />
        <div className="grid grid-cols-4 gap-x-3 gap-y-4">
          {RADIUS_SCALE.map((step) => (
            <div key={step.name} className="flex flex-col items-center gap-1.5">
              <div
                className="size-14 border-2 border-primary bg-primary/10"
                style={{ borderRadius: `calc(var(--radius) * ${step.factor})` }}
              />
              <span className="font-mono text-[11px]">radius-{step.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                ×{step.factor} · {Math.round(basePx * step.factor * 10) / 10}px
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ShadowsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shadows</CardTitle>
        <CardDescription>Tailwind shadow scale aliased to elevation tokens.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-3 gap-x-4 gap-y-6 rounded-lg bg-muted p-5">
          {SHADOW_GROUP.vars.map((v) => (
            <div key={v.name} className="flex flex-col items-center gap-2">
              <div className="size-14 rounded-lg bg-card" style={{ boxShadow: `var(--${v.name})` }} />
              <span className="font-mono text-[11px]">{v.name}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-0.5">
          {SHADOW_GROUP.vars.map((v) => (
            <AliasChain key={v.name} name={v.name} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// WCAG 2.2 focus appearance needs >= 3:1 between the ring and what it sits on.
const FOCUS_CONTRAST_MIN = 3

function FocusRingCard() {
  const aliases = useAliases()
  const checks = [
    { label: "Ring vs offset fill", against: "ring-offset" },
    { label: "Ring vs page background", against: "background" },
    { label: "Ring vs card", against: "card" },
  ].map((check) => {
    const ratio = aliases.ring && aliases[check.against]
      ? contrast(aliases.ring, aliases[check.against])
      : 0
    return { ...check, ratio, pass: ratio >= FOCUS_CONTRAST_MIN }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Focus Ring</CardTitle>
        <CardDescription>
          Global :focus-visible style for every interactive element. Press Tab to try it.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-muted p-5">
          <Button>Button</Button>
          <Button variant="outline">Outline</Button>
          <Input placeholder="Input" className="w-28" />
          <Switch aria-label="Switch" />
          <a href="#focus" className="text-sm underline underline-offset-4">
            Link
          </a>
        </div>
        <div className="flex flex-col gap-0.5">
          <AliasChain name="ring" />
          <AliasChain name="ring-offset" />
          <AliasChain name="focus-ring-width" />
          <AliasChain name="focus-ring-offset" />
        </div>
        <div className="flex flex-col gap-2">
          {checks.map((check) => (
            <div key={check.label} className="flex items-center gap-2 text-sm">
              <span className="mr-auto text-muted-foreground">{check.label}</span>
              <span className="font-mono text-xs">{check.ratio.toFixed(2)}:1</span>
              <Badge variant={check.pass ? "secondary" : "destructive"}>
                {check.pass ? "Pass 3:1" : "Fail 3:1"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function FontsAndSpacingCard() {
  const aliases = useAliases()
  const unitPx = getAliasChain(aliases.spacing ?? "").at(-1)?.px ?? 0
  const fontName = (name: string) =>
    String(getToken(aliases[name])?.value ?? "").split(",")[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fonts &amp; Spacing</CardTitle>
        <CardDescription>Font families and the Tailwind spacing unit.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3">
          {(["font-heading", "font-sans"] as const).map((name) => (
            <div key={name} className="flex flex-col gap-1 rounded-lg bg-muted p-3">
              <span
                className={cn("text-3xl", name === "font-heading" && "cn-font-heading font-semibold")}
              >
                Aa
              </span>
              <span className="text-sm font-medium">{fontName(name)}</span>
              <span className="font-mono text-[10px] text-muted-foreground">--{name}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-0.5">
          <AliasChain name="font-sans" />
          <AliasChain name="font-heading" />
          <AliasChain name="spacing" />
        </div>
        <div className="flex flex-col gap-1.5">
          {[1, 2, 3, 4, 6, 8, 12].map((n) => (
            <div key={n} className="flex items-center gap-3">
              <span className="w-10 shrink-0 font-mono text-[11px]">p-{n}</span>
              <div
                className="h-3 rounded-sm bg-primary"
                style={{ width: `calc(var(--spacing) * ${n})` }}
              />
              <span className="font-mono text-[10px] text-muted-foreground">{unitPx * n}px</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function TokensView() {
  const [{ mode }] = useDesignSystemSearchParams()

  return (
    <div className="min-h-svh bg-muted [--gap:--spacing(3)] md:[--gap:--spacing(5)] dark:bg-background style-lyra:md:[--gap:--spacing(4)] style-mira:md:[--gap:--spacing(4)]">
      <div className="mx-auto grid max-w-[1400px] items-start gap-(--gap) p-(--gap) pb-20 lg:grid-cols-3">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Shadcn Theme Tokens</CardTitle>
            <CardDescription>
              Shadcn theme token mapping: every token from the shadcn/ui theming docs and the
              design-system token it is mapped to ({mode} mode).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TokenTable rows={THEME_DOC_ROWS} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Additional Shadcn Theme Tokens</CardTitle>
            <CardDescription>
              Shadcn theme token mapping for tokens this theme adds beyond the documented set.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TokenTable rows={EXTRA_DOC_ROWS} />
          </CardContent>
        </Card>
        <div className="flex flex-col gap-(--gap)">
          <RadiusScaleCard />
          <FontsAndSpacingCard />
        </div>
        <div className="flex flex-col gap-(--gap)">
          <ShadowsCard />
          <FocusRingCard />
        </div>
        <TypographyScaleCard />
      </div>
    </div>
  )
}
