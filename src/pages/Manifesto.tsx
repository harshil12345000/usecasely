import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Manifesto() {
    return (
        <div className="widget-page">
            <Navbar />

            <main className="widget-main">
                <section className="hero">
                    <h1>Our <em>Manifesto</em></h1>
                    <p className="subtitle">
                        Personalize your startup's use cases to your users with AI to boost conversions.
                    </p>
                </section>

                <div className="section-divider">
                    <span className="line" />
                    <span className="label">The Problem</span>
                    <span className="line" />
                </div>
                <div className="docs-block">
                    <p className="docs-text">
                        Most startups show a static, generic list of features or use cases.
                        Users are forced to do the mental work of connecting your product to their specific problems.
                        If they fail to make that connection in the first 30 seconds, you lose them.
                    </p>
                </div>

                <div className="section-divider">
                    <span className="line" />
                    <span className="label">The Solution</span>
                    <span className="line" />
                </div>
                <div className="docs-block">
                    <p className="docs-text">
                        We believe that the connection between a user's need and a product's capability should be
                        <strong> automatic, instant, and personalized</strong>.
                    </p>
                    <p className="docs-text" style={{ marginTop: "1rem" }}>
                        By leveraging AI to understand a user's context (from their website or a short description),
                        we generate use cases that resonate specifically with them.
                        This isn't just about showing off tech—it's about removing the cognitive load and
                        drastically improving conversion rates by speaking directly to the user's situation.
                    </p>
                </div>

                <div className="docs-block" style={{ marginTop: "2rem" }}>
                    <a
                        href="https://www.linkedin.com/in/harshilsavla/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="docs-text"
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "underline", fontWeight: 400 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                        Founder Profile
                    </a>
                </div>

                <div className="cta-row" style={{ marginTop: "3rem" }}>
                    <Link to="/auth" className="generate-btn">Join the movement</Link>
                    <Link to="/demo" className="link-btn outlined">See it in action</Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}
