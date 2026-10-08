import * as React from "react"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/radix/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/radix/ui/popover"
import { getAliasChain, getToken, TOKENS, type DesignToken } from "@/theme/catalog"
import { TOKEN_FILTERS, type TokenKind } from "@/theme/schema"

export function tokenLabel(path: string | undefined, kind: TokenKind) {
  if (!path) return "—"
  return kind === "color" ? path.replace(/^color\./, "") : path
}

function formatValue(token: DesignToken) {
  if (token.px !== undefined) return `${token.px}px`
  const value = String(token.value)
  return value.length > 28 ? `${value.slice(0, 26)}…` : value
}

export function TokenSwatch({
  path,
  kind,
  className,
}: {
  path: string | undefined
  kind: TokenKind
  className?: string
}) {
  // Resolve to the primitive: a semantic token's own catalog value can be stale.
  const value = String((path ? getAliasChain(path).at(-1) : undefined)?.value ?? getToken(path)?.value ?? "")
  const base = "inline-flex size-4 shrink-0 items-center justify-center"

  switch (kind) {
    case "color":
      return (
        <span
          className={cn(base, "rounded-full ring-1 ring-foreground/15 ring-inset", className)}
          style={{ background: value || "transparent" }}
        />
      )
    case "radius":
      return (
        <span
          className={cn(base, "border-t-2 border-l-2 border-foreground/70", className)}
          style={{ borderTopLeftRadius: `min(${value}, 1rem)` }}
        />
      )
    case "font":
      return (
        <span
          className={cn(base, "text-[11px] leading-none font-semibold", className)}
          style={{ fontFamily: value }}
        >
          Aa
        </span>
      )
    case "spacing":
      return (
        <span className={cn(base, "justify-start", className)}>
          <span
            className="h-2 rounded-[1px] bg-foreground/70"
            style={{ width: `min(${value}, 1rem)` }}
          />
        </span>
      )
    case "border":
      return (
        <span className={cn(base, className)}>
          <span className="w-3.5 rounded-full bg-foreground/80" style={{ height: `min(${value}, 0.5rem)` }} />
        </span>
      )
    case "shadow":
      return (
        <span
          className={cn(base, "rounded-[3px] bg-white", className)}
          style={{ boxShadow: value }}
        />
      )
    case "control-size":
    case "icon-size":
      return (
        <span className={cn(base, className)}>
          <span
            className="rounded-[2px] ring-1 ring-foreground/70 ring-inset"
            style={{ width: `min(calc(${value} / 2.5), 1rem)`, height: `min(calc(${value} / 2.5), 1rem)` }}
          />
        </span>
      )
    case "font-size":
    case "font-weight":
      return (
        <span
          className={cn(base, "leading-none", className)}
          style={
            kind === "font-size"
              ? { fontSize: `min(calc(${value} * 0.75), 1rem)` }
              : { fontSize: "11px", fontWeight: Number(value) || undefined }
          }
        >
          Aa
        </span>
      )
  }
}

// Font weights have no px; order them by their numeric value instead.
function sizeOf(token: DesignToken) {
  return token.px ?? (Number(token.value) || 0)
}

function groupTokens(kind: TokenKind) {
  const tokens = TOKENS.filter(TOKEN_FILTERS[kind])
  const groups: { heading: string; tokens: DesignToken[] }[] = [
    { heading: "Semantic tokens", tokens: tokens.filter((t) => t.tier === "semantic") },
  ]
  const primitives = tokens.filter((t) => t.tier === "primitive")

  if (kind === "color") {
    const families = new Map<string, DesignToken[]>()
    for (const token of primitives) {
      const family = token.path.match(/^color\.([a-z]+)-\d+$/)?.[1] ?? "base"
      families.set(family, [...(families.get(family) ?? []), token])
    }
    for (const [family, list] of families) {
      groups.push({
        heading: `Primitives · ${family}`,
        tokens: list.sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true })),
      })
    }
  } else {
    groups.push({
      heading: "Primitive tokens",
      tokens: primitives.sort((a, b) => sizeOf(a) - sizeOf(b)),
    })
  }

  return groups.filter((g) => g.tokens.length)
}

