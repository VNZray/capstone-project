import PageContainer from "../components/PageContainer";
import Typography from "../components/Typography";
import Section from "../components/ui/Section";
import { section } from "../utils/Colors";

const PageShowcase = () => {
  return (
    <PageContainer gap={0}>
      <Section
        background={section.bg1}
        style={{ padding: "clamp(24px, 6vw, 48px)" }}
      >
        <Typography.Title sx={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)" }}>
          This is a Section with a custom background color 1.
        </Typography.Title>
      </Section>
      <Section
        background={section.bg2}
        style={{ padding: "clamp(24px, 6vw, 48px)" }}
      >
        <Typography.Title sx={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)" }}>
          This is a Section with a custom background color 2.
        </Typography.Title>
      </Section>
      <Section
        background={section.bg3}
        style={{ padding: "clamp(24px, 6vw, 48px)" }}
      >
        <Typography.Title sx={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)" }}>
          This is a Section with a custom background color 3.
        </Typography.Title>
      </Section>
      <Section
        background={section.bg4}
        style={{ padding: "clamp(24px, 6vw, 48px)" }}
      >
        <Typography.Title sx={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)" }}>
          This is a Section with a custom background color 4.
        </Typography.Title>
      </Section>
    </PageContainer>
  );
};

export default PageShowcase;
