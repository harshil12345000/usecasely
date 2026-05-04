import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

export default function Pricing() {
    const features = [
        "Unlimited Product Contexts",
        "Personalized AI Use Cases",
        "Evidence-Grounded Generation (Gemini 2.5 Flash)",
        "Zero-Config Drop-in Widget",
        "Developer API Access",
        "Security Audit Logging",
        "Self-hostable & Open Source"
    ];

    return (
        <div className="widget-page">
            <Navbar />

            <main className="widget-main" style={{ textAlign: "center", padding: "6rem 2rem" }}>
                <section className="hero" style={{ marginBottom: "4rem" }}>
                    <h1 style={{ fontSize: "5rem", marginBottom: "0.5rem" }}>
                        FREE
                        <span style={{ fontSize: "1.5rem", fontWeight: 400, opacity: 0.6, marginLeft: "0.5rem" }}>
                            (thanks to Zerocost)
                        </span>
                    </h1>
                </section>

                <div className="docs-block" style={{ maxWidth: "500px", margin: "0 auto", textAlign: "left", background: "white", padding: "2.5rem" }}>
                    <div className="config-label" style={{ marginBottom: "1.5rem", color: "var(--uc-black)", fontSize: "1rem" }}>
                        What's included:
                    </div>

                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {features.map((f, i) => (
                            <li key={i} style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                marginBottom: "1rem",
                                color: "var(--uc-black)",
                                fontWeight: 500
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgb(34, 197, 94)" }}>
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {f}
                            </li>
                        ))}
                    </ul>

                    <div style={{ marginTop: "2.5rem" }}>
                        <Link
                            to="/dashboard"
                            className="link-btn"
                            style={{
                                display: "block",
                                textAlign: "center",
                                background: "var(--uc-black)",
                                color: "white",
                                padding: "1rem",
                                borderRadius: "8px",
                                textDecoration: "none",
                                fontWeight: 600
                            }}
                        >
                            Get Started Now
                        </Link>
                    </div>
                </div>

                <p style={{ marginTop: "3rem", fontSize: "0.85rem", opacity: 0.5 }}>
                    Want to run your own instance? Check our <a href="https://github.com/harshil12345000/contextual-use-cases" style={{ textDecoration: "underline", color: "inherit" }}>GitHub</a>.
                </p>
            </main>

            <Footer />
        </div>
    );
}
