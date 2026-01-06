import React from "react";
import {
  Button,
  Avatar,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  ListDivider,
  IconButton,
} from "@mui/joy";
import "../style/navbar.css";
import { useNavigate } from "react-router-dom";
import { colors } from "../../../utils/Colors";
import { useAuth } from "@/src/context/AuthContext";
import logo from "@/src/assets/logo/city-ventures-horizontal.png";
interface NavbarProps {
  /** ID of the Services section to scroll to */
  servicesId?: string;
  /** ID of the About section to scroll to */
  aboutId?: string;
  /** Whether the navbar should have a solid background */
  solid?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  servicesId = "features",
  aboutId = "about",
  solid = false,
}) => {
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

  const { user, logout } = useAuth();
  const role = user?.role_name ?? "";
  const isOwner = role === "Business Owner";
  const isStaff = role === "Staff";
  const isTourism = role === "Admin" || role === "Tourism Officer";
  const displayRole = role;
  const nameOnly = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();
  const displayName = nameOnly || ""; // do not fallback to email for display name per requirement
  const initials = (
    user?.first_name?.[0] ??
    user?.email?.[0] ??
    "U"
  ).toUpperCase();

  const profilePath = isOwner
    ? "/business/profile"
    : isTourism
    ? "/tourism/profile"
    : "/";
  const statusPath = isOwner
    ? "/business"
    : isTourism
    ? "/tourism/dashboard"
    : "/";

  const scrollTo = (id?: string) => {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setOpen(false);
    }
  };

  const navStyle = { "--nav-bg": solid ? "1" : String(bgOpacity) } as React.CSSProperties & {
    [key: string]: string;
  };

  return (
    <nav
      className={`navbar navbar-dark ${scrolled || solid ? "scrolled" : ""}`}
      style={navStyle}
    >
      <div className="nav-inner">
        {/* Brand */}
        <div
          className="brand"
          role="button"
          onClick={() => {
            setOpen(false);
            navigate("/");
          }}
        >
          <img
            src={logo}
            alt="City Venture"
            style={{ height: "50px", width: "auto" }}
          />
        </div>

        {/* Links (desktop) */}
        <div className="nav-links" aria-label="Primary">
          <a
            className="nav-link"
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("hero");
              navigate("/");
            }}
          >
            Home
          </a>
          <a
            className="nav-link"
            href={`#${aboutId}`}
            onClick={(e) => {
              e.preventDefault();
              scrollTo(aboutId);
            }}
          >
            About
          </a>
          <a
            className="nav-link"
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              scrollTo(servicesId);
            }}
          >
            Services
          </a>
          <a
            className="nav-link"
            href="#features"
            onClick={(e) => {
              navigate("/test");
            }}
          >
            Components
          </a>
          <a
            className="nav-link"
            href="/for-business"
            onClick={(e) => {
              e.preventDefault();
              navigate("/for-business");
            }}
          >
            For Business
          </a>
        </div>

        {/* Actions (desktop) */}
        <div className="nav-actions">
          {!user ? (
            <>
              <Button
                variant="plain"
                color="neutral"
                onClick={() => navigate("/login")}
                sx={{
                  color: "#374151",
                  fontWeight: 500,
                  textTransform: "none",
                  px: 0,
                  backgroundColor: "transparent",
                  padding: "6px 12px",
                  "&:hover": {
                    backgroundColor: "transparent",
                    textDecoration: "none",
                  },
                }}
              >
                Login
              </Button>
              <Button
                variant="solid"
                onClick={() => navigate("/business-registration")}
                sx={{
                  backgroundColor: colors.primary,
                  color: "#ffffff",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 8,
                  padding: "8px 16px",
                  boxShadow: "0 2px 8px rgba(10,27,71,0.2)",
                  "&:hover": {
                    backgroundColor: "#0a1a3d",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 16px rgba(10,27,71,0.3)",
                  },
                }}
              >
                Sign Up
              </Button>
            </>
          ) : (
            <Dropdown>
              <MenuButton
                slots={{ root: IconButton }}
                slotProps={{
                  root: {
                    variant: "soft",
                    color: "neutral",
                    sx: { borderRadius: 12 },
                  },
                }}
                aria-label="User menu"
              >
                <Avatar size="sm">{initials}</Avatar>
              </MenuButton>
              <Menu placement="bottom-end" size="sm" sx={{ minWidth: 220 }}>
                <MenuItem disabled sx={{ fontWeight: 600 }}>
                  {displayName}
                </MenuItem>
                {displayRole && (
                  <MenuItem disabled sx={{ fontSize: 12, opacity: 0.8 }}>
                    {displayRole}
                  </MenuItem>
                )}
                <ListDivider />

                {/* Profile menu item for business owners and staff (including custom roles) */}
                {(isOwner || isStaff) && (
                  <MenuItem
                    onClick={() => {
                      navigate("/user/profile");
                    }}
                  >
                    Profile
                  </MenuItem>
                )}

                {isTourism && (
                  <MenuItem onClick={() => navigate("/tourism/profile")}>
                    Profile
                  </MenuItem>
                )}

                <MenuItem onClick={() => navigate(profilePath)}>
                  Settings
                </MenuItem>
                {isTourism && (
                  <MenuItem onClick={() => navigate(statusPath)}>
                    Admin Dashboard
                  </MenuItem>
                )}
                {/* My Business menu item for owners and staff (including custom roles) */}
                {(isOwner || isStaff) && (
                  <MenuItem
                    onClick={() => {
                      if (role === "Business Owner") {
                        navigate("/business");
                      } else {
                        // Staff and custom roles go to dashboard
                        navigate("/business/dashboard");
                      }
                    }}
                  >
                    My Business
                  </MenuItem>
                )}
                <ListDivider />
                <MenuItem
                  color="danger"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </Dropdown>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="menu-btn"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
          }}
        >
          <span
            style={{
              display: "block",
              width: 18,
              height: 2,
              background: colors.primary,
              borderRadius: 2,
              transition: "all 0.2s ease",
            }}
          />
          <span
            style={{
              display: "block",
              width: 18,
              height: 2,
              background: colors.primary,
              borderRadius: 2,
              transition: "all 0.2s ease",
            }}
          />
          <span
            style={{
              display: "block",
              width: 18,
              height: 2,
              background: colors.primary,
              borderRadius: 2,
              transition: "all 0.2s ease",
            }}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="mobile-menu" role="dialog" aria-modal="true">
          <div className="mobile-menu-inner">
            <a
              className="nav-link"
              style={{
                color: colors.primary,
                fontSize: "16px",
                fontWeight: 600,
                padding: "12px 8px",
                borderBottom: `1px solid rgba(13,27,42,0.1)`,
              }}
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("hero");
              }}
            >
              Home
            </a>
            <a
              className="nav-link"
              style={{
                color: colors.primary,
                fontSize: "16px",
                fontWeight: 600,
                padding: "12px 8px",
                borderBottom: `1px solid rgba(13,27,42,0.1)`,
              }}
              href={`#${aboutId}`}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(aboutId);
              }}
            >
              About
            </a>
            <a
              className="nav-link"
              style={{
                color: colors.primary,
                fontSize: "16px",
                fontWeight: 600,
                padding: "12px 8px",
                borderBottom: `1px solid rgba(13,27,42,0.1)`,
              }}
              href={`#${servicesId}`}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(servicesId);
              }}
            >
              Services
            </a>
            <a
              className="nav-link"
              style={{
                color: colors.primary,
                fontSize: "16px",
                fontWeight: 600,
                padding: "12px 8px",
                borderBottom: `1px solid rgba(13,27,42,0.1)`,
              }}
              href="/for-business"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
                navigate("/for-business");
              }}
            >
              For Business
            </a>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginTop: 16,
                paddingTop: 16,
                borderTop: `2px solid ${colors.primary}`,
              }}
            >
              {!user ? (
                <>
                  <Button
                    variant="outlined"
                    color="neutral"
                    onClick={() => {
                      setOpen(false);
                      navigate("/login");
                    }}
                    sx={{
                      color: colors.primary,
                      borderColor: colors.primary,
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 10,
                      padding: "12px 20px",
                      fontSize: "16px",
                      "&:hover": {
                        backgroundColor: "rgba(10,27,71,0.05)",
                        borderColor: colors.primary,
                      },
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="solid"
                    onClick={() => {
                      setOpen(false);
                      navigate("/business-registration");
                    }}
                    sx={{
                      backgroundColor: colors.primary,
                      color: "#ffffff",
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: 10,
                      padding: "12px 20px",
                      fontSize: "16px",
                      boxShadow: "0 2px 8px rgba(10,27,71,0.2)",
                      "&:hover": {
                        backgroundColor: "#0a1a3d",
                        boxShadow: "0 4px 16px rgba(10,27,71,0.3)",
                      },
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    color="neutral"
                    onClick={() => {
                      setOpen(false);
                      navigate(profilePath);
                    }}
                    sx={{
                      textTransform: "none",
                      borderRadius: 10,
                      padding: "12px 20px",
                      fontSize: "16px",
                    }}
                  >
                    Profile
                  </Button>
                  <Button
                    variant="outlined"
                    color="neutral"
                    onClick={() => {
                      setOpen(false);
                      navigate(profilePath);
                    }}
                    sx={{
                      textTransform: "none",
                      borderRadius: 10,
                      padding: "12px 20px",
                      fontSize: "16px",
                    }}
                  >
                    Settings
                  </Button>
                  {isOwner && (
                    <Button
                      variant="outlined"
                      color="neutral"
                      onClick={() => {
                        setOpen(false);
                        navigate(statusPath);
                      }}
                      sx={{
                        textTransform: "none",
                        borderRadius: 10,
                        padding: "12px 20px",
                        fontSize: "16px",
                      }}
                    >
                      My Business
                    </Button>
                  )}
                  {isTourism && (
                    <Button
                      variant="outlined"
                      color="neutral"
                      onClick={() => {
                        setOpen(false);
                        navigate(statusPath);
                      }}
                      sx={{
                        textTransform: "none",
                        borderRadius: 10,
                        padding: "12px 20px",
                        fontSize: "16px",
                      }}
                    >
                      Admin Dashboard
                    </Button>
                  )}
                  {/* Mobile: My Business button for owners and staff (including custom roles) */}
                  {(isOwner || isStaff) && (
                    <Button
                      variant="outlined"
                      color="neutral"
                      onClick={() => {
                        setOpen(false);
                        if (role === "Business Owner") {
                          navigate("/business");
                        } else {
                          // Staff and custom roles go to dashboard
                          navigate("/business/dashboard");
                        }
                      }}
                      sx={{
                        textTransform: "none",
                        borderRadius: 10,
                        padding: "12px 20px",
                        fontSize: "16px",
                      }}
                    >
                      My Business
                    </Button>
                  )}
                  <Button
                    variant="solid"
                    color="danger"
                    onClick={() => {
                      setOpen(false);
                      logout();
                      navigate("/");
                    }}
                    sx={{
                      textTransform: "none",
                      borderRadius: 10,
                      padding: "12px 20px",
                      fontSize: "16px",
                    }}
                  >
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
