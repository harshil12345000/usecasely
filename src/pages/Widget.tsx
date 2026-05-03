import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const FN_URL = "/functions/v1/generate";

interface UseCase { title: string; description: string; }

// Read the API key from the URL hash fragment (e.g. /demo#key=uc_...).
// Hash fragments are NOT sent to the server, do not appear in access logs,
// and are stripped from the Referer header — much safer than a query param.
function readKeyFromHash(): string {
  if (typeof window === "undefined") return "";
  const h = window.location.hash.replace(/^#/, "");
  if (!h) return "";
  const params = new URLSearchParams(h);
  return params.get("key") || "";
}

export default function Widget() {
  const [apiKey, setApiKey] = useState<string>(() => readKeyFromHash());

  // Migrate any legacy ?key=... links to the hash form, then strip from the URL.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const legacyKey = url.searchParams.get("key");
    if (legacyKey) {
      url.searchParams.delete("key");
      const newHash = `key=${encodeURIComponent(legacyKey)}`;
      window.history.replaceState(null, "", `${url.pathname}${url.search}#${newHash}`);
      setApiKey(legacyKey);
    }
    const onHash = () => setApiKey(readKeyFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<UseCase[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [shown, setShown] = useState(0);
  const [productName, setProductName] = useState<string>("");
  const [session, setSession] = useState<any>(null);
  const [myProducts, setMyProducts] = useState<{ id: string; name: string; api_key: string }[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => {
      subscription.unsubscribe();
      timers.current.forEach(clearTimeout);
    };
  }, []);

  // When logged in and no key in URL → load user's products and auto-pick the first.
  useEffect(() => {
    if (!session) { setMyProducts([]); return; }
    let cancelled = false;
    supabase
      .from("products")
      .select("id, name, api_key")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (cancelled || !data) return;
        setMyProducts(data);
        if (!apiKey && data.length > 0) {
          const k = data[0].api_key;
          setApiKey(k);
          window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#key=${encodeURIComponent(k)}`);
        }
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const switchProduct = (key: string) => {
    setApiKey(key);
    setProductName("");
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#key=${encodeURIComponent(key)}`);
  };

  // Fetch product name once for the personalized helper text.
  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    fetch(FN_URL, { method: "GET", headers: { "x-api-key": apiKey } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (!cancelled && d?.product_name) setProductName(d.product_name); })
      .catch(() => { /* silent — falls back to "this product" */ });
    return () => { cancelled = true; };
  }, [apiKey]);

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
      let data;
      try {
        data = await res.json();
      } catch (e) {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        throw new Error("Invalid response from server");
      }
      if (!res.ok) throw new Error(data?.error || "Generation failed");
      const list: UseCase[] = data.use_cases || [];
      setResults(list);
      // staggered reveal
      list.forEach((_, i) => {
        const t = window.setTimeout(() => setShown((s) => Math.max(s, i + 1)), 80 + i * 110);
        timers.current.push(t);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const submit = (e: React.FormEvent) => { e.preventDefault(); generate(); };

  return (
    <div className="widget-page">
      <Navbar />

      <main className="widget-main">
        <section className="hero">
          <h1>Use cases <em>personalized</em><br />to users</h1>
          <p className="subtitle">Configure your product once. Every user sees suggestions built around their work, not a generic list.</p>
        </section>

        <form onSubmit={submit}>
          <div className="section-divider">
            <span className="line" />
            <span className="label">Configure your product</span>
            <span className="line" />
          </div>
          <div className="section-body">
            {session && myProducts.length > 0 ? (
              <div className="product-picker">
                <label className="hint" style={{ margin: 0 }}>Active product</label>
                <select value={apiKey} onChange={(e) => switchProduct(e.target.value)}>
                  {myProducts.map((p) => (
                    <option key={p.id} value={p.api_key}>{p.name}</option>
                  ))}
                </select>
                <p className="hint" style={{ margin: 0, fontSize: "0.65rem" }}>
                  Using API key <code>{apiKey.slice(0, 10)}…</code>
                </p>
              </div>
            ) : apiKey ? (
              <p className="hint" style={{ margin: 0 }}>
                Using API key <code>{apiKey.slice(0, 10)}…</code>
                {productName ? <> · <strong style={{ fontWeight: 400, color: "var(--uc-black)" }}>{productName}</strong></> : null}
              </p>
            ) : session ? (
              <div style={{
                display: "flex", alignItems: "center", gap: "0.75rem", width: "100%",
                padding: "0.875rem 1.25rem", background: "rgba(220, 38, 38, 0.06)",
                border: "1.5px solid rgba(220, 38, 38, 0.35)", borderRadius: "8px",
              }}>
                <p className="hint" style={{ margin: 0, color: "rgba(185,28,28,0.9)" }}>
                  No products yet. <Link to="/dashboard" style={{ color: "rgb(185,28,28)", fontWeight: 600 }}>Create one</Link> to get started.
                </p>
              </div>
            ) : (
              <div style={{
                display: "flex", alignItems: "center", gap: "0.75rem", width: "100%",
                padding: "0.875rem 1.25rem", background: "rgba(220, 38, 38, 0.06)",
                border: "1.5px solid rgba(220, 38, 38, 0.35)", borderRadius: "8px",
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(220,38,38,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ width: "20px", height: "20px", flexShrink: 0 }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <p className="hint" style={{ margin: 0, color: "rgba(185,28,28,0.9)" }}>
                  No API key. <Link to="/auth" style={{ color: "rgb(185,28,28)", fontWeight: 600 }}>Sign in</Link> first to configure your product.
                </p>
              </div>
            )}
          </div>

          <div className="section-divider">
            <span className="line" />
            <span className="label">What users see</span>
            <span className="line" />
          </div>

          <div className="user-section">
            <p className="field-helper">
              Enter your website to see how {productName || "this product"} helps you
            </p>
            <div className="input-row">
              <span className="input-prefix">website</span>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="acme.com"
              />
            </div>

            <div className="or-text">or enter details manually</div>

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
              <div className="dots"><span className="dot" /><span className="dot" /><span className="dot" /></div>
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

      <Footer />
    </div>
  );
}
