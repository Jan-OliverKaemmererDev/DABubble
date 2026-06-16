# Conventions & intentional deviations

This file records deliberate, reviewed deviations from the checklist / coding
standards, so they are not mistaken for defects in a future audit.

## Project structure
- **Feature-based folders instead of a flat `components/` folder.** Components
  live under `src/app/features/<feature>/<component>/` and `src/app/shared/`
  (smart vs. presentational). This is the standard Angular standalone layout and
  maps to the checklist's `components/` requirement.
- **Assets in `public/` instead of `src/assets/` (or an `img/` folder).** This is
  the Angular 17+ convention; `public/` holds `icons/`, `emojis/`, `avatars/`,
  `logos/`, `fonts/`, `illustrations/`, `sounds/`, `favicon/`. It maps to the
  checklist's images/assets requirement.
- **No `pipes/` folder** because the app defines no custom pipes (the folder is
  only required if pipes exist).

## Design tokens
- **`font-size('display')` (4.667rem / 84px)** was added to the type scale for the
  one-off intro-splash wordmark, which is larger than the H1 scale step. Verify
  against Figma when revisiting the splash.
- **`space('md-lg')` (20px)** was added as an intermediate spacing token (between
  `md` 16px and `lg` 24px) for the workspace section-icon indent, mirroring the
  existing intermediate steps `sm-md` (12px) and `xl-xxl` (40px). Figma-pending:
  confirm 20px is the intended value.
- **`$shadow-strong` (0 4px 12px rgba(black, 0.5))** was added for the floating
  mobile menu-toggle tab; no existing elevation token matches its 0.5 alpha.
- **Workspace-serialization sentinel `'false'`** (app-shell `readStoredWorkspaceOpen`)
  is the string form of `String(false)` and is intentionally left inline; it is
  the literal counterpart of the `String(open)` write, not a magic string.

## Fonts
- Per the design system, **only `<h1>` uses Nunito; everything else uses Inter.**
  Several view titles that previously used Nunito (workspace title/section titles,
  channel name, topbar user name, message bubble text, intro wordmark) were
  switched to Inter. **Flag for Figma review:** if any of these were intentionally
  Nunito for branding, restore them as a documented per-element exception.

## Accessibility
- **One `<h1>` per routed view.** Chat views whose visible title is a toolbar
  button (`channel-view`, `direct-message-view`) carry a visually-hidden
  (`.sr-only`) `<h1>`; `new-message` (a route) uses a visible `<h1>`.
  `thread-panel` (a complementary panel rendered alongside a route) and
  `mobile-search-view` (a `role="dialog"` labelled by its `<h2>`) intentionally
  keep their `<h2>` to avoid a second `<h1>` on the page.
- **Intro reduced-motion** is handled primarily in the component: the splash is
  skipped entirely when `prefers-reduced-motion: reduce` is set
  (`intro.component.ts`), so its transitions never run; a CSS guard is also
  present as defense-in-depth.

## Security / config
- **Shared guest credentials** (`gast@dabubble.dev`) are committed in
  `auth.service.ts` by design: a single low-privilege account with no special
  permissions, public-by-design exactly like the Firebase web `apiKey` in the
  client config. It is not a real secret.

## UI fixes (2026-06-16)
- **Channel intro empty-state built from scratch (no pre-existing component).** The
  brief assumed a desktop empty-state existed and was only missing on mobile; in
  fact **no empty-state intro (component or copy) existed anywhere** — desktop was
  blank too. It is now rendered once in `channel-view` (shared by both layouts) for
  the documented condition *no messages AND `createdBy === current uid`*, so it
  shows on all breakpoints. The intro `#<name>` is **styled text** (`color('primary')`),
  not a functional anchor — it references the channel the user is already in.
- **`@`-mention presence follows the app's binary convention, not real presence.**
  There is no presence service; the member list, DM header and search results all
  render the signed-in user as online and everyone else as offline. The mention
  dropdown reuses that source (`uid === current uid` → `color('online')`, else
  `color('text-gray')`); **`abwesend`/away is not used** (the source is binary). The
  dot is **opt-in** (rendered only when a row provides `online`), so the
  `new-message` address picker is intentionally left unchanged.
- **Mobile splash logo size (no exact Figma mobile spec).** Below `$breakpoint-sm`
  (576px) the splash logo is reduced from 187×184px to **120×118px** (named
  variables `$logo-width-mobile` / `$logo-height-mobile`) and the wordmark to
  `font-size('h2')`, so the centered logo + "DABubble" fits within 320px with no
  horizontal scroll. The handoff scale is measured at runtime, so it adapts
  automatically; reduced motion still skips the splash entirely. Confirm the 120px
  size against Figma when revisiting.

## Known minor deviation (optional later cleanup)
- **~39 boolean fields/signals** use a consistent project convention
  (`pending`, `*Open`, `*Focused`, `editing`, `own`, `deleted`, …) rather than the
  `is/has/should/can` prefix. Left as-is to avoid template-binding regressions
  before submission; a wholesale rename is a safe follow-up.
