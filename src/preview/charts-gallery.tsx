import * as React from "react"

import { cn } from "@/lib/utils"
import { Spinner } from "@/registry/radix/ui/spinner"
import { useDesignSystemSearchParams } from "@/preview/design-system"
import { CHART_TYPES } from "@/theme/chart-types"

// shadcn's chart examples (ui.shadcn.com/charts), rendered with the
// style-aware radix components so they follow the theme. The chart type is
// picked in the editor and arrives with the preview state.

type ChartModule = Record<string, React.ComponentType>

const CHART_MODULES = import.meta.glob<ChartModule>(
  "@/registry/radix/charts/chart-*.tsx"
)

const lazyCharts = new Map<string, React.LazyExoticComponent<React.ComponentType>>()

function getLazyChart(id: string) {
  if (!lazyCharts.has(id)) {
    const load = Object.entries(CHART_MODULES).find(([path]) =>
      path.endsWith(`/${id}.tsx`)
    )![1]
    lazyCharts.set(
      id,
      React.lazy(() => load().then((mod) => ({ default: Object.values(mod)[0] })))
    )
  }
  return lazyCharts.get(id)!
}

export function ChartsGallery() {
  const [{ chart }] = useDesignSystemSearchParams()
  const group = CHART_TYPES.find((t) => t.type === chart) ?? CHART_TYPES[0]

  return (
    <div className="min-h-svh bg-muted [--gap:--spacing(3)] md:[--gap:--spacing(5)] dark:bg-background style-lyra:md:[--gap:--spacing(4)] style-mira:md:[--gap:--spacing(4)]">
      <div
        key={group.type}
        className="mx-auto grid max-w-[1400px] items-stretch gap-(--gap) p-(--gap) pb-20 md:grid-cols-2 lg:grid-cols-3"
      >
        {group.charts.map((item) => {
          const Chart = getLazyChart(item.id)
          return (
            <div
              key={item.id}
              className={cn(
                "flex flex-col *:data-[slot=card]:flex-1",
                item.fullWidth && "md:col-span-2 lg:col-span-3"
              )}
            >
              <React.Suspense
                fallback={
                  <div className="flex min-h-80 flex-1 items-center justify-center rounded-xl bg-card text-muted-foreground">
                    <Spinner />
                  </div>
                }
              >
                <Chart />
              </React.Suspense>
            </div>
          )
        })}
      </div>
    </div>
  )
}
