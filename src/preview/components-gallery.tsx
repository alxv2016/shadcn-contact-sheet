import * as React from "react"

import { cn } from "@/lib/utils"
import { ScrollArea } from "@/registry/radix/ui/scroll-area"
import { Spinner } from "@/registry/radix/ui/spinner"

// Every component example from shadcn's radix base, loaded on demand.
const EXAMPLE_MODULES = import.meta.glob<{ default: React.ComponentType }>(
  "@/registry/radix/examples/*-example.tsx"
)

type GalleryEntry = {
  slug: string
  title: string
  Component: React.LazyExoticComponent<React.ComponentType>
}

function titleCase(slug: string) {
  return slug
    .split("-")
    .map((word) => (word === "otp" ? "OTP" : word[0].toUpperCase() + word.slice(1)))
    .join(" ")
}

const OVERVIEW: GalleryEntry = {
  slug: "overview",
  title: "Overview",
  Component: React.lazy(() =>
    import("@/registry/radix/examples/component-example").then((mod) => ({
      default: mod.ComponentExample,
    }))
  ),
}

const ENTRIES: GalleryEntry[] = [
  OVERVIEW,
  ...Object.entries(EXAMPLE_MODULES)
    .map(([file, load]) => {
      const slug = file.split("/").pop()!.replace(/-example\.tsx$/, "")
      return { slug, title: titleCase(slug), Component: React.lazy(load) }
    })
    .filter((entry) => entry.slug !== "component")
    .sort((a, b) => a.title.localeCompare(b.title)),
]

export function ComponentsGallery() {
  const [slug, setSlug] = React.useState(
    () => new URLSearchParams(location.search).get("component") ?? "overview"
  )
  const entry = ENTRIES.find((e) => e.slug === slug) ?? OVERVIEW

  return (
    <div className="flex h-svh bg-muted dark:bg-background">
      <nav className="flex w-52 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="px-4 pt-4 pb-2 text-xs font-medium text-muted-foreground">
          {ENTRIES.length - 1} components
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <ul className="flex flex-col gap-0.5 px-2 pb-4">
            {ENTRIES.map((e) => (
              <li key={e.slug}>
                <button
                  type="button"
                  onClick={() => setSlug(e.slug)}
                  data-active={e.slug === entry.slug}
                  className={cn(
                    "w-full rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                    "data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                  )}
                >
                  {e.title}
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </nav>
      <main className="min-w-0 flex-1 overflow-y-auto">
        <React.Suspense
          fallback={
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Spinner />
            </div>
          }
        >
          <entry.Component key={entry.slug} />
        </React.Suspense>
      </main>
    </div>
  )
}
