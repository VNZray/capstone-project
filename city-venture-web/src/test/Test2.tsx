import { Typography, Button } from "@mui/joy";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import { FaHeart } from "react-icons/fa";
import { colors } from "../utils/Colors";
import "./landing.css";

// Dummy data for gridItems and tileClassFor
const gridItems = [
  {
    src: new URL("../assets/gridimages/grid1.jpg", import.meta.url).href,
    title: "Naga Metropolitan Cathedral",
    subtitle: "Shrine of Our Lady of Peñafrancia",
  },
  {
    src: new URL("../assets/gridimages/grid2.jpg", import.meta.url).href,
    title: "Kinalas",
    subtitle: "Authentic Bicolano noodle soup",
  },
  {
    src: new URL("../assets/gridimages/grid3.jpg", import.meta.url).href,
    title: "Plaza Rizal & Heritage Village",
    subtitle: "Heart of historic Naga",
  },
  {
    src: new URL("../assets/gridimages/grid5.jpg", import.meta.url).href,
    title: "Peñafrancia Festival",
    subtitle: "Centuries of devotion",
  },
  {
    src: new URL("../assets/gridimages/grid6.jpg", import.meta.url).href,
    title: "Mt. Isarog Nature Reserve",
    subtitle: "Hike and relax",
  },
];


export const TestPage2 = () => {
  return (
    <>
      <TwoColumnLayout
        left={
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <div>
              <span className="hero-eyebrow">
                <FaHeart className="heart" aria-hidden="true" /> Explore Naga
                City
              </span>
              <Typography
                level="h1"
                fontSize="clamp(2rem, 4vw, 3rem)"
                fontWeight={800}
                textColor={colors.primary}
                sx={{ lineHeight: 1.1 }}
              >
                Begin your journey in the{" "}
                <span className="gradient-bicol">Heart of Bicol</span>
              </Typography>
              <div className="hero-quote">— Where Faith Meets Adventure</div>
              <Typography
                level="body-lg"
                fontSize="clamp(1rem, 1.5vw, 1.15rem)"
                textColor={colors.text}
                sx={{ maxWidth: 620, opacity: 0.9 }}
              >
                Iconic attractions, vibrant culture, and hidden gems — curated
                in one place. From the devotion of Peñafrancia to the flavors of
                kinalas and the trails of Mt. Isarog, experience the city’s
                spirit up close.
              </Typography>
              <div className="hero-actions">
                <Button
                  size="lg"
                  sx={{
                    borderRadius: 12,
                    px: 3,
                    color: "#fff",
                    background:
                      "linear-gradient(135deg, #FF6B6B 0%, #FF914D 50%, #28C76F 100%)",
                    boxShadow: "0 10px 26px rgba(0,0,0,0.12)",
                    border: "none",
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outlined"
                  color="neutral"
                  sx={{ borderRadius: 12, ml: 2 }}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        }
        right={
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <div className="attractions-grid">
              {gridItems.map((item, i) => (
                <button
                  key={`${item.title}-${i}`}
                  type="button"                  title={item.title}
                  aria-label={`${item.title} — ${item.subtitle}`}
                  style={{
                    background: "none",
                    border: 0,
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={item.src}
                    alt={item.title}
                    style={{
                      width: "100%",
                      borderRadius: 12,
                    }}
                  />
                  <div className="tile-label" aria-hidden>
                    <div className="tile-title">{item.title}</div>
                    <div className="tile-sub">{item.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        }
      />
    </>
  );
};
