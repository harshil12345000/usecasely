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

interface Generation {
  id: string;
  user_website: string | null;
  user_description: string | null;
  scraped_content: string | null;
  results: { title: string; description: string }[];
  feedback_rating: string | null;
  feedback_text: string | null;
  feedback_at: string | null;
  created_at: string;
}

interface Learning {
  id: string;
  lesson: string;
  created_at: string;
}

const FN_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/generate`;
const DESC_PREVIEW = 100;

export default function Dashboard() {
  const nav = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // per-row UI state
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [expandedDesc, setExpandedDesc] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [logsOpen, setLogsOpen] = useState<string | null>(null);
  const [logsByProduct, setLogsByProduct] = useState<Record<string, Generation[]>>({});
  const [learningsByProduct, setLearningsByProduct] = useState<Record<string, Learning[]>>({});
  const [loadingLogs, setLoadingLogs] = useState<string | null>(null);
  const [expandedScrape, setExpandedScrape] = useState<Record<string, boolean>>({});
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({});
  const [submittingFeedback, setSubmittingFeedback] = useState<string | null>(null);

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
    if (!confirm("Delete this product? This will also delete its logs and learnings.")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    load();
  };

  const startEdit = (p: Product) => {
    setEditing(p.id);
    setEditName(p.name);
    setEditDesc(p.description);
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase
      .from("products")
      .update({ name: editName.trim().slice(0, 200), description: editDesc.trim().slice(0, 2000) })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setEditing(null);
    load();
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  const toggleLogs = async (productId: string) => {
    if (logsOpen === productId) {
      setLogsOpen(null);
      return;
    }
    setLogsOpen(productId);
    if (!logsByProduct[productId]) {
      setLoadingLogs(productId);
      const [{ data: gens }, { data: lessons }] = await Promise.all([
        supabase.from("generations")
          .select("id, user_website, user_description, scraped_content, results, feedback_rating, feedback_text, feedback_at, created_at")
          .eq("product_id", productId)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase.from("product_learnings")
          .select("id, lesson, created_at")
          .eq("product_id", productId)
          .order("created_at", { ascending: false }),
      ]);
      setLogsByProduct((m) => ({ ...m, [productId]: (gens as Generation[]) || [] }));
      setLearningsByProduct((m) => ({ ...m, [productId]: (lessons as Learning[]) || [] }));
      setLoadingLogs(null);
    }
  };

  const refreshLogs = async (productId: string) => {
    const [{ data: gens }, { data: lessons }] = await Promise.all([
      supabase.from("generations")
        .select("id, user_website, user_description, scraped_content, results, feedback_rating, feedback_text, feedback_at, created_at")
        .eq("product_id", productId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("product_learnings")
        .select("id, lesson, created_at")
        .eq("product_id", productId)
        .order("created_at", { ascending: false }),
    ]);
    setLogsByProduct((m) => ({ ...m, [productId]: (gens as Generation[]) || [] }));
    setLearningsByProduct((m) => ({ ...m, [productId]: (lessons as Learning[]) || [] }));
  };

  const submitFeedback = async (product: Product, gen: Generation, rating: "good" | "bad") => {
    setSubmittingFeedback(gen.id);
    const text = feedbackText[gen.id]?.trim() || "";
    try {
      const res = await fetch(FN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": product.api_key },
        body: JSON.stringify({ action: "feedback", generation_id: gen.id, rating, text: text || undefined }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed");
      }
      toast.success(rating === "bad" && text ? "Thanks — agent learned a new rule" : "Feedback saved");
      setFeedbackText((m) => ({ ...m, [gen.id]: "" }));
      await refreshLogs(product.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSubmittingFeedback(null);
    }
  };

  const removeLearning = async (productId: string, learningId: string) => {
    const { error } = await supabase.from("product_learnings").delete().eq("id", learningId);
    if (error) { toast.error(error.message); return; }
    toast.success("Rule removed");
    await refreshLogs(productId);
  };

  return (
    <div className="dash-page">
      <Navbar />

      <main className="dash-main">
        <section className="hero">
          <h1>Your <em>products</em></h1>
          <p className="subtitle">Each product gets an API key. Drop it into your widget or call the API directly.</p>
        </section>

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
              const isEditing = editing === p.id;
              const isLogsOpen = logsOpen === p.id;
              const needsTruncation = p.description.length > DESC_PREVIEW;
              const descText = expanded || !needsTruncation
                ? p.description
                : p.description.slice(0, DESC_PREVIEW) + "…";
              const logs = logsByProduct[p.id] || [];
              const learnings = learningsByProduct[p.id] || [];

              return (
                <li key={p.id} className="compact-product-row">
                  <div className="compact-product-top">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="compact-product-name">{p.name}</div>
                      {!isEditing && (
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
                      )}
                    </div>
                    {!isEditing && (
                      <div className="pill-row" style={{ flexShrink: 0 }}>
                        <button onClick={() => startEdit(p)} className="pill-btn">Edit</button>
                        <button onClick={() => remove(p.id)} className="pill-btn danger">Delete</button>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="inline-edit">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        maxLength={200}
                        placeholder="Product name"
                      />
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={5}
                        maxLength={2000}
                        placeholder="Product context"
                      />
                      <div className="pill-row">
                        <button className="pill-btn primary" onClick={() => saveEdit(p.id)}>Save</button>
                        <button className="pill-btn" onClick={() => setEditing(null)}>Cancel</button>
                      </div>
                    </div>
                  )}

                  <div className="compact-key-row">
                    <code>{revealed ? p.api_key : "•".repeat(24)}</code>
                    <div className="pill-row" style={{ flexShrink: 0 }}>
                      <Link to={`/demo#key=${encodeURIComponent(p.api_key)}`} className="pill-btn primary">Try it now</Link>
                      <button className={`pill-btn ${isLogsOpen ? "active" : ""}`} onClick={() => toggleLogs(p.id)}>
                        Logs{logs.length ? ` (${logs.length})` : ""}
                      </button>
                      <button className="pill-btn" onClick={() => setRevealedKey(revealed ? null : p.id)}>
                        {revealed ? "Hide" : "Reveal"}
                      </button>
                      <button className="pill-btn" onClick={() => copy(p.api_key)}>Copy</button>
                    </div>
                  </div>

                  {isLogsOpen && (
                    <div className="logs-panel">
                      {/* Learnings */}
                      {learnings.length > 0 && (
                        <div className="learnings-box">
                          <div className="log-section-label">What this agent has learned ({learnings.length})</div>
                          {learnings.map((l) => (
                            <div key={l.id} className="learning-item">
                              <span>{l.lesson}</span>
                              <button className="link-btn danger" onClick={() => removeLearning(p.id, l.id)}>remove</button>
                            </div>
                          ))}
                        </div>
                      )}

                      {loadingLogs === p.id ? (
                        <p className="subtitle">Loading logs…</p>
                      ) : logs.length === 0 ? (
                        <p className="subtitle">No generations yet for this product.</p>
                      ) : logs.map((g) => {
                        const scrapeOpen = !!expandedScrape[g.id];
                        const userInput = g.user_website
                          ? `🌐 ${g.user_website}`
                          : `✏️  ${(g.user_description || "").slice(0, 200)}`;
                        return (
                          <div key={g.id} className="log-row">
                            <div className="log-meta">
                              <span>{new Date(g.created_at).toLocaleString()}</span>
                              {g.feedback_rating && (
                                <span>feedback: {g.feedback_rating === "good" ? "👍" : "👎"}</span>
                              )}
                            </div>

                            <div>
                              <div className="log-section-label">User input</div>
                              <div>{userInput}</div>
                            </div>

                            {g.scraped_content && (
                              <div>
                                <div className="log-section-label" style={{ display: "flex", justifyContent: "space-between" }}>
                                  <span>Jina markdown ({g.scraped_content.length} chars)</span>
                                  <button className="link-btn" onClick={() => setExpandedScrape((m) => ({ ...m, [g.id]: !scrapeOpen }))}>
                                    {scrapeOpen ? "hide" : "show"}
                                  </button>
                                </div>
                                {scrapeOpen && <pre className="log-pre">{g.scraped_content}</pre>}
                              </div>
                            )}

                            <div>
                              <div className="log-section-label">Output ({g.results?.length || 0})</div>
                              <div className="log-results">
                                {(g.results || []).map((r, i) => (
                                  <div key={i} className="log-result-item">
                                    <div className="log-result-title">{r.title}</div>
                                    <div className="log-result-desc">{r.description}</div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {g.feedback_rating ? (
                              <div className="feedback-given">
                                ✓ Feedback given {g.feedback_text ? `— "${g.feedback_text}"` : ""}
                              </div>
                            ) : (
                              <div className="feedback-row">
                                <input
                                  type="text"
                                  className="feedback-input"
                                  placeholder="Optional: what went wrong? (creates a learned rule)"
                                  value={feedbackText[g.id] || ""}
                                  onChange={(e) => setFeedbackText((m) => ({ ...m, [g.id]: e.target.value }))}
                                  maxLength={1000}
                                />
                                <button
                                  className="pill-btn"
                                  disabled={submittingFeedback === g.id}
                                  onClick={() => submitFeedback(p, g, "good")}
                                >👍 Good</button>
                                <button
                                  className="pill-btn danger"
                                  disabled={submittingFeedback === g.id}
                                  onClick={() => submitFeedback(p, g, "bad")}
                                >👎 Bad</button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {/* New product form */}
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
