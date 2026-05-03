## Scope (in priority order)

### 1. Fix Zerocost link (quick)
- Add `target="_blank"` and `rel="noopener noreferrer"` to the Zerocost badge in `Navbar.tsx` and `Footer.tsx`. The current iframe sandbox blocks top-level navigation, hence the `chrome-error://chromewebdata/` error.

### 2. Demo page: auto product picker when logged in
In `Widget.tsx` (`/demo`):
- If a `#key=` is present in the URL → keep current behavior.
- Else, if the user is signed in → fetch their products, render a dropdown above the "Configure your product" section, default to the first product, and use its `api_key` automatically. Switching the dropdown updates the active key (and the hash, so links remain shareable).
- If signed out → keep the current "Sign in" prompt.

### 3. Dashboard: pill buttons + Edit product
In `Dashboard.tsx` + `index.css`:
- Convert "Try it now / Reveal / Copy / Logs / Delete / Edit" from `link-btn` to a real `pill-btn` component (sharp/rounded subtle border, hover state, danger variant for Delete). Keep the existing minimal aesthetic.
- Add an **Edit** pill next to **Delete** at the top of each product row. Clicking opens an inline editor for `name` and `description` with Save / Cancel.

### 4. Logs tab per product
- Add a **Logs** pill on each product row. Clicking expands a panel that lists generations for that `product_id`, newest first.
- Each log row shows:
  - Timestamp
  - User input (`user_website` or `user_description`)
  - Scraped Jina markdown (collapsed by default, expandable)
  - Generated `results` (the 3 use cases)
  - Feedback controls (👍 / 👎 + optional text)

**Schema changes (one migration):**
- `generations`: add `scraped_content text` (nullable), `feedback_rating text check (in 'good','bad')` (nullable), `feedback_text text` (nullable), `feedback_at timestamptz` (nullable).
- New RLS policy on `generations` allowing `INSERT` from the edge function (it already runs with service role, so no new policy needed for that — but add `UPDATE` policy for the **owner** so they can submit feedback through the client). Keep existing SELECT policy.
- Edge function will start writing the scraped markdown into `scraped_content`.

### 5. Self-improving agent (memory-based, lightweight)
Without building a full graph store, do this pragmatic version:
- New table `product_learnings` (`product_id`, `lesson text`, `created_at`). RLS: owner can read/insert/delete.
- When a user submits **bad** feedback with text, an edge function endpoint (`POST /functions/v1/generate/feedback`) calls Gemini once: "Given this user input, the AI output, and the user's complaint, write a 1-sentence rule the AI should follow next time for this product." Store the resulting sentence in `product_learnings`.
- On every generation, the edge function loads the last ~20 learnings for that product and injects them into the system prompt as `<learned_rules>`.
- Owner can delete a learning from the Logs panel (small "remove rule" link under each lesson — listed in a collapsible "What this product has learned" header above the logs).

### 6. Anti-hallucination railguards in the edge function
Update `supabase/functions/generate/index.ts`:
- **Grounding requirement.** When a website is provided and Jina returned content, instruct the model: *"Every use case MUST be derivable from the product context AND either the scraped site content or the user's description. If you cannot ground a use case in the supplied data, return fewer use cases — never invent details."*
- **Strict JSON schema** via Gemini `response_mime_type: "application/json"` + `responseSchema` (already JSON, but tighten: each use case = `{title<=80, description<=240, grounded_in: "site"|"description"|"product"}`).
- **Citation field.** Add an optional `evidence` string per use case quoting (≤120 chars) the source phrase. Drop any use case where `evidence` is empty AND it claims to be grounded in `site`.
- **Post-generation validator.** After receiving the model output, run a cheap check: every `evidence` substring must appear (case-insensitively, whitespace-normalized) in the concatenated `scraped_content + description + product.description`. Discard any that fail. If fewer than 1 remain, return a friendly error rather than a hallucinated fallback.
- **Lower temperature** to `0.4`, cap `maxOutputTokens` reasonably.
- Return **at most 3** (already the case) — and at least 1, otherwise surface error.

### 7. Misc
- Bump widget label from "Try it now" — keep wording, just restyle.
- Update `@security-memory` note: feedback endpoint must require valid `x-api-key` belonging to `auth.uid()` owner of the product to prevent cross-tenant feedback poisoning.

## Order of execution
1. Migration (new columns + `product_learnings` table + RLS).
2. Edge function rewrite (grounding, validator, learnings injection, feedback endpoint).
3. Dashboard UI: pill buttons, Edit, Logs panel with feedback.
4. Widget: product dropdown when logged in.
5. Zerocost link fix.

## Out of scope
- Full graph-based agent memory / vector store — using a simple text-rules table instead. Easy to upgrade later.
- Streaming responses.
- Bulk export of logs.
