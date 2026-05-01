import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Navbar() {
    const { pathname } = useLocation();
    const nav = useNavigate();
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setSession(data.session));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (!session && pathname === "/dashboard") nav("/auth", { replace: true });
        });
        return () => subscription.unsubscribe();
    }, [nav, pathname]);

    const isDocs = pathname === "/docs";
    const isDemo = pathname === "/widget";
    const isAuth = pathname === "/auth";
    const isDash = pathname === "/dashboard";

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        nav("/auth", { replace: true });
    };

    return (
        <header className="site-header">
            <Link to="/" className="logo">use<span>cases</span></Link>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>

                {/* Docs */}
                {isDocs ? (
                    <span className="badge">Docs</span>
                ) : (
                    <Link to="/docs" className="badge badge-link" style={{ textDecoration: "none" }}>Docs</Link>
                )}

                {/* Try Demo */}
                {isDemo ? (
                    <span className="badge">Try Demo</span>
                ) : (
                    <Link to="/widget" className="badge badge-link" style={{ textDecoration: "none" }}>Try Demo</Link>
                )}

                {/* Account Action */}
                {session ? (
                    <>
                        {isDash ? (
                            <span className="badge">Dashboard</span>
                        ) : (
                            <Link to="/dashboard" className="badge badge-link" style={{ textDecoration: "none" }}>Dashboard</Link>
                        )}
                        <button
                            onClick={handleSignOut}
                            className="link-btn"
                            style={{ marginLeft: "0.25rem", fontSize: "0.65rem" }}
                        >
                            Sign out
                        </button>
                    </>
                ) : (
                    <Link
                        to="/auth"
                        className={isAuth ? "badge" : "link-btn"}
                        style={isAuth ? { textDecoration: "none" } : { marginLeft: "0.5rem", fontSize: "0.65rem" }}
                    >
                        {isAuth ? "Sign in" : "Sign In / Up"}
                    </Link>
                )}
            </div>
        </header>
    );
}
