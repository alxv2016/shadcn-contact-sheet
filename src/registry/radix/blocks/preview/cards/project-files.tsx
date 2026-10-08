"use client"

import { Button } from "@/registry/radix/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/radix/ui/card"
import { Kbd } from "@/registry/radix/ui/kbd"
import { Separator } from "@/registry/radix/ui/separator"
import { IconPlaceholder } from "@/preview/icon-placeholder"

const FILES = [
  { name: "brand-guidelines.pdf", meta: "4.2 MB · 2 days ago", icon: "FileTextIcon" },
  { name: "hero-illustration.png", meta: "1.8 MB · 5 days ago", icon: "FileImageIcon" },
  { name: "q3-roadmap.xlsx", meta: "320 KB · last week", icon: "FileSpreadsheetIcon" },
  { name: "launch-video.mp4", meta: "86 MB · 2 weeks ago", icon: "FileVideoIcon" },
  { name: "release-notes.md", meta: "12 KB · last month", icon: "FileTextIcon" },
]

const MENU = [
  { label: "Rename", icon: "PencilIcon", shortcut: "R" },
  { label: "Duplicate", icon: "CopyIcon", shortcut: "D" },
  { label: "Move to…", icon: "FolderInputIcon" },
  { label: "Share", icon: "Share2Icon" },
]

// Popover surfaces drawn in place (not portaled) so the shadow scale shows
// against the card: the tooltip uses shadow-md, the open menu shadow-lg.
export function ProjectFiles() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project files</CardTitle>
        <CardDescription>Shared with the design team</CardDescription>
        <CardAction className="relative">
          <Button variant="outline" size="icon-sm" aria-label="Upload file">
            <IconPlaceholder lucide="UploadIcon" />
          </Button>
          <div className="absolute top-1/2 right-full mr-2 -translate-y-1/2 rounded-md bg-foreground px-2 py-1 text-xs whitespace-nowrap text-background shadow-md style-lyra:rounded-none style-sera:rounded-none">
            Upload file
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="relative">
        <div className="flex flex-col">
          {FILES.map((file, index) => (
            <div
              key={file.name}
              data-active={index === 1}
              className="flex items-center gap-3 rounded-md px-2 py-2 data-[active=true]:bg-muted style-lyra:rounded-none style-sera:rounded-none"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground style-lyra:rounded-none style-sera:rounded-none">
                <IconPlaceholder lucide={file.icon} className="size-4" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">{file.name}</span>
                <span className="truncate text-xs text-muted-foreground">{file.meta}</span>
              </div>
              <IconPlaceholder lucide="EllipsisIcon" className="size-4 text-muted-foreground" />
            </div>
          ))}
        </div>
        <div className="absolute top-[4.25rem] right-8 z-10 flex w-48 flex-col rounded-md bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 style-lyra:rounded-none style-sera:rounded-none">
          {MENU.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm first:bg-accent first:text-accent-foreground style-lyra:rounded-none style-sera:rounded-none"
            >
              <IconPlaceholder lucide={item.icon} className="size-4 text-muted-foreground" />
              {item.label}
              {item.shortcut && <Kbd className="ml-auto">{item.shortcut}</Kbd>}
            </div>
          ))}
          <Separator className="my-1" />
          <div className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive">
            <IconPlaceholder lucide="Trash2Icon" className="size-4" />
            Delete
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
