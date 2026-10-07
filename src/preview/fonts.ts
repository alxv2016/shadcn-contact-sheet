import { TOKENS } from "@/theme/catalog"

// shadcn's preview cards look fonts up by `value` and print `name`. Here the
// options are the design-system font-stack tokens; the name is the first
// family in the stack.
export const FONTS = TOKENS.filter((token) => token.group === "font-stack").map(
  (token) => ({
    name: String(token.value).split(",")[0].trim().replace(/["']/g, ""),
    value: token.path,
    cssVar: token.cssVar,
  })
)