/**
 * Fixed two-line header (chain, then resolved value). Each line is a single
 * truncated row so highlighting tokens with longer names never changes the
 * popover's height; the full text is available as a tooltip.
 */
function AliasChain({
  name,
  path,
  kind,
}: {
  name: string
  path: string | undefined
  kind: TokenKind
}) {
  const chain = path ? getAliasChain(path) : []
  const resolved = chain.at(-1)
  const chainText = [name, ...chain.map((token) => token.path)].join(" › ")
  const valueText = resolved
    ? resolved.px !== undefined
      ? `${resolved.px}px · ${resolved.value}`
      : String(resolved.value)
    : "—"

  return (
    <div className="grid gap-1 font-mono text-[11px] leading-4">
      <div className="truncate text-muted-foreground" title={chainText}>
        <span className="text-foreground">{name}</span>
        {chain.map((token) => (
          <React.Fragment key={token.path}>
            <span className="px-1 opacity-60">›</span>
            <span className={token.tier === "semantic" ? "text-foreground" : undefined}>
              {token.path}
            </span>
          </React.Fragment>
        ))}
      </div>
      <div className="flex h-4 min-w-0 items-center gap-1.5 text-muted-foreground" title={valueText}>
        <TokenSwatch path={resolved?.path} kind={kind} className="size-3" />
        <span className="truncate">{valueText}</span>
      </div>
    </div>
  )
}

/**
 * Picks the design token a shadcn variable aliases. Highlighting an item
 * (hover or arrow keys) previews it live; selecting commits it.
 */
