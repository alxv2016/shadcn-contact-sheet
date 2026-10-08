// Copies the design-system token sources (primitives.*.json, semantic.*.json
// and their dark.* modes) from a Token Bridge / Style Dictionary export into
// ./tokens. Files removed from the source are not deleted here.
//
//   npm run tokens:sync                       # default source below
//   TOKENS_DIR=/path/to/pkg/tokens npm run tokens:sync
//
// The shadcn alias files (shadcn.semantic.json, dark.shadcn.semantic.json,
// shadcn.extensions.json) are owned by this app and are never overwritten.
import { copyFileSync, existsSync, readdirSync } from "node:fs"
import { homedir } from "node:os"
import { join, resolve } from "node:path"

const sourceDir = resolve(
  process.env.TOKENS_DIR ??
    join(homedir(), "Desktop/cp-design-tokens")
)
const targetDir = resolve("tokens")
const DS_FILE = /^(dark\.)?(primitives?|semantics?)\..+\.json$/u

if (!existsSync(sourceDir)) {
  console.error(`Token source not found: ${sourceDir}`)
  console.error("Set TOKENS_DIR to your token package's tokens/ folder.")
  process.exit(1)
}

const files = readdirSync(sourceDir).filter((file) => DS_FILE.test(file))

for (const file of files) {
  copyFileSync(join(sourceDir, file), join(targetDir, file))
}

console.log(`Synced ${files.length} token files from ${sourceDir}`)
