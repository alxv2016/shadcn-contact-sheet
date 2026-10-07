import { type ChartType } from "@/theme/chart-types"
import {
  type Aliases,
  type Mode,
  type PreviewItem,
  type StyleName,
} from "@/theme/config"

/** Everything the preview iframe needs to render the current theme. */
export type PreviewState = {
  css: string
  style: StyleName
  mode: Mode
  item: PreviewItem
  /** Chart group shown when item is "charts". */
  chart: ChartType
  /** shadcn variable -> DS token path for the current mode (incl. global vars). */
  aliases: Aliases
  /** Token paths for the font aliases, shown by the typography cards. */
  font: string
  fontHeading: string
}

export type EditorMessage = { type: "contact-sheet:state"; state: PreviewState }

export type PreviewMessage =
  | { type: "contact-sheet:ready" }
  | { type: "contact-sheet:shortcut"; key: string; meta: boolean }

export function isMessage<T extends { type: string }>(
  data: unknown,
  type: T["type"]
): data is T {
  return Boolean(data) && typeof data === "object" && (data as T).type === type
}
