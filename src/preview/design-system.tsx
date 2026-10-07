import * as React from "react"

import { type PreviewState } from "@/theme/messages"

// Stand-in for shadcn's useDesignSystemSearchParams(). The ported preview
// cards read style and font from it; here the values come from the editor
// over postMessage instead of URL search params.

export type DesignSystemParams = Omit<PreviewState, "css"> & {
  iconLibrary: "lucide"
}

const DEFAULT_PARAMS: DesignSystemParams = {
  style: "nova",
  mode: "light",
  item: "preview",
  chart: "area",
  aliases: {},
  font: "font-stack.sans",
  fontHeading: "font-stack.sans",
  iconLibrary: "lucide",
}

const DesignSystemContext = React.createContext(DEFAULT_PARAMS)

export function DesignSystemProvider({
  value,
  children,
}: {
  value: Omit<PreviewState, "css">
  children: React.ReactNode
}) {
  const params = React.useMemo(
    () => ({ ...value, iconLibrary: "lucide" as const }),
    [value]
  )

  return (
    <DesignSystemContext.Provider value={params}>
      {children}
    </DesignSystemContext.Provider>
  )
}

export function useDesignSystemSearchParams() {
  return [React.useContext(DesignSystemContext)] as const
}
