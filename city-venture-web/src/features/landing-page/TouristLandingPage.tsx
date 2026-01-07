import { useEffect } from "react";
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
 * Tourist Landing Page
 * The main entry point for tourists visiting City Venture.
 * This page showcases Naga City's attractions, experiences, and guides
 * tourists to explore the platform's offerings.
 */
export default function TouristLandingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageContainer gap={0} padding={0} id="top" style={{ overflowX: "hidden" }}>
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
