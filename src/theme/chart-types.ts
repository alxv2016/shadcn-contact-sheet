// Chart groups shown in the preview's Charts view. Same groups and order as
// shadcn's apps/v4/app/(app)/charts/charts.tsx.

export type ChartType = (typeof CHART_TYPES)[number]["type"]

const ids = (prefix: string, names: string[]) =>
  names.map((name) => ({ id: `chart-${prefix}-${name}`, fullWidth: false }))

const interactive = (prefix: string) => ({
  id: `chart-${prefix}-interactive`,
  fullWidth: true,
})

export const CHART_TYPES = [
  {
    type: "area",
    label: "Area",
    charts: [
      interactive("area"),
      ...ids("area", ["default", "linear", "step", "legend", "stacked", "stacked-expand", "icons", "gradient", "axes"]),
    ],
  },
  {
    type: "bar",
    label: "Bar",
    charts: [
      interactive("bar"),
      ...ids("bar", ["default", "horizontal", "multiple", "stacked", "label", "label-custom", "mixed", "active", "negative"]),
    ],
  },
  {
    type: "line",
    label: "Line",
    charts: [
      interactive("line"),
      ...ids("line", ["default", "linear", "step", "multiple", "dots", "dots-custom", "dots-colors", "label", "label-custom"]),
    ],
  },
  {
    type: "pie",
    label: "Pie",
    charts: ids("pie", ["simple", "separator-none", "label", "label-custom", "label-list", "legend", "donut", "donut-active", "donut-text", "stacked", "interactive"]),
  },
  {
    type: "radar",
    label: "Radar",
    charts: ids("radar", ["default", "dots", "lines-only", "label-custom", "grid-custom", "grid-none", "grid-circle", "grid-circle-no-lines", "grid-circle-fill", "grid-fill", "multiple", "legend", "icons", "radius"]),
  },
  {
    type: "radial",
    label: "Radial",
    charts: ids("radial", ["simple", "label", "grid", "text", "shape", "stacked"]),
  },
  {
    type: "tooltip",
    label: "Tooltip",
    charts: ids("tooltip", ["default", "indicator-line", "indicator-none", "label-custom", "label-formatter", "label-none", "formatter", "icons", "advanced"]),
  },
] as const

export function isChartType(value: unknown): value is ChartType {
  return CHART_TYPES.some((t) => t.type === value)
}