export function TokenPicker({
  name,
  hint,
  property,
  emptyLabel = "—",
  kind,
  value,
  onChange,
  onPreview,
  variant = "row",
}: {
  name: string
  hint?: string
  /** What the token is assigned to in the header chain; defaults to --name. */
  property?: string
  /** Shown when no token is set. */
  emptyLabel?: string
  kind: TokenKind
  value: string | undefined
  onChange: (path: string) => void
  onPreview: (path: string | null) => void
  variant?: "card" | "row"
}) {
  const [open, setOpen] = React.useState(false)
  const [highlighted, setHighlighted] = React.useState(value ?? "")
  const groups = React.useMemo(() => groupTokens(kind), [kind])
  const listRef = React.useRef<HTMLDivElement>(null)
  // A value outside the list (e.g. a semantic default) selects its primitive.
  const selected =
    value && !groups.some((g) => g.tokens.some((t) => t.path === value))
      ? getAliasChain(value).at(-1)?.path
      : value

  React.useEffect(() => {
    if (!open) return
    setHighlighted(selected ?? "")
    // Bring the current token into view once the list has rendered.
    requestAnimationFrame(() => {
      listRef.current
        ?.querySelector("[data-selected=true]")
        ?.scrollIntoView({ block: "center" })
    })
  }, [open, selected])

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) onPreview(null)
      }}
    >
      <PopoverTrigger asChild>
        {variant === "card" ? (
          <button
            type="button"
            className="relative w-full rounded-lg px-2.5 py-2 text-left ring-1 ring-foreground/10 outline-none select-none hover:bg-muted focus-visible:ring-foreground/50 data-[state=open]:bg-muted"
          >
            <div className="text-xs text-muted-foreground">{hint ?? name}</div>
            <div className="truncate pr-6 text-sm font-medium">{tokenLabel(value, kind)}</div>
            <TokenSwatch
              path={value}
              kind={kind}
              className="absolute top-1/2 right-2.5 -translate-y-1/2"
            />
          </button>
        ) : (
          <button
            type="button"
            title={hint}
            className="flex w-full min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none select-none hover:bg-muted focus-visible:ring-1 focus-visible:ring-foreground/50 data-[state=open]:bg-muted"
          >
            <TokenSwatch path={value} kind={kind} />
            <span className="shrink-0 font-mono text-xs">{name}</span>
            <span className="ml-auto truncate pl-2 text-right text-xs text-muted-foreground">
              {value ? tokenLabel(value, kind) : emptyLabel}
            </span>
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={12}
        collisionPadding={12}
        className="w-80 gap-0 p-0"
        onMouseLeave={() => onPreview(null)}
      >
        <div className="flex flex-col gap-1.5 border-b px-3 py-2.5">
          <div className="flex min-w-0 items-baseline justify-between gap-2">
            <span className="shrink-0 text-sm font-medium">{name}</span>
            {hint && <span className="truncate text-xs text-muted-foreground">{hint}</span>}
          </div>
          <AliasChain name={property ?? `--${name}`} path={highlighted || value} kind={kind} />
        </div>
        <Command
          value={highlighted}
          onValueChange={(next) => {
            setHighlighted(next)
            if (open && next) onPreview(next)
          }}
          className="rounded-none! bg-transparent"
        >
          <CommandInput placeholder="Search tokens…" />
          <CommandList ref={listRef} className="h-80 max-h-none">
            <CommandEmpty>No matching tokens.</CommandEmpty>
            {groups.map((group) => (
              <CommandGroup key={group.heading} heading={group.heading}>
                {group.tokens.map((token) => (
                  <CommandItem
                    key={token.path}
                    value={token.path}
                    keywords={[String(token.value), token.ref ?? ""]}
                    onSelect={() => {
                      onChange(token.path)
                      setOpen(false)
                    }}
                    className="gap-2"
                  >
                    <TokenSwatch path={token.path} kind={kind} />
                    <span className="truncate font-mono text-xs">{tokenLabel(token.path, kind)}</span>
                    <span className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground">
                      {token.ref ? `→ ${tokenLabel(token.ref, kind)}` : formatValue(token)}
                    </span>
                    <CheckIcon
                      className={cn("size-3.5!", token.path === selected ? "opacity-100" : "opacity-0")}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export type Option = {
  value: string
  title: string
  description?: string
  icon?: React.ReactNode
}

/** Small fixed list picker (style, theme and chart color families) with hover previews. */
export function OptionPicker({
  label,
  options,
  value,
  onChange,
  onPreview,
  adornment,
}: {
  label: string
  options: Option[]
  value: string | undefined
  onChange: (value: string) => void
  onPreview: (value: string | null) => void
  adornment?: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const [highlighted, setHighlighted] = React.useState(value ?? "")
  const current = options.find((o) => o.value === value)

  React.useEffect(() => {
    if (open) setHighlighted(value ?? "")
  }, [open, value])

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) onPreview(null)
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative w-full rounded-lg px-2.5 py-2 text-left ring-1 ring-foreground/10 outline-none select-none hover:bg-muted focus-visible:ring-foreground/50 data-[state=open]:bg-muted"
        >
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="truncate pr-6 text-sm font-medium">{current?.title ?? "Custom"}</div>
          <span className="absolute top-1/2 right-2.5 -translate-y-1/2">{adornment}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={12}
        collisionPadding={12}
        className="w-64 p-0"
        onMouseLeave={() => onPreview(null)}
      >
        <Command
          value={highlighted}
          onValueChange={(next) => {
            setHighlighted(next)
            if (open && next) onPreview(next)
          }}
          className="bg-transparent"
        >
          <CommandList className="max-h-96">
            <CommandGroup heading={label}>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className="items-start gap-2.5"
                >
                  {option.icon && <span className="mt-0.5 shrink-0">{option.icon}</span>}
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-medium">{option.title}</span>
                    {option.description && (
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    )}
                  </span>
                  <CheckIcon
                    className={cn(
                      "mt-0.5 ml-auto size-3.5!",
                      option.value === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
