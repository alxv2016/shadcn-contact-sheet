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
import { IconPlaceholder } from "@/preview/icon-placeholder"

const TOASTS = [
  {
    title: "Payout sent",
    description: "$2,480.00 is on its way to your bank.",
    icon: "CircleCheckIcon",
    tone: "text-primary",
  },
  {
    title: "New invoice",
    description: "Northwind Studio sent invoice #1042.",
    icon: "ReceiptTextIcon",
    tone: "text-muted-foreground",
  },
  {
    title: "Card expiring",
    description: "Your Visa ending 4242 expires next month.",
    icon: "CreditCardIcon",
    tone: "text-muted-foreground",
  },
]

// A collapsed toast stack: each toast floats at shadow-xl, and the ones
// behind are scaled down, pushed up and hide their content, like Sonner's.
export function NotificationStack() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>3 new since this morning</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm">
            Clear all
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="relative h-36 rounded-lg bg-muted style-lyra:rounded-none style-sera:rounded-none">
          {TOASTS.map((toast, index) => (
            <div
              key={toast.title}
              data-front={index === 0}
              className="absolute inset-x-4 bottom-4 flex origin-top items-start gap-3 rounded-lg bg-popover p-3 text-popover-foreground shadow-xl ring-1 ring-foreground/10 transition-transform data-[front=false]:*:invisible style-lyra:rounded-none style-sera:rounded-none"
              style={{
                zIndex: TOASTS.length - index,
                transform: `translateY(-${index * 0.625}rem) scale(${1 - index * 0.05})`,
              }}
            >
              <IconPlaceholder lucide={toast.icon} className={`mt-0.5 size-4 shrink-0 ${toast.tone}`} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium">{toast.title}</span>
                <span className="truncate text-xs text-muted-foreground">{toast.description}</span>
              </div>
              {index === 0 && (
                <Button variant="outline" size="xs">
                  View
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
