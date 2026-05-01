import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const BASE = "https://api.usecases.dev/v1/generate";

export default function Docs() {
    return (
        <div className="widget-page">
            <Navbar />

            <main className="widget-main" style={{ maxWidth: 760 }}>
                <section className="hero" style={{ marginBottom: "2.5rem" }}>
                    <h1>API <em>reference</em></h1>
                    <p className="subtitle">
                        Everything you need to generate personalized use cases from your own backend or frontend.
                    </p>
                </section>

                {/* ── Authentication ── */}
                <div className="section-divider">
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
                <div className="section-divider">
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
                <div className="section-divider">
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
                <div className="section-divider">
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
                    <pre className="snippet">{`<div id="usecases-widget"></div>
<script
  src="${window.location.origin}/widget.js"
  data-api-key="YOUR_API_KEY"
  data-target="#usecases-widget">
</script>`}</pre>
                </div>

                <div className="config-block">
                    <div className="config-label">Or use the hosted preview</div>
                    <div className="config-inner">
                        <p className="docs-text">
                            Visit <code>{window.location.origin}/widget?key=YOUR_API_KEY</code> to see
                            a full-page preview with your product's context.
                        </p>
                    </div>
                </div>

                {/* ── Rate limits ── */}
                <div className="section-divider">
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

            <footer className="site-footer">
                <span className="footer-note">Powered by usecases</span>
                <Link to="/dashboard" className="footer-note" style={{ textDecoration: "underline" }}>Dashboard</Link>
            </footer>
        </div>
    );
}
