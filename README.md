# Usecasely

**Personalize your startup's use cases to your users with AI to boost conversions.**

Stop showing generic feature lists. **Usecasely** is an open-source personalized onboarding engine that leverages AI to understand your prospect's specific context—from their website or a short description—and instantly generates hyper-relevant use cases.

## 🚀 Why Usecasely?

Most users decide whether to stay or bounce within the first 30 seconds. If they can't immediately see how your product solves *their* specific problem, they leave. Usecasely removes the cognitive load of "imagining the fit" by doing it for them.

## ✨ Features

- **Personalized Generation**: Uses Gemini Flash to generate evidence-grounded use cases citing specific signals.
- **Website Scraping**: Native scraping logic to understand a prospect's industry and team directly from their URL.
- **Multi-Product Dashboard**: Manage multiple products/landing pages from a single instance.
- **Drop-in Widget**: A simple, zero-config script to add personalization to your landing page in minutes.
- **Developer API**: REST endpoints for deep integration into your sign-up flow or email sequences.

## 🛠️ Deploy Your Own Instance

Startups can host their own Usecasely instance for full data control and custom context.

### 1. Clone & Install
```bash
git clone https://github.com/harshil12345000/contextual-use-cases.git
cd contextual-use-cases
npm install
```

### 2. Infrastructure Setup
Usecasely uses **Supabase** for the database, authentication, and edge functions.
1. Create a project at [supabase.com](https://supabase.com).
2. Create `products` and `profiles` tables (schema in `supabase/migrations`).
3. Set your environment variables in `.env`:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

### 3. Deploy Edge Functions
The AI engine runs on Supabase Edge Functions:
```bash
supabase login
supabase link --project-ref your-project-id
supabase secrets set LOVABLE_API_KEY=your_gemini_gateway_key
supabase functions deploy generate
```

## 📖 Integration Guide

### Using the Widget
The easiest way to integrate is using the drop-in script. Add this to your header:

```html
<div id="usecasely-widget"></div>
<script 
  src="https://your-deployment.vercel.app/widget.js" 
  data-api-key="YOUR_PRODUCT_API_KEY"
  data-target="#usecasely-widget">
</script>
```

### Using the API
For custom UIs, call the generation endpoint directly:

```javascript
const res = await fetch("https://your-deployment.vercel.app/functions/v1/generate", {
  method: "POST",
  headers: { "x-api-key": "YOUR_API_KEY", "Content-Type": "application/json" },
  body: JSON.stringify({ website: "user-startup.com" })
});
```

---

Built with ❤️ for startups. If you find this useful, consider contributing!
