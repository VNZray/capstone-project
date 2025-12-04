import { useEffect, useState } from "react";
import "./style/landing.css";
import Loading from "@/src/components/ui/Loading";
import HeroSection from "./components/HeroSection";
import WhyVisitSection from "./components/WhyVisitSection";
import SocialProofSection from "./components/SocialProofSection";
import BenefitsSection from "./components/BenefitsSection";
import HowItWorksSection from "./components/HowItWorksSection";
import FooterSection from "./components/FooterSection";
import PageContainer from "@/src/components/PageContainer";
import grid1 from "@/src/assets/gridimages/grid1.jpg";
import grid2 from "@/src/assets/gridimages/grid2.jpg";
import grid3 from "@/src/assets/gridimages/grid3.jpg";
import grid5 from "@/src/assets/gridimages/grid5.jpg";
import grid6 from "@/src/assets/gridimages/grid6.jpg";
import FeaturesSection from "./components/FeaturesSection";

export default function LandingPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Simulate loading time for assets
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loading variant="default" showProgress />;
  }

  const logoImage = new URL("../assets/images/logo.png", import.meta.url).href;

  const gridItems = [
    {
      src: grid1,
      title: "Naga Metropolitan Cathedral",
      subtitle: "Shrine of Our Lady of Peñafrancia",
    },
    {
      src: grid2,
      title: "Kunalao",
      subtitle: "Mountain Adventures Await",
    },
    {
      src: grid3,
      title: "Plaza Rizal & Heritage Village",
      subtitle: "Heart of historic Naga",
    },
    {
      src: grid5,
      title: "Peñafrancia Festival",
      subtitle: "Centuries of devotion",
    },
    {
      src: grid6,
      title: "Mt. Isarog Nature Reserve",
      subtitle: "Hike and relax",
    },
  ];

  return (
    <PageContainer gap={0} padding={0} id="top">
      {/* 1. Hero Section - Above the Fold */}
      <HeroSection gridItems={gridItems} />

      {/* 2. Why Visit Section - Tourism Promotion */}
      <WhyVisitSection />
      <FeaturesSection />

      {/* 5. Social Proof & Trust */}
      <SocialProofSection />

      {/* Additional Sections */}
      <BenefitsSection />
      <HowItWorksSection />

      {/* Footer */}
      <FooterSection logoImage={logoImage} />
    </PageContainer>
  );
}
