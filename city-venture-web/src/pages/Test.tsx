import { Divider, Box } from "@mui/joy";
import Container from "../components/Container";
import PageContainer from "../components/PageContainer";
import ResponsiveButton from "../components/ResponsiveButton";
import IconButton from "../components/IconButton";
import ResponsiveText from "../components/ResponsiveText";
import { colors } from "../utils/Colors";
import {
  AddAPhoto,
  Delete,
  Edit,
  Close,
  Save,
  Favorite,
  Share,
  Search,
  Settings,
  Download,
  Upload,
  MoreVert,
  MoreHoriz,
} from "@mui/icons-material";

export const Test = (): React.JSX.Element => {
  const fontWeights = [
    "normal",
    "medium",
    "semi-bold",
    "bold",
    "bolder",
    "extra-bold",
    "black",
  ] as const;

  return (
    <PageContainer padding="40px 450px">
      <Container align="center" elevation={3} padding="20px">
        <ResponsiveText type="title-large" weight="bold">
          Test Page
        </ResponsiveText>
      </Container>

      {/* Font Weights Section */}
      <Container align="center" elevation={2} padding="20px">
        <ResponsiveText type="title-medium" weight="bold" mb={1.5}>
          Font Weights (All using body-large)
        </ResponsiveText>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {fontWeights.map((weight) => (
            <Box
              key={weight}
              sx={{ display: "flex", alignItems: "center", gap: 2 }}
            >
              <ResponsiveText
                type="label-small"
                style={{ minWidth: 100, color: "#666" }}
              >
                {weight}:
              </ResponsiveText>
              <ResponsiveText type="body-large" weight={weight}>
                The quick brown fox jumps over the lazy dog
              </ResponsiveText>
            </Box>
          ))}
        </Box>
      </Container>

      <Divider sx={{ my: 3 }} />

      {/* Title Sizes */}
      <Container align="center" elevation={2} padding="20px">
        <ResponsiveText type="title-medium" weight="bold" mb={1.5}>
          Title Sizes
        </ResponsiveText>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <ResponsiveText type="title-extra-large" weight="bold">
            title-extra-large (40px base)
          </ResponsiveText>
          <ResponsiveText type="title-large" weight="bold">
            title-large (32px base)
          </ResponsiveText>
          <ResponsiveText type="title-medium" weight="bold">
            title-medium (28px base)
          </ResponsiveText>
          <ResponsiveText type="title-normal" weight="bold">
            title-normal (26px base)
          </ResponsiveText>
          <ResponsiveText type="title-small" weight="bold">
            title-small (24px base)
          </ResponsiveText>
          <ResponsiveText type="title-extra-small" weight="bold">
            title-extra-small (20px base)
          </ResponsiveText>
        </Box>
      </Container>

      {/* Header Sizes */}
      <Container align="center" elevation={3} padding="20px">
        <ResponsiveText type="title-medium" weight="bold" mb={1.5}>
          Header Sizes
        </ResponsiveText>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <ResponsiveText type="header-extra-large" weight="semi-bold">
            header-extra-large (40px base)
          </ResponsiveText>
          <ResponsiveText type="header-large" weight="semi-bold">
            header-large (32px base)
          </ResponsiveText>
          <ResponsiveText type="header-medium" weight="semi-bold">
            header-medium (28px base)
          </ResponsiveText>
          <ResponsiveText type="header-normal" weight="semi-bold">
            header-normal (26px base)
          </ResponsiveText>
          <ResponsiveText type="header-small" weight="semi-bold">
            header-small (24px base)
          </ResponsiveText>
          <ResponsiveText type="header-extra-small" weight="semi-bold">
            header-extra-small (20px base)
          </ResponsiveText>
        </Box>
      </Container>

      {/* Sub-Title Sizes */}
      <Container align="center" elevation={3} padding="20px">
        <ResponsiveText type="title-medium" weight="bold" mb={1.5}>
          Sub-Title Sizes
        </ResponsiveText>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <ResponsiveText type="sub-title-extra-large" weight="medium">
            sub-title-extra-large (24px base)
          </ResponsiveText>
          <ResponsiveText type="sub-title-large" weight="medium">
            sub-title-large (22px base)
          </ResponsiveText>
          <ResponsiveText type="sub-title-medium" weight="medium">
            sub-title-medium (20px base)
          </ResponsiveText>
          <ResponsiveText type="sub-title-normal" weight="medium">
            sub-title-normal (19px base)
          </ResponsiveText>
          <ResponsiveText type="sub-title-small" weight="medium">
            sub-title-small (18px base)
          </ResponsiveText>
          <ResponsiveText type="sub-title-extra-small" weight="medium">
            sub-title-extra-small (16px base)
          </ResponsiveText>
        </Box>
      </Container>

      {/* Body Sizes */}
      <Container align="center" elevation={3} padding="20px">
        <ResponsiveText type="title-medium" weight="bold" mb={1.5}>
          Body Sizes
        </ResponsiveText>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <ResponsiveText type="body-extra-large">
            body-extra-large (20px base) - The quick brown fox jumps over the
            lazy dog
          </ResponsiveText>
          <ResponsiveText type="body-large">
            body-large (18px base) - The quick brown fox jumps over the lazy dog
          </ResponsiveText>
          <ResponsiveText type="body-medium">
            body-medium (16px base) - The quick brown fox jumps over the lazy
            dog
          </ResponsiveText>
          <ResponsiveText type="body-normal">
            body-normal (15px base) - The quick brown fox jumps over the lazy
            dog
          </ResponsiveText>
          <ResponsiveText type="body-small">
            body-small (14px base) - The quick brown fox jumps over the lazy dog
          </ResponsiveText>
          <ResponsiveText type="body-extra-small">
            body-extra-small (12px base) - The quick brown fox jumps over the
            lazy dog
          </ResponsiveText>
        </Box>
      </Container>

      {/* Card Title Sizes */}
      <Container align="center" elevation={3} padding="20px">
        <ResponsiveText type="title-medium" weight="bold" mb={1.5}>
          Card Title Sizes
        </ResponsiveText>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <ResponsiveText type="card-title-extra-large" weight="semi-bold">
            card-title-extra-large (22px base)
          </ResponsiveText>
          <ResponsiveText type="card-title-large" weight="semi-bold">
            card-title-large (20px base)
          </ResponsiveText>
          <ResponsiveText type="card-title-medium" weight="semi-bold">
            card-title-medium (18px base)
          </ResponsiveText>
          <ResponsiveText type="card-title-normal" weight="semi-bold">
            card-title-normal (17px base)
          </ResponsiveText>
          <ResponsiveText type="card-title-small" weight="semi-bold">
            card-title-small (16px base)
          </ResponsiveText>
          <ResponsiveText type="card-title-extra-small" weight="semi-bold">
            card-title-extra-small (14px base)
          </ResponsiveText>
        </Box>
      </Container>

      {/* Card Sub-Title Sizes */}
      <Container align="center" elevation={3} padding="20px">
        <ResponsiveText type="title-medium" weight="bold" mb={1.5}>
          Card Sub-Title Sizes
        </ResponsiveText>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <ResponsiveText type="card-sub-title-extra-large">
            card-sub-title-extra-large (18px base)
          </ResponsiveText>
          <ResponsiveText type="card-sub-title-large">
            card-sub-title-large (16px base)
          </ResponsiveText>
          <ResponsiveText type="card-sub-title-medium">
            card-sub-title-medium (14px base)
          </ResponsiveText>
          <ResponsiveText type="card-sub-title-normal">
            card-sub-title-normal (13px base)
          </ResponsiveText>
          <ResponsiveText type="card-sub-title-small">
            card-sub-title-small (12px base)
          </ResponsiveText>
          <ResponsiveText type="card-sub-title-extra-small">
            card-sub-title-extra-small (10px base)
          </ResponsiveText>
        </Box>
      </Container>

      {/* Label Sizes */}
      <Container align="center" elevation={3} padding="20px">
        <ResponsiveText type="title-medium" weight="bold" mb={1.5}>
          Label Sizes
        </ResponsiveText>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <ResponsiveText type="label-extra-large" weight="medium">
            label-extra-large (18px base)
          </ResponsiveText>
          <ResponsiveText type="label-large" weight="medium">
            label-large (16px base)
          </ResponsiveText>
          <ResponsiveText type="label-medium" weight="medium">
            label-medium (14px base)
          </ResponsiveText>
          <ResponsiveText type="label-normal" weight="medium">
            label-normal (13px base)
          </ResponsiveText>
          <ResponsiveText type="label-small" weight="medium">
            label-small (12px base)
          </ResponsiveText>
          <ResponsiveText type="label-extra-small" weight="medium">
            label-extra-small (10px base)
          </ResponsiveText>
        </Box>
      </Container>

      {/* Link Sizes */}
      <Container align="center" elevation={3} padding="20px">
        <ResponsiveText type="title-medium" weight="bold" mb={1.5}>
          Link Sizes
        </ResponsiveText>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <ResponsiveText type="link-extra-large">
            link-extra-large (20px base) - Click here
          </ResponsiveText>
          <ResponsiveText type="link-large">
            link-large (18px base) - Click here
          </ResponsiveText>
          <ResponsiveText type="link-medium">
            link-medium (16px base) - Click here
          </ResponsiveText>
          <ResponsiveText type="link-normal">
            link-normal (15px base) - Click here
          </ResponsiveText>
          <ResponsiveText type="link-small">
            link-small (14px base) - Click here
          </ResponsiveText>
          <ResponsiveText type="link-extra-small">
            link-extra-small (12px base) - Click here
          </ResponsiveText>
        </Box>
      </Container>

      <Divider sx={{ my: 3 }} />

      {/* ===== RESPONSIVE BUTTON SHOWCASE ===== */}
      <Container align="center" elevation={2} padding="20px">
        <ResponsiveText type="title-medium" weight="bold" mb={2}>
          ResponsiveButton - All Variants
        </ResponsiveText>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <ResponsiveButton variant="solid" color="primary">
            Solid
          </ResponsiveButton>
          <ResponsiveButton variant="outlined" color="primary">
            Outlined
          </ResponsiveButton>
          <ResponsiveButton variant="soft" color="primary">
            Soft
          </ResponsiveButton>
          <ResponsiveButton variant="plain" color="primary">
            Plain
          </ResponsiveButton>
        </Box>
      </Container>

      {/* All Colors */}
      <Container align="center" elevation={2} padding="20px">
        <ResponsiveText type="title-medium" weight="bold" mb={2}>
          All Colors (Solid Variant)
        </ResponsiveText>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <ResponsiveButton variant="solid" color="primary">
            Primary
          </ResponsiveButton>
          <ResponsiveButton variant="solid" color="secondary">
            Secondary
          </ResponsiveButton>
          <ResponsiveButton variant="solid" color="gray">
            Gray
          </ResponsiveButton>
          <ResponsiveButton variant="solid" color="success">
            Success
          </ResponsiveButton>
          <ResponsiveButton variant="solid" color="warningBackground">
            Warning
          </ResponsiveButton>
          <ResponsiveButton variant="solid" color="error">
            Error
          </ResponsiveButton>
          <ResponsiveButton variant="solid" color="orange">
            Orange
          </ResponsiveButton>
        </Box>
      </Container>

      {/* All Sizes */}
      <Container align="center" elevation={2} padding="20px">
        <ResponsiveText type="title-medium" weight="bold" mb={2}>
          All Sizes
        </ResponsiveText>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ResponsiveButton size="xs" variant="solid">
            XSmall
          </ResponsiveButton>
          <ResponsiveButton size="sm" variant="solid">
            Small
          </ResponsiveButton>
          <ResponsiveButton size="md" variant="solid">
            Medium
          </ResponsiveButton>
          <ResponsiveButton size="lg" variant="solid">
            Large
          </ResponsiveButton>
          <ResponsiveButton size="xl" variant="solid">
            XLarge
          </ResponsiveButton>
        </Box>
      </Container>

      {/* All Hover Effects */}
      <Container align="center" elevation={2} padding="20px">
        <ResponsiveText type="title-medium" weight="bold" mb={2}>
          All Hover Effects
        </ResponsiveText>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <ResponsiveButton variant="solid" hoverEffect="lift">
            Lift
          </ResponsiveButton>
          <ResponsiveButton variant="solid" hoverEffect="scale">
            Scale
          </ResponsiveButton>
          <ResponsiveButton variant="solid" hoverEffect="glow">
            Glow
          </ResponsiveButton>
          <ResponsiveButton variant="solid" hoverEffect="shadow-expand">
            Shadow Expand
          </ResponsiveButton>
        </Box>
      </Container>

      {/* With Icons */}
      <Container align="center" elevation={2} padding="20px">
        <ResponsiveText type="title-medium" weight="bold" mb={2}>
          Buttons with Icons
        </ResponsiveText>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <ResponsiveButton
            variant="solid"
            color="primary"
            startIcon={<AddAPhoto />}
          >
            Add Photo
          </ResponsiveButton>
          <ResponsiveButton
            variant="outlined"
            color="success"
            startIcon={<Save />}
          >
            Save
          </ResponsiveButton>
          <ResponsiveButton variant="soft" color="error" startIcon={<Delete />}>
            Delete
          </ResponsiveButton>
          <ResponsiveButton
            variant="plain"
            color="secondary"
            endIcon={<Download />}
          >
            Download
          </ResponsiveButton>
          <ResponsiveButton
            variant="solid"
            color="orange"
            startIcon={<Upload />}
            endIcon={<Share />}
          >
            Upload & Share
          </ResponsiveButton>
        </Box>
      </Container>

      {/* Button States */}
      <Container align="center" elevation={2} padding="20px">
        <ResponsiveText type="title-medium" weight="bold" mb={2}>
          Button States
        </ResponsiveText>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <ResponsiveButton variant="solid">Default</ResponsiveButton>
          <ResponsiveButton variant="solid" loading>
            Loading
          </ResponsiveButton>
          <ResponsiveButton variant="solid" disabled>
            Disabled
          </ResponsiveButton>
        </Box>
      </Container>

      {/* Special Features */}
      <Container align="center" elevation={2} padding="20px">
        <ResponsiveText type="title-medium" weight="bold" mb={2}>
          Special Features
        </ResponsiveText>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <ResponsiveButton variant="solid" gradient>
              With Gradient
            </ResponsiveButton>
            <ResponsiveButton
              variant="solid"
              fullWidth
              style={{ maxWidth: "300px" }}
            >
              Full Width Button
            </ResponsiveButton>
          </Box>
        </Box>
      </Container>

      <Divider sx={{ my: 3 }} />

      {/* ===== ICON BUTTON SHOWCASE ===== */}
      <Container align="center" elevation={2} padding="20px">
        <ResponsiveText type="title-medium" weight="bold" mb={2}>
          IconButton - All Variants
        </ResponsiveText>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <IconButton
            icon={<Edit />}
            variant="solid"
            color="primary"
            ariaLabel="Edit"
          />
          <IconButton
            icon={<Delete />}
            variant="outlined"
            color="primary"
            ariaLabel="Delete"
          />
          <IconButton
            icon={<Favorite />}
            variant="soft"
            color="primary"
            ariaLabel="Like"
          />
          <IconButton
            icon={<Share />}
            variant="plain"
            color="primary"
            ariaLabel="Share"
          />
        </Box>
      </Container>

      {/* Icon Button - All Colors */}
      <Container align="center" elevation={2} padding="20px">
        <ResponsiveText type="title-medium" weight="bold" mb={2}>
          IconButton - All Colors (Solid Variant)
        </ResponsiveText>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <IconButton
            icon={<Settings />}
            variant="solid"
            color="primary"
            ariaLabel="Settings"
          />
          <IconButton
            icon={<Settings />}
            variant="solid"
            color="secondary"
            ariaLabel="Settings"
          />
          <IconButton
            icon={<Settings />}
            variant="solid"
            color="gray"
            ariaLabel="Settings"
          />
          <IconButton
            icon={<Settings />}
            variant="solid"
            color="success"
            ariaLabel="Settings"
          />
          <IconButton
            icon={<Settings />}
            variant="solid"
            color="warningBackground"
            ariaLabel="Settings"
          />
          <IconButton
            icon={<Settings />}
            variant="solid"
            color="error"
            ariaLabel="Settings"
          />
          <IconButton
            icon={<Settings />}
            variant="solid"
            color="orange"
            ariaLabel="Settings"
          />
        </Box>
      </Container>

      {/* Icon Button - All Sizes */}
      <Container align="center" elevation={2} padding="20px">
        <ResponsiveText type="title-medium" weight="bold" mb={2}>
          IconButton - All Sizes (Square)
        </ResponsiveText>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <IconButton
            icon={<Search />}
            size="xs"
            variant="solid"
            color="primary"
            ariaLabel="Search"
          />
          <IconButton
            icon={<Search />}
            size="sm"
            variant="solid"
            color="primary"
            ariaLabel="Search"
          />
          <IconButton
            icon={<Search />}
            size="md"
            variant="solid"
            color="primary"
            ariaLabel="Search"
          />
          <IconButton
            icon={<Search />}
            size="lg"
            variant="solid"
            color="primary"
            ariaLabel="Search"
          />
          <IconButton
            icon={<Search />}
            size="xl"
            variant="solid"
            color="primary"
            ariaLabel="Search"
          />
        </Box>
      </Container>

      {/* Icon Button - Rounded */}
      <Container align="center" elevation={2} padding="20px">
        <ResponsiveText type="title-medium" weight="bold" mb={2}>
          IconButton - All Sizes (Rounded/Circular)
        </ResponsiveText>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <IconButton
            icon={<Close />}
            size="xs"
            isRounded={true}
            variant="solid"
            color="primary"
            ariaLabel="Close"
          />
          <IconButton
            icon={<Close />}
            size="sm"
            isRounded={true}
            variant="solid"
            color="primary"
            ariaLabel="Close"
          />
          <IconButton
            icon={<Close />}
            size="md"
            isRounded={true}
            variant="solid"
            color="primary"
            ariaLabel="Close"
          />
          <IconButton
            icon={<Close />}
            size="lg"
            isRounded={true}
            variant="solid"
            color="primary"
            ariaLabel="Close"
          />
          <IconButton
            icon={<Close />}
            size="xl"
            isRounded={true}
            variant="solid"
            color="primary"
            ariaLabel="Close"
          />
        </Box>
      </Container>

      {/* Icon Button - All Hover Effects */}
      <Container align="center" elevation={2} padding="20px">
        <ResponsiveText type="title-medium" weight="bold" mb={2}>
          IconButton - All Hover Effects
        </ResponsiveText>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <IconButton
            icon={<Edit />}
            variant="solid"
            color="primary"
            hoverEffect="lift"
            ariaLabel="Edit with lift"
          />
          <IconButton
            icon={<Delete />}
            variant="solid"
            color="error"
            hoverEffect="scale"
            ariaLabel="Delete with scale"
          />
          <IconButton
            icon={<Favorite />}
            variant="solid"
            color="orange"
            hoverEffect="glow"
            ariaLabel="Like with glow"
          />
          <IconButton
            icon={<Share />}
            variant="solid"
            color="secondary"
            hoverEffect="shadow-expand"
            ariaLabel="Share with shadow"
          />
        </Box>
      </Container>

      {/* Icon Button - States */}
      <Container align="center" elevation={2} padding="20px">
        <ResponsiveText type="title-medium" weight="bold" mb={2}>
          IconButton - States
        </ResponsiveText>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <IconButton
            icon={<Save />}
            variant="solid"
            color="success"
            ariaLabel="Save"
          />
          <IconButton
            icon={<Save />}
            variant="solid"
            color="success"
            loading
            ariaLabel="Saving"
          />
          <IconButton
            icon={<Save />}
            variant="solid"
            color="success"
            disabled
            ariaLabel="Save disabled"
          />
        </Box>
      </Container>

      {/* Icon Button - Mixed Variants & Colors */}
      <Container align="center" elevation={2} padding="20px">
        <ResponsiveText type="title-medium" weight="bold" mb={2}>
          IconButton - Mixed Variants & Colors
        </ResponsiveText>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <IconButton
            icon={<AddAPhoto />}
            variant="solid"
            color="primary"
            size="lg"
            hoverEffect="lift"
            ariaLabel="Add photo"
          />
          <IconButton
            icon={<Edit />}
            variant="outlined"
            color="secondary"
            size="lg"
            isRounded={true}
            hoverEffect="glow"
            ariaLabel="Edit"
          />
          <IconButton
            icon={<Delete />}
            variant="soft"
            color="error"
            size="lg"
            hoverEffect="scale"
            ariaLabel="Delete"
          />
          <IconButton
            icon={<MoreVert />}
            variant="plain"
            color="gray"
            size="lg"
            hoverEffect="shadow-expand"
            ariaLabel="More options"
          />
          <IconButton
            icon={<MoreHoriz />}
            variant="solid"
            color="orange"
            size="lg"
            isRounded={true}
            hoverEffect="lift"
            ariaLabel="More options"
          />
        </Box>
      </Container>

      <Divider sx={{ my: 3 }} />

      <Container direction="column" gap="40px">
        <Container
          hover={true}
          hoverEffect="shadow-expand"
          hoverDuration={300}
          cursor="pointer"
          background={colors.primary}
        >
          <ResponsiveText>Container 1</ResponsiveText>
        </Container>
        <Container
          hover={true}
          hoverEffect="shadow-expand"
          hoverDuration={300}
          cursor="pointer"
          background={colors.warningBackground}
        >
          <ResponsiveText>Container 2</ResponsiveText>
        </Container>
        <Container
          hover={true}
          hoverEffect="shadow-expand"
          hoverDuration={300}
          cursor="pointer"
          background={colors.red}
          elevation={3}
        >
          {" "}
          <ResponsiveText>Container 3</ResponsiveText>
        </Container>
        <Container
          hover={true}
          hoverEffect="shadow-expand"
          hoverDuration={300}
          cursor="pointer"
          background={colors.secondary}
          elevation={4}
        >
          {" "}
          <ResponsiveText>Container 4</ResponsiveText>
        </Container>
        <Container
          hover={true}
          hoverEffect="shadow-expand"
          hoverDuration={300}
          cursor="pointer"
          background={colors.success}
          elevation={5}
        >
          {" "}
          <ResponsiveText>Container 5</ResponsiveText>
        </Container>
        <Container
          hover={true}
          hoverEffect="shadow-expand"
          hoverDuration={300}
          cursor="pointer"
          elevation={6}
          background={colors.orange}
        >
          {" "}
          <ResponsiveText>Container 6</ResponsiveText>
        </Container>

        <Container
          hover={true}
          hoverEffect="lift"
          hoverDuration={300}
          cursor="pointer"
          elevation={2}
        >
          {" "}
          <ResponsiveText>Container 7</ResponsiveText>
        </Container>
      </Container>

      <Divider sx={{ my: 3 }} />
    </PageContainer>
  );
};
