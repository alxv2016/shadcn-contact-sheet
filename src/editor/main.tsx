import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { Toaster } from "@/registry/radix/ui/sonner"
import { TooltipProvider } from "@/registry/radix/ui/tooltip"
import { App } from "@/editor/app"

import "@/editor/editor.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TooltipProvider>
      <App />
    </TooltipProvider>
    <Toaster theme="dark" position="bottom-left" />
  </StrictMode>
)
