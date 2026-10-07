import * as React from "react"
import * as Lucide from "lucide-react"

export type IconLibraryName =
  | "lucide"
  | "tabler"
  | "hugeicons"
  | "phosphor"
  | "remixicon"

// The namespace includes alias exports (e.g. MoreHorizontalIcon), which the
// canonical `icons` map does not.
const ICONS = Lucide as unknown as Record<
  string,
  React.ComponentType<Lucide.LucideProps> | undefined
>

/**
 * shadcn's <IconPlaceholder> renders the same glyph from whichever icon
 * library is selected. This app ships Lucide only, so the `lucide` name is
 * resolved and the other library names are ignored.
 */
export function IconPlaceholder({
  lucide,
  tabler: _tabler,
  hugeicons: _hugeicons,
  phosphor: _phosphor,
  remixicon: _remixicon,
  ...props
}: Partial<Record<IconLibraryName, string>> & React.ComponentProps<"svg">) {
  const Icon = (lucide && ICONS[lucide]) || Lucide.SquareIcon
  return <Icon {...(props as Lucide.LucideProps)} />
}
