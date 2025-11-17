import { useEffect, useState } from "react";
import "./style/landing.css";
import Loading from "@/src/components/ui/Loading";
import HeroSection from "./components/HeroSection";
import ValuePropositionSection from "./components/ValuePropositionSection";
import BenefitsSection from "./components/BenefitsSection";
import FeaturesSection from "./components/FeaturesSection";
import HowItWorksSection from "./components/HowItWorksSection";
import FooterSection from "./components/FooterSection";
import PageContainer from "@/src/components/PageContainer";

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
    return <Loading variant="splash" showProgress />;
  }

  const logoImage = new URL("../assets/images/logo.png", import.meta.url).href;


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

  return (
    <PageContainer padding={0}>
      <main className="landing-zoom" id="top">
        <HeroSection gridItems={gridItems} />
        <ValuePropositionSection />
        <BenefitsSection />
        <FeaturesSection />
        <HowItWorksSection />
      </main>
      <FooterSection logoImage={logoImage} />
    </PageContainer>
  );
}
