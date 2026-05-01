import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

interface Product {
  id: string;
  name: string;
  description: string;
  api_key: string;
  created_at: string;
}

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`;
const DESC_PREVIEW = 100; // chars before truncation

export default function Dashboard() {
  const nav = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [expandedDesc, setExpandedDesc] = useState<string | null>(null);

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

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  return (
    <div className="dash-page">
      <Navbar />

      <main className="dash-main">
        <section className="hero">
          <h1>Your <em>products</em></h1>
          <p className="subtitle">Each product gets an API key. Drop it into your widget or call the API directly.</p>
        </section>

        {/* ── Existing products ── */}
        <div className="results-label">{products.length} product{products.length === 1 ? "" : "s"}</div>

        {loading ? (
          <p className="subtitle" style={{ marginBottom: "3rem" }}>Loading...</p>
        ) : products.length === 0 ? (
          <p className="subtitle" style={{ marginBottom: "3rem" }}>No products yet. Create one below.</p>
        ) : (
          <ul className="compact-product-list" style={{ marginBottom: "3rem" }}>
            {products.map((p) => {
              const revealed = revealedKey === p.id;
              const expanded = expandedDesc === p.id;
              const needsTruncation = p.description.length > DESC_PREVIEW;
              const descText = expanded || !needsTruncation
                ? p.description
                : p.description.slice(0, DESC_PREVIEW) + "…";

              return (
                <li key={p.id} className="compact-product-row">
                  <div className="compact-product-top">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="compact-product-name">{p.name}</div>
                      <p className="compact-product-desc">
                        {descText}
                        {needsTruncation && (
                          <button
                            className="link-btn"
                            style={{ marginLeft: "0.35rem" }}
                            onClick={() => setExpandedDesc(expanded ? null : p.id)}
                          >
                            {expanded ? "less" : "more"}
                          </button>
                        )}
                      </p>
                    </div>
                    <button onClick={() => remove(p.id)} className="link-btn danger" style={{ flexShrink: 0 }}>Delete</button>
                  </div>

                  <div className="compact-key-row">
                    <code>{revealed ? p.api_key : "•".repeat(24)}</code>
                    <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                      <button className="link-btn" onClick={() => setRevealedKey(revealed ? null : p.id)}>
                        {revealed ? "Hide" : "Reveal"}
                      </button>
                      <button className="link-btn" onClick={() => copy(p.api_key)}>Copy</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* ── New product form ── */}
        <div className="section-divider" style={{ marginTop: 0 }}>
          <span className="line" />
          <span className="label">New product</span>
          <span className="line" />
        </div>

        <form onSubmit={create} style={{ marginTop: "1.5rem" }}>
          <div className="config-block">
            <div className="config-label">Name</div>
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
      </main>
    </div>
  );
}
