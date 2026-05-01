## Goal

Make the widget feel more clearly differentiated between the **product owner setup zone** and the **end user input zone**, with a softer, more guided tone. Same theme, presentation-only.

## Changes

### 1. Headline (`src/pages/Widget.tsx`)
- Change `Use cases that<br/>actually <em>fit</em>` → `Use cases <em>personalized</em><br/>to users`
- Apply the same change on `src/pages/Index.tsx` for consistency.

### 2. Section dividers (new visual element)
Replace the current `config-block` and the bare user-section with two labeled horizontal dividers — a thin line with centered uppercase mono text sitting on top of it.

```text
─────────── CONFIGURE YOUR PRODUCT ───────────
   (product context summary / api key chip)

─────────── WHAT USERS SEE ───────────
   (website + or + manual description)
```

- Section label for the user view: **"WHAT USERS SEE"** (4 words max, fits brief).
- New CSS class `.section-divider` in `src/index.css`:
  - Flex row, `align-items:center`, `gap: 1rem`, margin `2.5rem 0 1.25rem`.
  - Two `<span class="line">` flex-1 with `border-top: 1px solid var(--uc-border)`.
  - Center label: `font-size: .65rem`, `letter-spacing: .12em`, `text-transform: uppercase`, `color: var(--uc-gray)`.

### 3. Website helper text
Above the website input row, add a small mono helper:
> "Enter your website to see how {ProductName} helps you"

- Class `.field-helper` in CSS: `font-size: .7rem; color: var(--uc-gray); margin-bottom: .5rem; letter-spacing: .02em;`
- `{ProductName}` source: the widget currently only has the API key (`?key=`), not the product name. Add a tiny public lookup:
  - Extend `supabase/functions/generate/index.ts` to accept `GET` requests (or a `?info=1` query): given `x-api-key`, return `{ product_name }`. Reuses existing key validation. No new tables, no schema changes.
  - In `Widget.tsx`, on mount with an api key present, `fetch` this once and store `productName`. Fallback to `"this product"` if missing/unauthenticated.

### 4. "or" divider text
- Change `or` → `or enter details manually`. Keep existing `.or-text` styling.

### 5. Product context block in setup section
Keep the existing api-key chip / "Sign in to create a product" message, but render it directly under the new "CONFIGURE YOUR PRODUCT" divider (drop the bordered `config-block` wrapper to give the dividers visual primacy). Wrap in a small `.section-body` div with subtle padding for rhythm.

## Files touched

- `src/pages/Widget.tsx` — headline, dividers, helper text, fetch product name, copy changes.
- `src/pages/Index.tsx` — headline only.
- `src/index.css` — add `.section-divider`, `.section-divider .line`, `.section-divider .label`, `.field-helper`, `.section-body`.
- `supabase/functions/generate/index.ts` — handle `GET` (or `?info=1`) returning `{ product_name }` for a valid `x-api-key`. CORS already in place.

## Out of scope

- No DB schema changes, no auth changes, no Dashboard changes.
- No changes to generation logic or response shape.
