import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="site-footer">
            <span className="footer-note">Powered by Usecasely</span>
            <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
                <a
                    href="https://www.linkedin.com/in/harshilsavla/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-note"
                    style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "underline" }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    Founder Profile
                </a>
                <Link to="/docs" className="footer-note" style={{ textDecoration: "underline" }}>Docs</Link>
                <Link to="/pricing" className="footer-note" style={{ textDecoration: "underline" }}>Pricing</Link>
                <Link to="/demo" className="footer-note" style={{ textDecoration: "underline" }}>Demo</Link>
                <Link to="/manifesto" className="footer-note" style={{ textDecoration: "underline" }}>Manifesto</Link>
                <Link to="/auth" className="footer-note" style={{ textDecoration: "underline" }}>Sign in</Link>
            </div>
        </footer>
    );
}
