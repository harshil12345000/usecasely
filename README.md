# usecases

**Personalize your startup's use cases to your users with AI to boost conversions.**

Stop showing generic feature lists. *usecases* leverages AI to understand your prospect's specific context—from their website or a short description—and instantly generates hyper-relevant use cases showing exactly how your product fits their workflow.

![usecases Screenshot](https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/sparkles.svg)

## 🚀 The Mission

Most users decide whether to stay or bounce within the first 30 seconds. If they can't immediately see how your product solves *their* specific problem, they leave. *usecases* removes the cognitive load of "imagining the fit" by doing it for them.

## ✨ Key Features

- **Personalized Generation**: Uses Gemini flash to generate evidence-grounded use cases citing specific signals from user content.
- **Website Scraping**: Native scraping logic to understand a prospect's industry, team structure, and tech stack directly from their URL.
- **Product Management**: A clean dashboard to configure multiple products, each with its own context and API key.
- **Drop-in Widget**: A zero-config script tag to add personalized onboarding to any landing page.
- **REST API**: Simple POST/GET endpoints for deep integration into your own backend or frontend application.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Shadcn UI.
- **Backend**: Supabase Edge Functions (Deno).
- **Database**: Supabase (PostgreSQL).
- **AI**: Google Gemini (via Lovable AI Gateway).

## 🚦 Getting Started

### Local Development

1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd contextual-use-cases
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Run the app**
   ```bash
   npm run dev
   ```

### Supabase Edge Functions

To deploy the generation engine:
1. Install [Supabase CLI](https://supabase.com/docs/guides/cli).
2. Login and link your project:
   ```bash
   supabase login
   supabase link --project-ref <your-project-id>
   ```
3. Set your secrets:
   ```bash
   supabase secrets set LOVABLE_API_KEY=your_key
   ```
4. Deploy:
   ```bash
   supabase functions deploy generate
   ```

## 📖 API Usage

### Generate Use Cases
`POST /v1/generate`

**Headers:**
- `x-api-key`: `YOUR_PRODUCT_API_KEY`
- `Content-Type`: `application/json`

**Body:**
```json
{
  "website": "acme.com",
  "description": "I run growth at a B2B SaaS startup"
}
```

## 📝 Manifesto

We believe that the connection between a user's need and a product's capability should be automatic, instant, and personalized. Read our full story at `/manifesto`.

## 🤝 Contributing

This is a movement to make the internet more relevant. If you'd like to contribute, please open an issue or submit a pull request.

---

Built with ❤️ by [Harshil Savla](https://www.linkedin.com/in/harshilsavla/)
