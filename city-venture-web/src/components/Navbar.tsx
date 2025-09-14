import React from "react";
import { Button, Typography } from "@mui/joy";
import "./styles/navbar.css";
import { useNavigate } from "react-router-dom";
import { colors } from "../utils/Colors";

interface NavbarProps {
  /** ID of the Services section to scroll to */
  servicesId?: string;
  /** ID of the About section to scroll to */
  aboutId?: string;
}

const Navbar: React.FC<NavbarProps> = ({ servicesId = "features", aboutId = "about" }) => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [bgOpacity, setBgOpacity] = React.useState(0.02);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      const t = Math.min(y / 160, 1);
      const opacity = 0.02 + t * 0.92; // fade to ~0.94
      setBgOpacity(parseFloat(opacity.toFixed(3)));
      setScrolled(y > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const logo = new URL("../assets/images/logo.png", import.meta.url).href;

  const scrollTo = (id?: string) => {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setOpen(false);
    }
  };

  const navStyle = { "--nav-bg": String(bgOpacity) } as React.CSSProperties & { [key: string]: string };

  return (
    <nav
      className={`navbar navbar-dark ${scrolled ? "scrolled" : ""}`}
      style={navStyle}
    >
      <div className="nav-inner">
        {/* Brand */}
        <div className="brand" role="button" onClick={() => { setOpen(false); navigate("/"); }}>
          <img src={logo} alt="City Venture" />
          <Typography level="title-lg" textColor={colors.primary} sx={{ fontSize: 22, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.9 }}>City Venture</Typography>
        </div>

        {/* Links (desktop) */}
        <div className="nav-links" aria-label="Primary">
          <a className="nav-link" href="#hero" onClick={(e) => { e.preventDefault(); scrollTo("hero"); }}>Home</a>
          <a className="nav-link" href={`#${aboutId}`} onClick={(e) => { e.preventDefault(); scrollTo(aboutId); }}>About</a>
          <a className="nav-link" href="#features" onClick={(e) => { e.preventDefault(); scrollTo(servicesId); }}>Services</a>
        </div>

        {/* Actions (desktop) */}
        <div className="nav-actions">
          <Button
            variant="plain"
            color="neutral"
            onClick={() => navigate("/business/login")}
            sx={{
              color: '#374151',
              fontWeight: 500,
              textTransform: 'none',
              px: 0,
              backgroundColor: 'transparent',
              padding: '6px 12px',
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'none'
              }
            }}
          >
            Login
          </Button>
          <Button
            variant="solid"
            onClick={() => navigate("/business/signup")}
            sx={{
              backgroundColor: colors.primary,
              color: '#ffffff',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              boxShadow: '0 2px 8px rgba(10,27,71,0.2)',
              '&:hover': {
                backgroundColor: '#0a1a3d',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 16px rgba(10,27,71,0.3)'
              }
            }}
          >
            Register
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          className="menu-btn"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.25)",
            background: "transparent",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          }}
        >
          <span style={{ display: "block", width: 18, height: 2, background: colors.white, margin: "0 auto", borderRadius: 2 }} />
          <span style={{ display: "block", width: 18, height: 2, background: colors.white, margin: "4px auto", borderRadius: 2 }} />
          <span style={{ display: "block", width: 18, height: 2, background: colors.white, margin: "0 auto", borderRadius: 2 }} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="mobile-menu" role="dialog" aria-modal="true">
          <div className="mobile-menu-inner">
            <a className="nav-link" style={{ color: colors.primary }} href="#hero" onClick={(e) => { e.preventDefault(); scrollTo("hero"); }}>Home</a>
            <a className="nav-link" style={{ color: colors.primary }} href={`#${aboutId}`} onClick={(e) => { e.preventDefault(); scrollTo(aboutId); }}>About</a>
            <a className="nav-link" style={{ color: colors.primary }} href={`#${servicesId}`} onClick={(e) => { e.preventDefault(); scrollTo(servicesId); }}>Services</a>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Button
                variant="plain"
                color="neutral"
                onClick={() => { setOpen(false); navigate("/business/login"); }}
                sx={{ color: '#374151', textTransform: 'none', px: 0, backgroundColor: 'transparent', padding: '8px 16px', '&:hover': { backgroundColor: 'transparent', textDecoration: 'none' } }}
              >
                Login
              </Button>
              <Button
                variant="solid"
                onClick={() => { setOpen(false); navigate("/business/signup"); }}
                sx={{ backgroundColor: colors.primary, color: '#ffffff', fontWeight: 600, textTransform: 'none', borderRadius: 8, padding: '8px 16px', boxShadow: '0 2px 8px rgba(10,27,71,0.2)', '&:hover': { backgroundColor: '#0a1a3d', transform: 'translateY(-1px)', boxShadow: '0 4px 16px rgba(10,27,71,0.3)' } }}
              >
                Register
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
