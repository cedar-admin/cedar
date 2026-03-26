# PRP: Extract Supabase Design System Docs App into Cedar

## Context

Cedar's monorepo (`cedar-admin/cedar`) has a working design system transplanted from Supabase — packages `ui`, `config`, `ui-patterns`, `common`, `icons`, `build-icons`, and `tsconfig` are all installed and functional. The design system test page renders correctly at `/design-system-test`.

Supabase has a documentation app at `apps/design-system/` in their monorepo (`supabase/supabase`). It's a Next.js App Router app that serves as a living component reference — 58 atom component docs, 21 fragment docs, 278 live example components with code display, syntax-highlighted MDX, dark mode, sidebar navigation. See it live at https://supabase-design-system.vercel.app/design-system.

Cedar needs this app running locally at `apps/design-system/` on `localhost:3003`. This PRP was validated by three independent code audits against both repos.

## Critical Rule

**Stop and report at any failed checkpoint.** Do not proceed to the next phase. Explain what failed, what you tried, and what you think the fix is. Wait for confirmation before continuing.

---

## Phase 0: Restore Canonical CSS Theme Files

### Why

Cedar's root `.gitignore` has a blanket `build` pattern. Supabase's has the narrower `build/Release`. During the original transplant, this silently excluded `packages/ui/build/css/` — the theme CSS every Supabase app imports. Cedar's web app already has working copies at `apps/web/app/theme-css/` (with a comment: "pre-built theme files, copied from packages/ui/build/css").

This phase restores the files at their canonical location so the design-system app's existing import paths work without modification.

### Steps

1. In the root `.gitignore`, add a negation line immediately after the `build` line:
   ```
   build
   !packages/ui/build/css/
   ```

2. Create the canonical directory and copy from the web app's working copies:
   ```bash
   mkdir -p packages/ui/build/css/source
   mkdir -p packages/ui/build/css/themes
   cp apps/web/app/theme-css/global.css packages/ui/build/css/source/global.css
   cp apps/web/app/theme-css/dark.css packages/ui/build/css/themes/dark.css
   cp apps/web/app/theme-css/classic-dark.css packages/ui/build/css/themes/classic-dark.css
   cp apps/web/app/theme-css/light.css packages/ui/build/css/themes/light.css
   ```

3. Force-add and commit:
   ```bash
   git add -f packages/ui/build/css/
   git add .gitignore
   git commit -m "fix: restore packages/ui/build/css theme files

   Cedar's blanket 'build' gitignore pattern was silently excluding the
   design system theme CSS that Supabase commits at packages/ui/build/css/.
   Adds a gitignore negation and restores the four theme files from the
   working copies in apps/web/app/theme-css/."
   ```

### Checkpoint 0

`ls packages/ui/build/css/source/global.css` succeeds. `git status` shows the files are tracked.

---

## Phase 1: Scaffold the App Directory

### Steps

1. **Get Supabase's design-system app:**
   ```bash
   cd /tmp
   git clone --depth 1 --sparse https://github.com/supabase/supabase.git supabase-src
   cd supabase-src
   git sparse-checkout set apps/design-system
   ```

2. **Copy into Cedar's monorepo:**
   ```bash
   cp -r /tmp/supabase-src/apps/design-system <cedar-repo>/apps/design-system
   ```

3. **Modify `apps/design-system/package.json`:**
   - Change `"contentlayer2": "0.4.6"` → `"contentlayer2": "^0.5.8"`
   - Change `"next-contentlayer2": "0.4.6"` → `"next-contentlayer2": "^0.5.8"`
   - Add `"sass": "^1.80.0"` to `devDependencies`
   - Add `"prettier": "^3.2.0"` to `devDependencies`
   - Remove `"eslint-config-supabase": "workspace:*"` from `dependencies`
   - All `catalog:` references resolve through Cedar's `pnpm-workspace.yaml` automatically
   - All `workspace:*` references (`ui`, `ui-patterns`, `icons`, `config`, `tsconfig`) are valid

4. **Rewrite `apps/design-system/eslint.config.cjs`** to remove the `eslint-config-supabase` dependency:
   ```javascript
   const { defineConfig } = require('eslint/config')

   module.exports = defineConfig([
     {
       files: ['registry/**/*.tsx', '__registry__/**/*.tsx', 'app/**/*.tsx'],
       rules: {
         'no-restricted-exports': 'off',
       },
     },
   ])
   ```

