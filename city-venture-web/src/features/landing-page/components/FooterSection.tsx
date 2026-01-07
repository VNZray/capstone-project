import React from "react";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import IconButton from "@/src/components/IconButton";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaEnvelope,
  FaPhone,
  FaBuilding,
} from "react-icons/fa";
import { colors } from "@/src/utils/Colors";
import logo from "@/src/assets/logo/city-ventures-main.png";

interface FooterSectionProps {
  logoImage?: string;
}

const FooterSection: React.FC<FooterSectionProps> = () => {
  const footerColumns = [
    {
      title: "For Tourists",
      links: [
        { label: "Explore", href: "#" },
        { label: "Download App", href: "#" },
        { label: "Popular Attractions", href: "#" },
        { label: "Local Events", href: "#" },
        { label: "Travel Guide", href: "#" },
        { label: "FAQ for Tourists", href: "#" },
      ],
    },
    {
      title: "Partner With Us",
      links: [
        { label: "Business Registration", href: "/business/signup" },
        { label: "Tourist/Admin Login", href: "/login" },
        { label: "Partner Portal Login", href: "/business/login" },
        { label: "Business Resources", href: "#" },
        { label: "Pricing/Plans", href: "#" },
        { label: "FAQ for Businesses", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About City Venture", href: "#about" },
        { label: "How It Works", href: "#how-it-works" },
        { label: "Blog/News", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Press Kit", href: "#" },
      ],
    },
    {
      title: "Help & Legal",
      links: [
        { label: "Help Center", href: "#" },
        { label: "Contact Support", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Privacy Policy", href: "#" },
        { label: "Cookie Policy", href: "#" },
      ],
    },
  ];

  const contactInfo = [
    {
      icon: <FaEnvelope />,
      text: "hello@cityventure.io",
      href: "mailto:hello@cityventure.io",
    },
    { icon: <FaPhone />, text: "+1 (234) 567-890", href: "tel:+1234567890" },
    { icon: <FaBuilding />, text: "Naga City, Philippines", href: null },
  ];

  const socialLinks = [
    { icon: <FaFacebook />, label: "Facebook", href: "#" },
    { icon: <FaInstagram />, label: "Instagram", href: "#" },
    { icon: <FaTwitter />, label: "Twitter", href: "#" },
  ];

  return (
    <footer
      style={{
        backgroundColor: colors.primary,
        padding: "60px 16px 0",
      }}
    >
      <Container
        padding="0"
        gap="40px"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
        }}
        background={colors.primary}
      >
        {/* Main Footer Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 40,
            backgroundColor: colors.primary,
          }}
        >
          {/* Brand Column */}
          <Container background={colors.primary} padding="0" gap="16px">
            <Container
              background={colors.primary}
              direction="row"
              align="center"
              gap="10px"
              padding="0"
            >
              <Typography.CardTitle
                startDecorator={
                  <img
                    src={logo}
                    alt="City Venture logo"
                    style={{ height: 32 }}
                  />
                }
                size="sm"
              >
                City Venture
              </Typography.CardTitle>
            </Container>

            <Typography.Body size="xs" sx={{ opacity: 0.9 }}>
              Your Gateway to Naga
            </Typography.Body>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {contactInfo.map((contact, index) => (
                <li
                  key={index}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  {contact.icon}
                  {contact.href ? (
                    <a
                      href={contact.href}
                      style={{
                        color: "rgba(255, 255, 255, 0.8)",
                        textDecoration: "none",
                        fontSize: 14,
                      }}
                    >
                      {contact.text}
                    </a>
                  ) : (
                    <a
                      href={undefined}
                      style={{
                        color: "rgba(255, 255, 255, 0.8)",
                        textDecoration: "none",
                        fontSize: 14,
                      }}
                    >
                      {contact.text}
                    </a>
                  )}
                </li>
              ))}
            </ul>

            <Container
              background={colors.primary}
              direction="row"
              gap="12px"
              padding="0"
            >
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  variant="soft"
                  colorScheme="white"
                  aria-label={social.label}
                  onClick={() => window.open(social.href, "_blank")}
                  sx={{
                    background: "rgba(255, 255, 255, 0.1)",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.2)",
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Container>
          </Container>

          {/* Footer Columns */}
          {footerColumns.map((column, index) => (
            <Container
              background={colors.primary}
              key={index}
              padding="0"
              gap="16px"
            >
              <Typography.Label>{column.title}</Typography.Label>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      style={{
                        color: "rgba(255, 255, 255, 0.8)",
                        textDecoration: "none",
                        fontSize: 14,
                        transition: "color 150ms ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#fff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color =
                          "rgba(255, 255, 255, 0.8)")
                      }
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </Container>
          ))}
        </div>

        {/* Bottom Bar */}
        <Container
          direction="row"
          justify="space-between"
          align="center"
          padding="24px 0"
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            flexWrap: "wrap",
            gap: 20,
          }}
          background={colors.primary}
        >
          <Container
            direction="row"
            gap="16px"
            padding="0"
            style={{ flexWrap: "wrap" }}
            background={colors.primary}
          >
            <Typography.Body
              size="xs"
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              © {new Date().getFullYear()} City Venture
            </Typography.Body>
            <Typography.Body
              size="xs"
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              Made with ❤️ in Naga
            </Typography.Body>
          </Container>

          <div className="store-buttons">
            <button
              type="button"
              className="store-btn app-store"
              title="Download on the App Store"
              aria-label="Download on the App Store"
            >
              <span className="store-badge"></span>
              <span className="store-text">
                <strong>App Store</strong>
                <small>Coming soon</small>
              </span>
            </button>
            <button
              type="button"
              className="store-btn play-store"
              title="Get it on Google Play"
              aria-label="Get it on Google Play"
            >
              <span className="store-badge">▶</span>
              <span className="store-text">
                <strong>Google Play</strong>
                <small>Coming soon</small>
              </span>
            </button>
          </div>
        </Container>
      </Container>
    </footer>
  );
};

export default FooterSection;
