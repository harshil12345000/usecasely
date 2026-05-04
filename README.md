# Usecasely

**Personalize your startup's use cases to your users with AI to boost conversions.**

Stop showing generic feature lists. **Usecasely** is a personalization engine that leverages AI to understand your prospect's specific context—from their website or a short description—and instantly generates hyper-relevant use cases.

## 🚀 Why Usecasely?

Most users decide whether to stay or bounce within the first 30 seconds. If they can't immediately see how your product solves *their* specific problem, they leave. Usecasely removes the cognitive load of "imagining the fit" by doing it for them.

## ✨ Features

- **Personalized Generation**: Uses Gemini Flash to generate evidence-grounded use cases citing specific signals.
- **Website Scraping**: Native scraping logic to understand a prospect's industry and team directly from their URL.
- **Multi-Product Dashboard**: Manage multiple products or landing pages from a single account.
- **Zero-Config Widget**: A simple script tag to add personalization to your landing page in minutes.
- **Developer API**: REST endpoints for deep integration into your sign-up flow or email sequences.

## 📖 Integration Guide

### 1. Get your API Key
Sign up at [usecasely.zerocost.app](https://usecasely.zerocost.app/auth) and create your first product. Describe your product's core value proposition once, and we'll handle the AI logic.

### 2. Drop in the Widget
The easiest way to get started. Add an empty div and our script to your onboarding or landing page:

```html
<div id="usecasely-widget"></div>

<script 
  src="https://usecasely.zerocost.app/widget.js" 
  data-api-key="YOUR_PRODUCT_API_KEY"
  data-target="#usecasely-widget"
  data-fn-url="https://usecasely.zerocost.app/functions/v1/generate">
</script>
```

### 3. Or use the API
For custom UIs or backend integrations, call our generation endpoint:

```javascript
const res = await fetch("https://usecasely.zerocost.app/functions/v1/generate", {
  method: "POST",
  headers: { 
    "x-api-key": "YOUR_API_KEY", 
    "Content-Type": "application/json" 
  },
  body: JSON.stringify({ 
    website: "user-startup.com" 
  })
});

const { use_cases } = await res.json();
```

## 🛠️ Open Source

While we provide a hosted version, the codebase is open source. You can explore how the personalization engine works, our scraping logic, and the AI prompting strategies in this repository.

---

Built with ❤️ for startups. If you find this useful, consider giving us a ⭐!
