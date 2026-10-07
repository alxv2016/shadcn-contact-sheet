import * as React from "react"

// The ported shadcn examples were written for Next.js. These drop-in shims
// render plain elements so the examples run unchanged under Vite.

export function Link({
  href,
  ...props
}: React.ComponentProps<"a"> & { href: string }) {
  return <a href={href} {...props} />
}

export function Image({
  fill,
  priority: _priority,
  unoptimized: _unoptimized,
  style,
  ...props
}: React.ComponentProps<"img"> & {
  fill?: boolean
  priority?: boolean
  unoptimized?: boolean
}) {
  return (
    <img
      style={
        fill
          ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style }
          : style
      }
      {...props}
    />
  )
}
