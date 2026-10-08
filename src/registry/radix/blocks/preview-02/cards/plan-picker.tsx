"use client"

import * as React from "react"

import { Badge } from "@/registry/radix/ui/badge"
import { Button } from "@/registry/radix/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/radix/ui/card"
import { RadioGroup, RadioGroupItem } from "@/registry/radix/ui/radio-group"

const PLANS = [
  { id: "starter", name: "Starter", price: "$0", description: "1 project, community support" },
  { id: "pro", name: "Pro", price: "$24", description: "Unlimited projects, priority support", popular: true },
  { id: "team", name: "Team", price: "$79", description: "SSO, audit log, shared libraries" },
]

// Options rest at shadow-sm; the selected plan lifts to shadow-md.
export function PlanPicker() {
  const [plan, setPlan] = React.useState("pro")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a plan</CardTitle>
        <CardDescription>Billed monthly. Change or cancel anytime.</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={plan} onValueChange={setPlan} className="gap-3">
          {PLANS.map((option) => (
            <label
              key={option.id}
              htmlFor={`plan-${option.id}`}
              data-selected={plan === option.id}
              className="flex cursor-pointer items-start gap-3 rounded-lg bg-card p-3 shadow-sm ring-1 ring-foreground/10 transition-shadow data-[selected=true]:shadow-md data-[selected=true]:ring-2 data-[selected=true]:ring-primary style-lyra:rounded-none style-sera:rounded-none"
            >
              <RadioGroupItem value={option.id} id={`plan-${option.id}`} className="mt-0.5" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-2 text-sm font-medium">
                  {option.name}
                  {option.popular && <Badge>Popular</Badge>}
                </span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </div>
              <span className="text-sm font-medium tabular-nums">
                {option.price}
                <span className="text-xs font-normal text-muted-foreground">/mo</span>
              </span>
            </label>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Continue</Button>
      </CardFooter>
    </Card>
  )
}