5. **Modify `apps/design-system/next.config.mjs`:**
   - Remove `'shared-data'` from the `transpilePackages` array (no actual imports reference it)
   - Keep `'ui'`, `'common'`, `'icons'`, `'tsconfig'`

6. **Fix `apps/design-system/app/layout.tsx`:**
   - Replace `import '../../studio/styles/typography.scss'` with `import '../../../packages/ui/src/styles/typography.scss'`
     - Path math: `app/` → `design-system/` → `apps/` → repo root → `packages/ui/src/styles/typography.scss` (three levels up)
   - Change `applicationName`, `title`, and `description` from "Supabase Design System" to "Cedar Design System"

7. **Replace fonts.** Rewrite `apps/design-system/app/fonts/index.ts`:
   ```typescript
   import { Inter, Source_Code_Pro } from 'next/font/google'

   export const customFont = Inter({
     subsets: ['latin'],
     variable: '--font-custom',
     display: 'swap',
   })

   export const sourceCodePro = Source_Code_Pro({
     subsets: ['latin'],
     variable: '--font-source-code-pro',
     display: 'swap',
     weight: ['400', '500', '600', '700'],
   })
   ```
   Delete all `CustomFont-*.woff2` files from `apps/design-system/app/fonts/`. These are Supabase's proprietary Circular font files.

8. **Check `apps/design-system/app/Providers.tsx`.** If it imports from `next-themes/dist/types`, change to:
   ```typescript
   import type { ThemeProviderProps } from 'next-themes'
   ```
   The internal `dist/types` path may not exist in the resolved version.

9. **Create `apps/design-system/.env.local`:**
   ```
   NEXT_PUBLIC_BASE_PATH=/design-system
   NEXT_PUBLIC_APP_URL=http://localhost:3003/design-system
   ```

10. **Run install:**
    ```bash
    cd <cedar-repo>
    pnpm install
    ```

### Checkpoint 1

`pnpm install` completes with zero unresolved workspace dependencies. No peer dependency errors related to contentlayer2 or next.

---

## Phase 2: Verify Contentlayer2 MDX Pipeline

### Steps

1. Run the content build:
   ```bash
   cd apps/design-system
   pnpm content:build
   ```
   This runs `contentlayer2 build`, processing 95 MDX files in `content/docs/` and generating `.contentlayer/generated/` with typed document objects.

2. If errors occur related to contentlayer2 API changes between 0.4.6 and 0.5.8, the likely surfaces are:
   - `contentlayer.config.js` — `makeSource()`, `defineDocumentType()`, `defineNestedType()` signatures
   - `components/mdx-components.tsx` — `useMDXComponent` hook from `next-contentlayer2/hooks`
   
   Fix any API changes in place. The surface area is small.

3. The Shiki code theme at `lib/themes/supabase-2.json` loads during content build. It's included in the copy. If there's a shiki/compat version mismatch, the error will surface here.

### Checkpoint 2

`pnpm content:build` completes without errors. `.contentlayer/generated/` directory exists containing `Doc/` subdirectory with JSON files, `index.mjs`, and `types.d.ts`.

---

## Phase 3: Verify Component Registry

### Steps

1. The pre-committed `__registry__/index.tsx` (copied from Supabase in Phase 1) provides a working baseline. Skip the registry build for now and use it as-is.

2. **Optionally** test the registry build:
   ```bash
   cd apps/design-system
   pnpm build:registry
   ```
   This runs `tsx` and then `prettier`. Both were added as devDependencies in Phase 1. Expect ~95% of examples to compile successfully. For any failures, remove the broken entry from the relevant registry file (`registry/examples.ts` or `registry/fragments.ts`), its MDX doc from `content/docs/`, and its sidebar nav entry from `config/docs.ts`.

3. If you skip the optional build, verify the pre-committed file exists:
   ```bash
   head -5 __registry__/index.tsx
   ```
   Should show the auto-generated header with `import * as React from "react"`.

### Checkpoint 3

`__registry__/index.tsx` exists with component entries.

---

## Phase 4: First Dev Server Boot

### Steps

1. Start the full dev server:
   ```bash
   cd apps/design-system
   pnpm dev:full
   ```
   This runs `concurrently "pnpm dev" "pnpm content:dev"` — Next.js on port 3003 + contentlayer file watcher.

