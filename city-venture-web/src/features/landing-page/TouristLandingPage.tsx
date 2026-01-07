import { useEffect } from "react";
import { motion, useScroll, useSpring, useReducedMotion } from "motion/react";
import "./style/landing.css";
import PageContainer from "@/src/components/PageContainer";
import TouristHeroSection from "./components/TouristHeroSection";
import TouristMarqueeSection from "./components/TouristMarqueeSection";
import TouristIntroSection from "./components/TouristIntroSection";
import TouristExperiencesSection from "./components/TouristExperiencesSection";
import TouristGastronomySection from "./components/TouristGastronomySection";
import TouristEventsSection from "./components/TouristEventsSection";
import TouristAppDownloadSection from "./components/TouristAppDownloadSection";
import FooterSection from "./components/FooterSection";
import Navbar from "./components/Navbar";

/**
 * ScrollProgressBar Component
 * A fixed progress indicator that shows scroll position
 */
const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: "linear-gradient(90deg, #C5A059, #FFD700)",
        transformOrigin: "0%",
        scaleX,
        zIndex: 9999,
      }}
    />
  );
};

/**
 * Tourist Landing Page
 * The main entry point for tourists visiting City Venture.
 * This page showcases Naga City's attractions, experiences, and guides
 * tourists to explore the platform's offerings.
 * 
 * Performance optimizations:
 * - Smooth scroll progress indicator
 * - Reduced motion support for accessibility
 * - GPU-accelerated animations throughout
 */
export default function TouristLandingPage() {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageContainer gap={0} padding={0} id="top" style={{ overflowX: "hidden" }}>
      {/* Scroll Progress Indicator - hidden if reduced motion preferred */}
      {!shouldReduceMotion && <ScrollProgressBar />}

      {/* Navbar - Seamless transparent mode for hero overlay with tourist mode */}
      <Navbar seamless touristMode />

      {/* Hero Section with Parallax Effect */}
      <TouristHeroSection />

      {/* Marquee Section */}
      <TouristMarqueeSection />

      {/* Intro / Manifesto Section */}
      <TouristIntroSection />

      {/* Curated Experiences Section */}
      <TouristExperiencesSection />

      {/* Gastronomy Section */}
      <TouristGastronomySection />

      {/* Upcoming Events Section */}
      <TouristEventsSection />

      {/* App Download Section */}
      <TouristAppDownloadSection />

      {/* Footer */}
      <FooterSection />
    </PageContainer>
  );
}
