# Skill: Design Token Usage

## Token decision tree

When you need a visual value:

1. **Color?** → Check semantic tokens in `specs/tokens/token-reference.md`. Use Tailwind class (`bg-primary`, `text-muted-foreground`). For opacity: `bg-primary/10`.

2. **Spacing?** → Use Tailwind scale (`p-4`, `gap-2`, `space-y-6`). If it doesn't feel right, move ±1 step. Never invent arbitrary values.

3. **Font size?** → Use `text-xs` through `text-3xl`. All are fluid (clamp-based).

4. **Border radius?** → Use `rounded-sm` through `rounded-4xl` or `rounded-full`. For nested elements, calculate: `max(0px, outer_radius - padding)`.

5. **Shadow?** → Use `shadow-xs` through `shadow-xl`.

6. **Z-index?** → Use the scale: `z-[0]` base, `z-[10]` dropdown, `z-[40]` scrim, `z-[50]` panel. Reference `token-reference.md` for full list.

7. **Animation?** → Use utility classes from globals.css (`.animate-panel-in-right`, `.transition-interactive`, etc.). For durations: reference `--duration-fast` through `--duration-slower`.

## When to create a new token

Create a new token ONLY when:
- The value will be used in **3+ places**
- No existing token is within ±2px or ±1 shade
- It represents a genuinely new semantic concept

Process:
1. Add the primitive value to `@theme { }` in `globals.css`
2. If theme-switchable, add semantic aliases in `:root` and `.dark`
3. If it needs a Tailwind utility, bridge it in `@theme inline { }`
4. Document it in `specs/tokens/token-reference.md`

## Forbidden patterns

- `text-[#ff0000]` — arbitrary color values
- `p-[13px]` — arbitrary spacing
- `w-[347px]` — arbitrary widths (use max-w scale or layout tokens)
- `z-[999]` — arbitrary z-index (use the scale)
- `duration-[250ms]` — arbitrary durations (use token: `--duration-base`)
- `rounded-[7px]` — arbitrary radius (use the derived scale)
- Inline `style={{ }}` for colors, spacing, or layout (use for dynamic values only, like stagger delays)
