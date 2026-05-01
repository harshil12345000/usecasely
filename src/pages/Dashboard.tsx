import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string;
  api_key: string;
  created_at: string;
}

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`;

export default function Dashboard() {
  const nav = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { nav("/auth", { replace: true }); return; }
      load();
    });
  }, [nav]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setProducts(data || []);
    setLoading(false);
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;
    setCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { nav("/auth"); return; }
    const { error } = await supabase.from("products").insert({
      owner_id: user.id,
      name: name.trim().slice(0, 200),
      description: description.trim().slice(0, 2000),
    });
    setCreating(false);
    if (error) { toast.error(error.message); return; }
    setName(""); setDescription("");
    toast.success("Product created");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    load();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    nav("/auth", { replace: true });
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  return (
    <div className="dash-page">
      <header className="site-header">
        <Link to="/" className="logo">use<span>cases</span></Link>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span className="badge">Dashboard</span>
          <button onClick={signOut} className="link-btn">Sign out</button>
        </div>
      </header>

      <main className="dash-main">
        <section className="hero">
          <h1>Your <em>products</em></h1>
          <p className="subtitle">Each product gets an API key. Drop it into your widget or call the API directly.</p>
        </section>

        <form onSubmit={create} style={{ marginBottom: "3rem" }}>
          <div className="config-block">
            <div className="config-label">New product — name</div>
            <div className="config-inner">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Notes" required maxLength={200} />
            </div>
          </div>
          <div className="config-block">
            <div className="config-label">Product context (what it does, who it's for, capabilities)</div>
            <div className="config-inner">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A note-taking app for product teams. Capabilities: shared docs, AI summaries, comments, integrations with Slack and Linear..."
                rows={5}
                required
                maxLength={2000}
              />
            </div>
          </div>
          <button type="submit" className="generate-btn" disabled={creating}>
            {creating ? "Creating..." : "Create product"}
          </button>
        </form>

        <div className="results-label">{products.length} product{products.length === 1 ? "" : "s"}</div>

        {loading ? (
          <p className="subtitle">Loading...</p>
        ) : products.length === 0 ? (
          <p className="subtitle">No products yet. Create one above.</p>
        ) : (
          <ul className="product-list">
            {products.map((p) => {
              const revealed = revealedKey === p.id;
              return (
                <li key={p.id} className="product-card">
                  <div className="product-head">
                    <div>
                      <h3 className="product-name">{p.name}</h3>
                      <p className="product-desc">{p.description}</p>
                    </div>
                    <button onClick={() => remove(p.id)} className="link-btn danger">Delete</button>
                  </div>

                  <div className="config-block" style={{ marginTop: "1.25rem", marginBottom: "0.75rem" }}>
                    <div className="config-label">API key</div>
                    <div className="config-inner key-row">
                      <code>{revealed ? p.api_key : "•".repeat(28)}</code>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="link-btn" onClick={() => setRevealedKey(revealed ? null : p.id)}>
                          {revealed ? "Hide" : "Reveal"}
                        </button>
                        <button className="link-btn" onClick={() => copy(p.api_key)}>Copy</button>
                      </div>
                    </div>
                  </div>

                  <details className="snippet-details">
                    <summary>Integration snippets</summary>
                    <div className="config-label" style={{ marginTop: "1rem" }}>API — POST</div>
                    <pre className="snippet">{`curl -X POST ${FN_URL} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${p.api_key}" \\
  -d '{"description":"I run growth at a B2B SaaS"}'`}</pre>

                    <div className="config-label" style={{ marginTop: "1rem" }}>Widget — drop-in</div>
                    <pre className="snippet">{`<div id="usecases-widget"></div>
<script src="${window.location.origin}/widget.js"
        data-api-key="${p.api_key}"
        data-target="#usecases-widget"></script>`}</pre>

                    <p className="hint">
                      Or visit{" "}
                      <a href={`/widget?key=${p.api_key}`} target="_blank" rel="noreferrer">
                        the live preview
                      </a>{" "}
                      to test.
                    </p>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
