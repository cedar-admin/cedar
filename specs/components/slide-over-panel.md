# SlideOverPanel

## Metadata
- Location: `src/components/ui/slide-over-panel.tsx`
- Dependencies: None (pure CSS animation)
- Added: 2026-03-18

## Overview
A panel that slides in from the right edge of the viewport with a scrim overlay. Used for detail views, editing contexts, and any secondary content that doesn't warrant a full page.

Current uses: PracticeSlideOver (admin), future: change detail panel, source detail panel.

## Anatomy
```
SlideOverPanel (root)
├── Scrim (overlay — click to close)
└── Panel (sliding container)
    ├── Header (title + close button)
    ├── Body (scrollable content area)
    └── Footer (optional — actions)
```

## Tokens Used
| Token | Usage |
|-------|-------|
| `--width-panel` | Panel width (480px) |
| `--z-scrim` | Scrim z-index (40) |
| `--z-panel` | Panel z-index (50) |
| `--scrim` | Scrim background color |
| `--background` | Panel background |
| `--border` | Panel left border |
| `--foreground` | Title text |
| `--muted-foreground` | Close button default |
| `--shadow-xl` | Panel shadow |
| `.animate-panel-in-right` | Panel entrance |
| `.animate-scrim-in` | Scrim entrance |

## Props / API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | required | Whether the panel is visible |
| `onClose` | `() => void` | required | Called when scrim is clicked or close button pressed |
| `title` | `string` | required | Header title |
| `children` | `ReactNode` | required | Panel body content |
| `footer` | `ReactNode` | `undefined` | Optional footer content |
| `className` | `string` | `undefined` | Additional classes on the panel root |

## States
- **Closed:** Not rendered
- **Opening:** `.animate-panel-in-right` on panel, `.animate-scrim-in` on scrim
- **Open:** Static, scrollable body
- **Closing:** `.animate-panel-out-right` on panel, `.animate-scrim-out` on scrim (if implementing exit animation)

## Code Example
```tsx
<SlideOverPanel
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Practice Details"
  footer={
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button onClick={handleSave}>Save</Button>
    </div>
  }
>
  <div className="space-y-6">
    {/* Panel body content */}
  </div>
</SlideOverPanel>
```

## Implementation Reference
```tsx
// Scrim
<div
  className="fixed inset-0 z-[40] bg-scrim animate-scrim-in"
  onClick={onClose}
  aria-hidden="true"
/>

// Panel
<div className="fixed inset-y-0 right-0 z-[50] w-[var(--width-panel)] max-w-full bg-background border-l border-border shadow-xl overflow-y-auto flex flex-col animate-panel-in-right">
  {/* Header */}
  <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
    <h2 className="text-base font-semibold text-foreground truncate pr-4">{title}</h2>
    <button
      onClick={onClose}
      className="text-muted-foreground hover:text-foreground transition-interactive shrink-0"
      aria-label="Close panel"
    >
      <i className="ri-close-line text-xl" />
    </button>
  </div>
  
  {/* Body */}
  <div className="flex-1 px-6 py-6 overflow-y-auto">
    {children}
  </div>
  
  {/* Footer (optional) */}
  {footer && (
    <div className="shrink-0 border-t border-border px-6 py-4">
      {footer}
    </div>
  )}
</div>
```

## Cross-References
- **Sidebar** — uses the same animation system but slides from the left (`.animate-panel-in-left`)
- **Dialog** — for centered modal content, use shadcn Dialog component with `.animate-scale-in`
- **Sheet** — shadcn Sheet component is an alternative; SlideOverPanel is Cedar's custom equivalent with simpler API
