import PageContainer from "../components/PageContainer";
import Typography from "../components/Typography";
import Section from "../components/ui/Section";
import { section } from "../utils/Colors";

const PageShowcase = () => {
  return (
    <PageContainer gap={0}>
      <Section background={section.bg1}>
        <Typography.Title>
          This is a Section with a custom background color 1.
        </Typography.Title>
      </Section>
      <Section background={section.bg2}>
        <Typography.Title>
          This is a Section with a custom background color 2.
        </Typography.Title>
      </Section>
      <Section background={section.bg3}>
        <Typography.Title>
          This is a Section with a custom background color 3.
        </Typography.Title>
      </Section>
      <Section background={section.bg4}>
        <Typography.Title>
          This is a Section with a custom background color 4.
        </Typography.Title>
      </Section>
    </PageContainer>
  );
};

export default PageShowcase;