2. Open `http://localhost:3003/design-system` in a browser (the basePath redirect sends `/` → `/design-system`).

3. **Known issues to handle:**

   a. **Turbopack raw-loader rule:** If you see errors about `.md` file processing, try removing the `turbopack.rules` block from `next.config.mjs`. The `raw-loader` rule was added for webpack compatibility — Turbopack in Next.js 16 may handle `.md` files natively.

   b. **Runtime errors on individual component pages** (React error boundaries) are expected for the ~5% of example components that import Supabase-specific packages. These don't crash the app — they show error states on individual preview panels.

   c. **If the app crashes on boot** with CSS-related errors, verify the Phase 0 files are in place:
      ```bash
      ls packages/ui/build/css/source/global.css
      ls packages/ui/build/css/themes/dark.css
      ls packages/ui/build/css/themes/classic-dark.css
      ls packages/ui/build/css/themes/light.css
      ```

4. Verify these work:
   - Homepage renders with navigation cards
   - Sidebar navigation shows component categories (Atom Components, Fragment Components)
   - At least one component doc page (e.g., `/docs/components/button`) renders with MDX content, live component preview, and syntax-highlighted code
   - Dark mode toggle works

### Checkpoint 4

The app boots at `localhost:3003/design-system`. Homepage loads. At least one component documentation page renders with a working live preview and code display.

---

## Phase 5: Cleanup and Cedar Branding

### Steps

1. **Update branding strings:**
   - `config/site.ts` — Change name, URL, OG image, links to Cedar values
   - `app/(app)/page.tsx` — Update homepage title to "Cedar Design System", update description and card labels
   - Optionally rename `lib/themes/supabase-2.json` → `lib/themes/cedar.json` and update the reference in `contentlayer.config.js`

2. **Audit remaining Supabase references:**
   ```bash
   cd apps/design-system
   grep -ri "supabase" --include="*.tsx" --include="*.ts" --include="*.mdx" --include="*.json" \
     -l | grep -v node_modules | grep -v .contentlayer | grep -v .env
   ```
   Update or remove each reference. The homepage imports `{ Auth, Database, Realtime }` from `icons/src/icons` — these are Supabase product icons. Replace with Cedar equivalents or generic `lucide-react` icons.

3. **Add root dev script** to Cedar's `package.json`:
   ```json
   "dev:design-system": "turbo run dev:full --filter=design-system"
   ```

4. **Add `dev:full` task to `turbo.json`:**
   ```json
   "dev:full": {
     "cache": false,
     "persistent": true
   }
   ```

5. **Replace favicons:** Swap `public/favicon/` contents with Cedar's favicon set if available.

6. **Replace homepage SVGs:** The files in `public/img/design-system-marks/` carry Supabase visual branding. Replace with Cedar equivalents or generic placeholders.

### Checkpoint 5

`grep -ri "supabase" apps/design-system/ --include="*.tsx" --include="*.ts" -l | grep -v node_modules | grep -v .contentlayer` returns zero results in user-visible UI components. `pnpm run dev:design-system` from repo root starts the app.

---

## Reference: What Transfers

For context on what the design-system app contains (you don't need to create any of this — it's all included in the copy from Supabase):

- **58 atom component docs** — Button (13 variants), Accordion, Alert, Dialog, Select, Card, Checkbox, Drawer, Table, Tabs, etc. Each has live previews, usage code, accessibility notes.
- **21 fragment component docs** — Confirmation Modal, Assistant Chat, Error Display, Filter Bar, Metric Card, Page Container, etc.
- **5 UI pattern guides** — Forms, Layout, Modality, Empty States, Tables/Charts
- **6 getting-started docs** — Theming, Color Usage, Icons, Accessibility, Tailwind Classes, Typography
- **278 example components** — Live demos that render in-browser with expandable source code

## Reference: Risk Register

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Turbopack raw-loader rule | Medium | Remove `turbopack.rules` block from `next.config.mjs` if errors occur |
| `next-themes/dist/types` import | Low-Medium | Change to `import type { ThemeProviderProps } from 'next-themes'` |
| SCSS compilation | Low | `sass` added as devDependency in Phase 1 |
| prettier for registry build | Low | Added as devDependency; or strip from build script |
| ~5% example component failures | Low | Delete broken entries from registry + MDX + sidebar nav |
