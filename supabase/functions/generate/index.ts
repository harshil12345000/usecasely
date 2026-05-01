// Public edge function: generates personalized use cases for an end-user
// given a product API key + user context (website or description).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

interface UseCase {
  title: string;
  description: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SERVICE_ROLE) {
      return json({ error: "Server not configured" }, 500);
    }

    // GET = lightweight product info lookup by API key (used by widget UI to show product name)
    if (req.method === "GET") {
      const apiKey = req.headers.get("x-api-key") || new URL(req.url).searchParams.get("key");
      if (!apiKey || apiKey.length < 10) return json({ error: "Missing or invalid API key" }, 401);
      const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
      const { data: product, error } = await admin
        .from("products")
        .select("name")
        .eq("api_key", apiKey)
        .maybeSingle();
      if (error) return json({ error: "Database error" }, 500);
      if (!product) return json({ error: "Invalid API key" }, 401);
      return json({ product_name: product.name });
    }

    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    // API key from header or body
    let body: any = {};
    try { body = await req.json(); } catch { /* allow empty */ }

    const apiKey =
      req.headers.get("x-api-key") ||
      (typeof body.api_key === "string" ? body.api_key : null);

    if (!apiKey || typeof apiKey !== "string" || apiKey.length < 10) {
      return json({ error: "Missing or invalid API key" }, 401);
    }

    const website: string | null =
      typeof body.website === "string" && body.website.trim() ? body.website.trim().slice(0, 500) : null;
    const description: string | null =
      typeof body.description === "string" && body.description.trim()
        ? body.description.trim().slice(0, 1000)
        : null;

    if (!website && !description) {
      return json({ error: "Provide either 'website' or 'description'" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: product, error: prodErr } = await admin
      .from("products")
      .select("id, name, description")
      .eq("api_key", apiKey)
      .maybeSingle();

    if (prodErr) {
      console.error("DB error:", prodErr);
      return json({ error: "Database error" }, 500);
    }
    if (!product) return json({ error: "Invalid API key" }, 401);

    // ── Website scraping (native Deno fetch, no external API) ──────────────
    let scrapedContent: string | null = null;
    if (website) {
      try {
        const normalizedUrl = website.startsWith("http") ? website : `https://${website}`;
        const scrapeRes = await fetch(normalizedUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; UsecasesBot/1.0; +https://usecases.dev)",
            "Accept": "text/html,application/xhtml+xml",
          },
          signal: AbortSignal.timeout(6000),
        });
        if (scrapeRes.ok) {
          const html = await scrapeRes.text();
          // Strip script/style blocks, then all HTML tags, collapse whitespace
          scrapedContent = html
            .replace(/<script[\s\S]*?<\/script>/gi, " ")
            .replace(/<style[\s\S]*?<\/style>/gi, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/&[a-z]+;/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 3000);
        }
      } catch (e) {
        console.warn("Website scrape failed (silent fallback):", e);
      }
    }

    // ── System prompt ────────────────────────────────────────────────────────
    const systemPrompt = `You are an expert at generating hyper-specific, evidence-grounded use cases that show a user exactly how a product fits their actual work.

PRODUCT: ${product.name}
PRODUCT CONTEXT: ${product.description}

Your job: read the user context carefully, then generate exactly 3 use cases showing how THIS user — based on what their website or description reveals about their role, industry, team, or workflows — would benefit from ${product.name}.

STRICT RULES:
- Every use case MUST cite a specific signal from the user's content (a job function, a named tool they use, an industry term, a workflow, a pain point). No generic advice.
- If website content is provided, mine it for concrete details: product names, customer segments, tech stack, team structure, job titles, industry language.
- Title: ≤ 8 words, verb-first, specific (e.g. "Automate onboarding for fintech compliance teams" not "Save time on onboarding").
- Description: exactly 2 sentences. Sentence 1 = the concrete problem or workflow. Sentence 2 = how ${product.name} solves it specifically for them.
- Forbidden: "boost productivity", "save time", "streamline", "leverage", "enhance", "optimize" as standalone claims without specifics.
- Output only via the provided tool. No commentary.`;

    // ── User prompt (with scraped content when available) ─────────────────
    const userPromptParts: string[] = [];
    if (scrapedContent) {
      userPromptParts.push(`WEBSITE URL: ${website}`);
      userPromptParts.push(`SCRAPED PAGE CONTENT (use this as your primary evidence):\n${scrapedContent}`);
    } else if (website) {
      userPromptParts.push(`WEBSITE: ${website} (could not be scraped — use URL context only)`);
    }
    if (description) {
      userPromptParts.push(`USER DESCRIPTION: ${description}`);
    }
    const userPrompt = userPromptParts.join("\n\n");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_use_cases",
              description: "Return exactly 3 hyper-specific, evidence-grounded use cases.",
              parameters: {
                type: "object",
                properties: {
                  use_cases: {
                    type: "array",
                    minItems: 3,
                    maxItems: 3,
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                      },
                      required: ["title", "description"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["use_cases"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_use_cases" } },
      }),
    });

    if (aiRes.status === 429) return json({ error: "Rate limit exceeded. Please try again shortly." }, 429);
    if (aiRes.status === 402) return json({ error: "AI credits exhausted. Please add funds to continue." }, 402);
    if (!aiRes.ok) {
      const txt = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, txt);
      return json({ error: "AI generation failed" }, 502);
    }

    const aiData = await aiRes.json();
    const toolCall = aiData?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in AI response", JSON.stringify(aiData).slice(0, 500));
      return json({ error: "AI returned no result" }, 502);
    }

    let parsed: { use_cases: UseCase[] };
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error("Tool args parse error:", e);
      return json({ error: "Malformed AI response" }, 502);
    }

    const useCases: UseCase[] = (parsed.use_cases || []).slice(0, 3).map((u) => ({
      title: String(u.title || "").slice(0, 200),
      description: String(u.description || "").slice(0, 500),
    }));

    // Log generation (fire and forget, but await so errors are caught)
    await admin.from("generations").insert({
      product_id: product.id,
      user_website: website,
      user_description: description,
      results: useCases,
    });

    return json({ use_cases: useCases, product: { name: product.name } });
  } catch (e) {
    console.error("generate error:", e);
    return json({ error: "Unexpected server error" }, 500);
  }
});
