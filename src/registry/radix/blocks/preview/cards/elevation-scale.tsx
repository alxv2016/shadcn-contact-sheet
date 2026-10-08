"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/radix/ui/card"
import { useDesignSystemSearchParams } from "@/preview/design-system"

// Literal class names so Tailwind generates each utility.
const SHADOWS = [
  { name: "shadow-xs", className: "shadow-xs" },
  { name: "shadow-sm", className: "shadow-sm" },
  { name: "shadow-md", className: "shadow-md" },
  { name: "shadow-lg", className: "shadow-lg" },
  { name: "shadow-xl", className: "shadow-xl" },
  { name: "shadow-2xl", className: "shadow-2xl" },
]

export function ElevationScale() {
  const [params] = useDesignSystemSearchParams()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Elevation</CardTitle>
        <CardDescription>
          The shadcn shadow scale and the design token behind each step.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-x-4 gap-y-5 rounded-lg bg-muted p-5 style-lyra:rounded-none style-sera:rounded-none">
          {SHADOWS.map((shadow) => (
            <div key={shadow.name} className="flex min-w-0 flex-col items-center gap-2">
              <div
                className={`aspect-square w-full rounded-lg bg-card style-lyra:rounded-none style-sera:rounded-none ${shadow.className}`}
              />
              <div className="flex max-w-full flex-col items-center">
                <span className="font-mono text-[0.65rem]">{shadow.name}</span>
                <span className="max-w-full truncate font-mono text-[0.6rem] text-muted-foreground">
                  {params.aliases[shadow.name]?.split(".").slice(-2).join(".") ?? "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
