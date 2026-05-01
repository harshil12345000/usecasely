// Public widget / live preview page. Reads ?key=... from the URL.
// This is the page rendered by your provided UI design.
import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`;

interface UseCase { title: string; description: string; }

export default function Widget() {
  const [params] = useSearchParams();
  const apiKey = params.get("key") || "";
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<UseCase[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [shown, setShown] = useState(0);
  const [productName, setProductName] = useState<string>("");
  const timers = useRef<number[]>([]);

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const generate = async () => {
    setError(null);
    if (!apiKey) { setError("Missing API key. Add ?key=YOUR_API_KEY to the URL."); return; }
    if (!website.trim() && !description.trim()) {
      setError("Enter a website or a short description.");
      return;
    }
    setLoading(true);
    setResults([]);
    setShown(0);
    timers.current.forEach(clearTimeout);
    try {
      const res = await fetch(FN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify({
          website: website.trim() || undefined,
          description: description.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Generation failed");
      const list: UseCase[] = data.use_cases || [];
      setResults(list);
      // staggered reveal
      list.forEach((_, i) => {
        const t = window.setTimeout(() => setShown((s) => Math.max(s, i + 1)), 80 + i * 110);
        timers.current.push(t);
      });
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const submit = (e: React.FormEvent) => { e.preventDefault(); generate(); };

  return (
    <div className="widget-page">
      <header className="site-header">
        <Link to="/" className="logo">use<span>cases</span></Link>
        <span className="badge">API + Widget</span>
      </header>

      <main className="widget-main">
        <section className="hero">
          <h1>Use cases that<br/>actually <em>fit</em></h1>
          <p className="subtitle">Configure your product once. Every user sees suggestions built around their work, not a generic list.</p>
        </section>

        <form onSubmit={submit}>
          <div className="config-block">
            <div className="config-label">Product context (configured once by you)</div>
            <div className="config-inner">
              <p className="hint" style={{ margin: 0 }}>
                {apiKey
                  ? <>Using API key <code>{apiKey.slice(0, 10)}…</code></>
                  : <>No API key. <Link to="/auth">Sign in</Link> to create a product.</>}
              </p>
            </div>
          </div>

          <div className="user-section">
            <div className="input-row">
              <span className="input-prefix">website</span>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="acme.com"
              />
            </div>

            <div className="or-text">or</div>

            <div className="desc-box">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="I'm a legal ops manager at a fintech handling regulatory change..."
                rows={4}
                maxLength={1000}
              />
            </div>
          </div>

          <button type="submit" className="generate-btn" disabled={loading || !apiKey}>
            {loading ? "Generating..." : "Generate use cases"}
          </button>

          {error && <div className="error-msg visible">{error}</div>}

          {loading && (
            <div className="loading-state visible">
              <div className="dots"><span className="dot"/><span className="dot"/><span className="dot"/></div>
              generating
            </div>
          )}
        </form>

        <section className={`results ${results.length ? "visible" : ""}`}>
          <div className="results-label">Personalized for you</div>
          <ul className="use-case-list">
            {results.map((uc, i) => (
              <li key={i} className={`use-case-item ${i < shown ? "shown" : ""}`}>
                <span className="uc-num">{String(i + 1).padStart(2, "0")}</span>
                <div className="uc-content">
                  <div className="uc-title">{uc.title}</div>
                  <div className="uc-desc">{uc.description}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="site-footer">
        <span className="footer-note">Powered by usecases</span>
        <Link to="/auth" className="footer-note" style={{ textDecoration: "underline" }}>Sign in</Link>
      </footer>
    </div>
  );
}
