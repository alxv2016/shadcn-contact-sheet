import * as React from "react"
import {
  ChevronDownIcon,
  MoonIcon,
  RotateCcwIcon,
  SaveIcon,
  ShuffleIcon,
  SunIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/radix/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/radix/ui/collapsible"
import { Separator } from "@/registry/radix/ui/separator"
import { STYLES } from "@/registry/styles"
import { exportTokensZip } from "@/editor/export-zip"
import { GetCodeDialog } from "@/editor/get-code-dialog"
import { OptionPicker, TokenModeContext, TokenPicker, TokenSwatch } from "@/editor/pickers"
import { type ThemeEditor } from "@/editor/use-theme-editor"
import { COLOR_FAMILIES } from "@/theme/catalog"
import { getAlias, setAlias, type StyleName, type ThemeConfig } from "@/theme/config"
import {
  OVERRIDE_COMPONENTS,
  OVERRIDE_PROPERTIES,
  overrideKey,
  type OverrideComponent,
} from "@/theme/overrides"
import {
  FAMILY_NAMES,
  applyChartFamily,
  applyThemeFamily,
  familyOf,
  randomize,
} from "@/theme/operations"
import {
  COLOR_GROUPS,
  RADIUS_VAR,
  FOCUS_GROUP,
  SHADOW_GROUP,
  SPACING_VAR,
  TYPOGRAPHY_VARS,
  type ThemeGroup,
  type ThemeVar,
} from "@/theme/schema"

const STYLE_OPTIONS = STYLES.map((style) => ({
  value: style.name,
  title: style.title,
  description: style.description,
  icon: <span className="flex size-4 [&_svg]:size-4">{style.icon}</span>,
}))

function FamilyRamp({ family, className }: { family: string; className?: string }) {
  const steps = COLOR_FAMILIES[family] ?? []
  const picks = [2, 4, 6, 8].map((i) => steps[Math.min(i, steps.length - 1)])

  return (
    <span className={cn("flex -space-x-1", className)}>
      {picks.map((path) => (
        <TokenSwatch key={path} path={path} kind="color" className="size-3.5" />
      ))}
    </span>
  )
}

const CHART_VARS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"]

const FAMILY_OPTIONS = FAMILY_NAMES.map((family) => ({
  value: family,
  title: family[0].toUpperCase() + family.slice(1),
  description: `color.${family}-* primitives`,
  icon: <FamilyRamp family={family} />,
}))

function Section({
  title,
  count,
  defaultOpen,
  children,
}: {
  title: string
  count?: number
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="group/section">
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground outline-none hover:text-foreground">
        {title}
        {count !== undefined && <span className="opacity-60">{count}</span>}
        <ChevronDownIcon className="ml-auto size-3.5 transition-transform group-data-[state=closed]/section:-rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col">{children}</CollapsibleContent>
    </Collapsible>
  )
}

function VarGroup({
  group,
  defaultOpen,
  renderVar,
}: {
  group: ThemeGroup
  defaultOpen?: boolean
  renderVar: (v: ThemeVar) => React.ReactNode
}) {
  return (
    <Section title={group.title} count={group.vars.length} defaultOpen={defaultOpen}>
      {group.vars.map((v) => (
        <React.Fragment key={v.name}>{renderVar(v)}</React.Fragment>
      ))}
    </Section>
  )
}

function withOverride(config: ThemeConfig, key: string, path: string | null): ThemeConfig {
  const { [key]: _previous, ...rest } = config.overrides
  return { ...config, overrides: path ? { ...rest, [key]: path } : rest }
}

export function Customizer({ editor }: { editor: ThemeEditor }) {
  const { config, mode, update, preview } = editor

  const tokenPicker = (v: ThemeVar, variant: "card" | "row", label?: string) => (
    <TokenPicker
      name={v.name}
      hint={variant === "card" ? (label ?? v.name) : v.hint}
      kind={v.kind}
      variant={variant}
      value={getAlias(config, v, mode)}
      onChange={(path) => update((c) => setAlias(c, v, mode, path))}
      onPreview={(path) => preview(path ? setAlias(config, v, mode, path) : null)}
    />
  )

  const overridePicker = (
    component: OverrideComponent,
    property: (typeof OVERRIDE_PROPERTIES)[number]
  ) => {
    const spec = component.properties[property.id]
    if (!spec) return null

    const key = overrideKey(component, property.id)
    const value = config.overrides[key]
    const label = spec.label ?? property.label

    return (
      <div key={property.id} className="flex items-center">
        <div className="min-w-0 flex-1">
          <TokenPicker
            name={label}
            hint={spec.hint}
            property={[...new Set(spec.targets.flatMap((t) => t.declarations))].join(", ")}
            emptyLabel="Style default"
            kind={property.kind}
            value={value}
            onChange={(path) => update((c) => withOverride(c, key, path))}
            onPreview={(path) => preview(path ? withOverride(config, key, path) : null)}
          />
        </div>
        {value && (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Reset ${component.title} ${label} to the style default`}
            title="Reset to style default"
            onClick={() => update((c) => withOverride(c, key, null))}
          >
            <XIcon />
          </Button>
        )}
      </div>
    )
  }

  return (
    <TokenModeContext.Provider value={mode}>
      <aside className="dark isolate z-10 flex max-h-[45svh] min-h-0 w-full flex-col self-start overflow-hidden rounded-2xl bg-card/90 text-card-foreground ring-1 ring-foreground/10 backdrop-blur-xl md:h-full md:max-h-full md:w-(--customizer-width)">
        <header className="flex items-center gap-1 border-b px-3 py-2">
          <div className="flex rounded-lg bg-muted p-0.5 text-xs font-medium">
            {(["light", "dark"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => editor.setMode(m)}
                data-active={mode === m}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-muted-foreground capitalize outline-none data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-xs"
              >
                {m === "light" ? <SunIcon className="size-3.5" /> : <MoonIcon className="size-3.5" />}
                {m}
              </button>
            ))}
          </div>
        </header>

        <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-3">
          <OptionPicker
            label="Style"
            options={STYLE_OPTIONS}
            value={config.style}
            onChange={(style) => update((c) => ({ ...c, style: style as StyleName }))}
            onPreview={(style) => preview(style ? { ...config, style: style as StyleName } : null)}
            adornment={
              <span className="flex size-4 [&_svg]:size-4">
                {STYLES.find((s) => s.name === config.style)?.icon}
              </span>
            }
          />
          <OptionPicker
            label="Theme"
            options={FAMILY_OPTIONS}
            value={familyOf(config.light.primary)}
            onChange={(family) => update((c) => applyThemeFamily(c, family))}
            onPreview={(family) => preview(family ? applyThemeFamily(config, family) : null)}
            adornment={<TokenSwatch path={config[mode].primary} kind="color" />}
          />
          <OptionPicker
            label="Chart Color"
            options={FAMILY_OPTIONS}
            value={familyOf(config.light["chart-1"])}
            onChange={(family) => update((c) => applyChartFamily(c, family))}
            onPreview={(family) => preview(family ? applyChartFamily(config, family) : null)}
            adornment={
              <span className="flex -space-x-1">
                {CHART_VARS.map((name) => (
                  <TokenSwatch key={name} path={config[mode][name]} kind="color" className="size-3.5" />
                ))}
              </span>
            }
          />
          <div className="flex flex-col gap-1">
            {tokenPicker(RADIUS_VAR, "card", "Radius Multiplier")}
            <p className="px-2.5 text-[11px] leading-snug text-muted-foreground">
              Base radius only: each Style sets how much of it each component uses. Some styles, like
              Lyra and Sera, ignore it.
            </p>
          </div>
          {tokenPicker(TYPOGRAPHY_VARS[0], "card", "Font")}
          {tokenPicker(TYPOGRAPHY_VARS[1], "card", "Heading")}
          <div className="flex flex-col gap-1">
            {tokenPicker(SPACING_VAR, "card", "Spacing Multiplier")}
            <p className="px-2.5 text-[11px] leading-snug text-muted-foreground">
              Scales every padding, gap and size. Per-component spacing comes from the Style.
            </p>
          </div>

          <Separator className="-mx-3 my-1 w-auto!" />

          <div className="flex flex-col gap-0.5 px-2">
            <span className="text-xs font-medium">Theme overrides</span>
            <span className="text-[11px] leading-snug text-muted-foreground">
              Component radius, spacing, sizes and type that replace the Style's own values.
              Exported as shadcn.overrides.css.
            </span>
          </div>
          <div className="-mx-1 flex flex-col gap-1">
            {OVERRIDE_COMPONENTS.map((component) => {
              const active = OVERRIDE_PROPERTIES.filter(
                (p) => config.overrides[overrideKey(component, p.id)]
              ).length

              return (
                <Section
                  key={component.id}
                  title={component.title}
                  count={active || undefined}
                >
                  {OVERRIDE_PROPERTIES.map((p) => overridePicker(component, p))}
                </Section>
              )
            })}
          </div>

          <Separator className="-mx-3 my-1 w-auto!" />

          <div className="flex items-baseline justify-between px-2">
            <span className="text-xs font-medium">Colors</span>
            <span className="text-[11px] text-muted-foreground">{mode} mode</span>
          </div>
          <div className="-mx-1 flex flex-col gap-1">
            {COLOR_GROUPS.map((group, index) => (
              <VarGroup
                key={group.id}
                group={group}
                defaultOpen={index < 3}
                renderVar={(v) => tokenPicker(v, "row")}
              />
            ))}
            <VarGroup group={SHADOW_GROUP} renderVar={(v) => tokenPicker(v, "row")} />
            <VarGroup group={FOCUS_GROUP} renderVar={(v) => tokenPicker(v, "row")} />
          </div>
        </div>

        <footer className="flex flex-col gap-2 border-t p-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => update((c) => randomize(c))}
            >
              <ShuffleIcon />
              Shuffle
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              disabled={editor.isDefault}
              onClick={editor.reset}
            >
              <RotateCcwIcon />
              Reset
            </Button>
          </div>
          <Button
            variant="secondary"
            onClick={() =>
              toast.promise(exportTokensZip(config), {
                loading: "Packaging theme…",
                success: (count) => `Theme saved: ${count} files downloaded as a .zip`,
                error: (error) => `Save failed: ${String(error)}`,
              })
            }
          >
            <SaveIcon />
            Save Theme
          </Button>
          <GetCodeDialog config={config} />
        </footer>
      </aside>
    </TokenModeContext.Provider>
  )
}
