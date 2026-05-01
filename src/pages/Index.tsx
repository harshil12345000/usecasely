import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Index() {
  return (
    <div className="widget-page">
      <Navbar />

      <main className="widget-main">
        <section className="hero" style={{ marginBottom: "3rem" }}>
          <h1>Use cases <em>personalized</em><br />to users</h1>
          <p className="subtitle">
            Configure your product once. Every user sees suggestions built around their work, not a generic list.
            A drop-in widget and HTTP API powered by AI.
          </p>
        </section>

        <div className="cta-row">
          <Link to="/auth" className="generate-btn">Get started</Link>
          <Link to="/demo" className="link-btn outlined">Try the demo widget</Link>
        </div>

        <section style={{ marginTop: "4rem" }}>
          <div className="results-label">How it works</div>
          <ul className="use-case-list">
            <li className="use-case-item shown">
              <span className="uc-num">01</span>
              <div className="uc-content">
                <div className="uc-title">Configure your product - What is it?</div>
                <div className="uc-desc">Describe what your product does, who it's for, and what it can do — once.</div>
              </div>
            </li>
            <li className="use-case-item shown">
              <span className="uc-num">02</span>
              <div className="uc-content">
                <div className="uc-title">Setup the widget or call the API in less than 5 mins</div>
                <div className="uc-desc">A single script tag on your onboarding page. Or a REST endpoint with your API key.</div>
              </div>
            </li>
            <li className="use-case-item shown">
              <span className="uc-num">03</span>
              <div className="uc-content">
                <div className="uc-title">Every user sees use cases personalized for them</div>
                <div className="uc-desc">Built from their website or a sentence about their role — not a static list.</div>
              </div>
            </li>
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
}
