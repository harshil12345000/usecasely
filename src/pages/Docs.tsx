import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BASE = "https://usecasely.zerocost.app/functions/v1/generate";

export default function Docs() {
    const [isCopied, setIsCopied] = useState(false);

    const setupPrompt = `You are a Vibecode development agent. Your goal is to integrate Usecasely into this project to personalize use cases for each user.

### STEP 1: Get API Key
- Navigate to the Dashboard in this app
- Sign in and create a new Product
- Describe your product context (capabilities, audience, etc.)
- Copy the generated API Key

### STEP 2: Client-side Integration
- Add an empty div with id="usecasely-widget" where the use cases should appear
- Include the Usecasely script tag:
  <div id="usecasely-widget"></div>
  <script src="${window.location.origin}/widget.js" data-api-key="[YOUR_API_KEY]" data-target="#usecasely-widget" data-fn-url="${window.location.origin}/functions/v1/generate"></script>

### STEP 3: Verification
- Visit the onboarding page
- Provide a website URL in the widget
- Verify that hyper-specific, evidence-grounded use cases are generated

### Alternative: API Integration
- Use the POST endpoint: ${BASE}
- Header: x-api-key [YOUR_API_KEY]
- Body: { "website": "user-url.com" }
- Extract 'use_cases' array from response.`;

    return (
        <div className="widget-page">
            <Navbar />

            <div style={{ display: "flex", gap: "4rem", maxWidth: 1100, margin: "0 auto", padding: "0 2rem" }}>
                <main className="widget-main" style={{ maxWidth: 760, margin: 0, paddingLeft: 0, paddingRight: 0, position: "relative" }}>
                    <section className="hero" style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "2rem" }}>
                        <div style={{ flex: 1 }}>
                            <h1>API <em>reference</em></h1>
                            <p className="subtitle">
                                Everything you need to generate personalized use cases from your own backend or frontend.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(setupPrompt);
                                setIsCopied(true);
                                setTimeout(() => setIsCopied(false), 2000);
                            }}
                            className="link-btn"
                            style={{
                                marginTop: "0.5rem",
                                fontWeight: 600,
                                color: isCopied ? "rgb(21, 128, 61)" : "var(--uc-black)",
                                border: "1px solid var(--uc-border)",
                                padding: "0.6rem 1rem",
                                borderRadius: "8px",
                                fontSize: "0.75rem",
                                whiteSpace: "nowrap",
                                textDecoration: "none",
                                background: isCopied ? "rgba(34, 197, 94, 0.1)" : "#edeade",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                transition: "all 0.2s"
                            }}
                        >
                            {isCopied ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    Copied to clipboard
                                </>
                            ) : (
                                <>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                                        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                                        <path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3" />
                                        <path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5" />
                                    </svg>
                                    Vibecode Setup Prompt
                                </>
                            )}
                        </button>
                    </section>


                    {/* ── Authentication ── */}
                    <div id="auth" className="section-divider">
                        <span className="line" />
                        <span className="label">Authentication</span>
                        <span className="line" />
                    </div>
                    <div className="docs-block">
                        <p className="docs-text">
                            Pass your product API key via the <code>x-api-key</code> header on every request.
                            Your specific API endpoint and keys can be found in the <Link to="/dashboard">Dashboard</Link>.
                        </p>
                    </div>

                    {/* ── Endpoint: Generate ── */}
                    <div id="generate" className="section-divider">
                        <span className="line" />
                        <span className="label">Generate Use Cases</span>
                        <span className="line" />
                    </div>

                    <div className="docs-block">
                        <div className="docs-method">POST</div>
                        <code className="docs-url">{BASE}</code>
                    </div>

                    <div className="config-block" style={{ marginTop: "1.25rem" }}>
                        <div className="config-label">Request Headers</div>
                        <div className="config-inner">
                            <table className="docs-table">
                                <thead>
                                    <tr><th>Header</th><th>Value</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td><code>Content-Type</code></td><td><code>application/json</code></td></tr>
                                    <tr><td><code>x-api-key</code></td><td>Your product API key</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="config-block">
                        <div className="config-label">Request Body (JSON)</div>
                        <div className="config-inner">
                            <table className="docs-table">
                                <thead>
                                    <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><code>website</code></td>
                                        <td>string</td>
                                        <td>one of</td>
                                        <td>User's website URL — we scrape context from it.</td>
                                    </tr>
                                    <tr>
                                        <td><code>description</code></td>
                                        <td>string</td>
                                        <td>one of</td>
                                        <td>Free-text description of the user's role/company.</td>
                                    </tr>
                                </tbody>
                            </table>
                            <p className="hint" style={{ marginTop: "0.75rem" }}>
                                At least one of <code>website</code> or <code>description</code> is required.
                            </p>
                        </div>
                    </div>

                    <div className="config-block">
                        <div className="config-label">Example — cURL</div>
                        <pre className="snippet">{`curl -X POST ${BASE} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{"description":"I run growth at a B2B SaaS startup"}'`}</pre>
                    </div>

                    <div className="config-block">
                        <div className="config-label">Example — JavaScript (fetch)</div>
                        <pre className="snippet">{`const res = await fetch("${BASE}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY",
  },
  body: JSON.stringify({
    website: "acme.com",
  }),
});
const data = await res.json();
console.log(data.use_cases);`}</pre>
                    </div>

                    <div className="config-block">
                        <div className="config-label">Response — 200 OK</div>
                        <pre className="snippet">{`{
  "use_cases": [
    {
      "title": "Automate customer onboarding",
      "description": "Walk new sign-ups through a guided setup..."
    },
    {
      "title": "Track feature adoption by cohort",
      "description": "Segment users by plan tier..."
    }
  ]
}`}</pre>
                    </div>

                    <div className="config-block">
                        <div className="config-label">Error Responses</div>
                        <div className="config-inner">
                            <table className="docs-table">
                                <thead>
                                    <tr><th>Status</th><th>Meaning</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td><code>400</code></td><td>Missing both <code>website</code> and <code>description</code>.</td></tr>
                                    <tr><td><code>401</code></td><td>Invalid or missing API key.</td></tr>
                                    <tr><td><code>500</code></td><td>Server error — try again.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Product info endpoint ── */}
                    <div id="product-info" className="section-divider">
                        <span className="line" />
                        <span className="label">Get Product Info</span>
                        <span className="line" />
                    </div>

                    <div className="docs-block">
                        <div className="docs-method docs-get">GET</div>
                        <code className="docs-url">{BASE}</code>
                    </div>

                    <div className="config-block" style={{ marginTop: "1.25rem" }}>
                        <div className="config-label">Description</div>
                        <div className="config-inner">
                            <p className="docs-text">
                                Returns the product name linked to your API key. Useful for personalizing your widget header.
                            </p>
                        </div>
                    </div>

                    <div className="config-block">
                        <div className="config-label">Response — 200 OK</div>
                        <pre className="snippet">{`{
  "product_name": "Acme Notes"
}`}</pre>
                    </div>

                    {/* ── Widget embed ── */}
                    <div id="widget" className="section-divider">
                        <span className="line" />
                        <span className="label">Widget Embed</span>
                        <span className="line" />
                    </div>

                    <div className="docs-block">
                        <p className="docs-text" style={{ marginBottom: "0.75rem" }}>
                            Drop this snippet into any page. No build step needed.
                        </p>
                    </div>

                    <div className="config-block">
                        <div className="config-label">HTML Snippet</div>
                        <pre className="snippet">{`<div id="usecasely-widget"></div>
<script
  src="${window.location.origin}/widget.js"
  data-api-key="YOUR_API_KEY"
  data-target="#usecasely-widget"
  data-fn-url="${window.location.origin}/functions/v1/generate">
</script>`}</pre>
                    </div>

                    <div className="config-block">
                        <div className="config-label">Or use the hosted preview</div>
                        <div className="config-inner">
                            <p className="docs-text">
                                Visit <code>{window.location.origin}/demo#key=YOUR_API_KEY</code> to see
                                a full-page preview with your product's context.
                            </p>
                        </div>
                    </div>

                    {/* ── Rate limits ── */}
                    <div id="rate-limits" className="section-divider">
                        <span className="line" />
                        <span className="label">Rate Limits</span>
                        <span className="line" />
                    </div>
                    <div className="docs-block">
                        <p className="docs-text">
                            Each API key is rate-limited to <strong>60 requests per minute</strong>.
                            If you exceed this, the API returns <code>429 Too Many Requests</code>.
                        </p>
                    </div>
                </main>

                <aside className="toc-sidebar">
                    <div className="toc-label">On this page</div>
                    <a href="#auth" className="toc-link">Authentication</a>
                    <a href="#generate" className="toc-link">Generate Use Cases</a>
                    <a href="#product-info" className="toc-link">Get Product Info</a>
                    <a href="#widget" className="toc-link">Widget Embed</a>
                    <a href="#rate-limits" className="toc-link">Rate Limits</a>
                </aside>
            </div>


            <Footer />
        </div>
    );
}
