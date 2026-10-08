"use client"

import { Avatar, AvatarFallback } from "@/registry/radix/ui/avatar"
import { Badge } from "@/registry/radix/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/radix/ui/card"
import { IconPlaceholder } from "@/preview/icon-placeholder"

const TASKS = [
  { title: "Audit color contrast on forms", tag: "Accessibility", assignee: "MK", comments: 4 },
  { title: "Migrate tokens to Style Dictionary v5", tag: "Tokens", assignee: "JL", comments: 2 },
]

function TaskTile({
  title,
  tag,
  assignee,
  comments,
  className,
}: (typeof TASKS)[number] & { className?: string }) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-lg bg-card p-3 ring-1 ring-foreground/10 style-lyra:rounded-none style-sera:rounded-none ${className ?? ""}`}
    >
      <span className="text-sm font-medium">{title}</span>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{tag}</Badge>
        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <IconPlaceholder lucide="MessageSquareIcon" className="size-3.5" />
          {comments}
        </span>
        <Avatar className="size-6">
          <AvatarFallback className="text-[0.6rem]">{assignee}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}

// Resting tiles sit at shadow-xs; the tile being dragged lifts to shadow-2xl
// over a dashed drop target.
export function TaskBoard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>In progress</CardTitle>
        <CardDescription>Design system sprint · week 3</CardDescription>
        <CardAction>
          <Badge variant="outline">4</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 rounded-lg bg-muted p-3 style-lyra:rounded-none style-sera:rounded-none">
          {TASKS.map((task) => (
            <TaskTile key={task.title} {...task} className="shadow-xs" />
          ))}
          <div className="relative">
            <div className="h-[5.5rem] rounded-lg border-2 border-dashed border-foreground/15 style-lyra:rounded-none style-sera:rounded-none" />
            <TaskTile
              title="Document elevation tokens"
              tag="Docs"
              assignee="AV"
              comments={7}
              className="absolute inset-x-0 top-0 translate-x-3 -translate-y-2 -rotate-2 cursor-grabbing shadow-2xl"
            />
          </div>
          <TaskTile
            title="Ship Theme overrides export"
            tag="Editor"
            assignee="RS"
            comments={1}
            className="shadow-xs"
          />
        </div>
      </CardContent>
    </Card>
  )
}
