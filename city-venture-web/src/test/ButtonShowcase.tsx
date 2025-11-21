import Button from "../components/Button";
import IconButton from "../components/IconButton";
import { Box, Divider } from "@mui/joy";
import {
  AddAPhoto,
  Delete,
  Edit,
  Settings,
  Save,
  CheckCircle,
  Warning,
  Info,
} from "@mui/icons-material";
import Typography from "../components/Typography";

const ButtonShowcase = () => {
  return (
    <Box sx={{ p: 4, maxWidth: 1000, mx: "auto" }}>
      <Typography.Title weight="bold" color="primary">
        Custom City Venture UI Button & IconButton Showcase
      </Typography.Title>
      <Divider sx={{ my: { xs: 2, sm: 3 } }} />

      {/* ============== SOLID VARIANT ============== */}
      <Box sx={{ marginBottom: { xs: "40px", md: "60px" } }}>
        <Typography.Header color="secondary" weight="bold">
          Solid Variant
        </Typography.Header>

        {/* All Colors */}
        <Box sx={{ marginBottom: { xs: "20px", md: "30px" } }}>
          <Typography.Body sx={{ marginBottom: "12px" }}>
            All Color Schemes
          </Typography.Body>
          <Box sx={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Button variant="solid" colorScheme="primary">
              Primary
            </Button>
            <Button variant="solid" colorScheme="secondary">
              Secondary
            </Button>
            <Button variant="solid" colorScheme="success">
              Success
            </Button>
            <Button variant="solid" colorScheme="error">
              Error
            </Button>
            <Button variant="solid" colorScheme="warningLabel">
              Warning
            </Button>
            <Button variant="solid" colorScheme="orange">
              Orange
            </Button>
            <Button variant="solid" colorScheme="yellow">
              Yellow
            </Button>
            <Button variant="solid" colorScheme="gray">
              Gray
            </Button>
          </Box>
        </Box>

        {/* With Icons */}
        <Box sx={{ marginBottom: "30px" }}>
          <Typography.Body sx={{ marginBottom: "12px" }}>
            With Start Decorator (Icon)
          </Typography.Body>
          <Box sx={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Button
              variant="solid"
              colorScheme="primary"
              startDecorator={<AddAPhoto />}
            >
              Upload
            </Button>
            <Button
              variant="solid"
              colorScheme="secondary"
              startDecorator={<Edit />}
            >
              Edit
            </Button>
            <Button
              variant="solid"
              colorScheme="success"
              startDecorator={<CheckCircle />}
            >
              Save
            </Button>
            <Button
              variant="solid"
              colorScheme="error"
              startDecorator={<Delete />}
            >
              Delete
            </Button>
          </Box>
        </Box>

        {/* With End Decorator */}
        <Box sx={{ marginBottom: "30px" }}>
          <Typography.Body sx={{ marginBottom: "12px" }}>
            With End Decorator (Icon)
          </Typography.Body>
          <Box sx={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Button
              variant="solid"
              colorScheme="primary"
              endDecorator={<Settings />}
            >
              Settings
            </Button>
            <Button
              variant="solid"
              colorScheme="secondary"
              endDecorator={<Save />}
            >
              Confirm
            </Button>
            <Button
              variant="solid"
              colorScheme="warningLabel"
              endDecorator={<Warning />}
            >
              Warning
            </Button>
          </Box>
        </Box>

        {/* Size Variants */}
        <Box>
          <Typography.Body sx={{ marginBottom: "12px" }}>
            Size Variants
          </Typography.Body>
          <Box
            sx={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Button variant="solid" colorScheme="primary" size="sm">
              Small
            </Button>
            <Button variant="solid" colorScheme="primary" size="md">
              Medium
            </Button>
            <Button variant="solid" colorScheme="primary" size="lg">
              Large
            </Button>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ marginBottom: "60px" }} />

      {/* ============== OUTLINED VARIANT ============== */}
      <Box sx={{ marginBottom: "60px" }}>
        <Typography.Header color="secondary" weight="bold">
          Outlined Variant
        </Typography.Header>

        {/* All Colors */}
        <Box sx={{ marginBottom: "30px" }}>
          <Typography.Body sx={{ marginBottom: "12px" }}>
            All Color Schemes
          </Typography.Body>
          <Box sx={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Button variant="outlined" colorScheme="primary">
              Primary
            </Button>
            <Button variant="outlined" colorScheme="secondary">
              Secondary
            </Button>
            <Button variant="outlined" colorScheme="success">
              Success
            </Button>
            <Button variant="outlined" colorScheme="error">
              Error
            </Button>
            <Button variant="outlined" colorScheme="warningLabel">
              Warning
            </Button>
            <Button variant="outlined" colorScheme="orange">
              Orange
            </Button>
            <Button variant="outlined" colorScheme="yellow">
              Yellow
            </Button>
            <Button variant="outlined" colorScheme="gray">
              Gray
            </Button>
          </Box>
        </Box>

        {/* With Icons */}
        <Box sx={{ marginBottom: "30px" }}>
          <Typography.Body sx={{ marginBottom: "12px" }}>
            With Icons
          </Typography.Body>
          <Box sx={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              colorScheme="primary"
              startDecorator={<AddAPhoto />}
            >
              Upload
            </Button>
            <Button
              variant="outlined"
              colorScheme="secondary"
              startDecorator={<Edit />}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              colorScheme="success"
              startDecorator={<CheckCircle />}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              colorScheme="error"
              startDecorator={<Delete />}
            >
              Delete
            </Button>
          </Box>
        </Box>

        {/* Size Variants */}
        <Box>
          <Typography.Body sx={{ marginBottom: "12px" }}>
            Size Variants
          </Typography.Body>
          <Box
            sx={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Button variant="outlined" colorScheme="primary" size="sm">
              Small
            </Button>
            <Button variant="outlined" colorScheme="primary" size="md">
              Medium
            </Button>
            <Button variant="outlined" colorScheme="primary" size="lg">
              Large
            </Button>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ marginBottom: "60px" }} />

      {/* ============== SOFT VARIANT ============== */}
      <Box sx={{ marginBottom: "60px" }}>
        <Typography.Header color="secondary" weight="bold">
          Soft Variant
        </Typography.Header>

        {/* All Colors */}
        <Box sx={{ marginBottom: "30px" }}>
          <Typography.Body sx={{ marginBottom: "12px" }}>
            All Color Schemes
          </Typography.Body>
          <Box sx={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Button variant="soft" colorScheme="primary">
              Primary
            </Button>
            <Button variant="soft" colorScheme="secondary">
              Secondary
            </Button>
            <Button variant="soft" colorScheme="success">
              Success
            </Button>
            <Button variant="soft" colorScheme="error">
              Error
            </Button>
            <Button variant="soft" colorScheme="warningLabel">
              Warning
            </Button>
            <Button variant="soft" colorScheme="orange">
              Orange
            </Button>
            <Button variant="soft" colorScheme="yellow">
              Yellow
            </Button>
            <Button variant="soft" colorScheme="gray">
              Gray
            </Button>
          </Box>
        </Box>

        {/* With Icons */}
        <Box sx={{ marginBottom: "30px" }}>
          <Typography.Body sx={{ marginBottom: "12px" }}>
            With Icons
          </Typography.Body>
          <Box sx={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Button
              variant="soft"
              colorScheme="primary"
              startDecorator={<AddAPhoto />}
            >
              Upload
            </Button>
            <Button
              variant="soft"
              colorScheme="secondary"
              startDecorator={<Edit />}
            >
              Edit
            </Button>
            <Button
              variant="soft"
              colorScheme="success"
              startDecorator={<CheckCircle />}
            >
              Save
            </Button>
            <Button
              variant="soft"
              colorScheme="error"
              startDecorator={<Delete />}
            >
              Delete
            </Button>
          </Box>
        </Box>

        {/* Size Variants */}
        <Box>
          <Typography.Body sx={{ marginBottom: "12px" }}>
            Size Variants
          </Typography.Body>
          <Box
            sx={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Button variant="soft" colorScheme="primary" size="sm">
              Small
            </Button>
            <Button variant="soft" colorScheme="primary" size="md">
              Medium
            </Button>
            <Button variant="soft" colorScheme="primary" size="lg">
              Large
            </Button>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ marginBottom: "60px" }} />

      {/* ============== PLAIN VARIANT ============== */}
      <Box sx={{ marginBottom: "60px" }}>
        <Typography.Header color="secondary" weight="bold">
          Plain Variant
        </Typography.Header>

        {/* All Colors */}
        <Box sx={{ marginBottom: "30px" }}>
          <Typography.Body sx={{ marginBottom: "12px" }}>
            All Color Schemes
          </Typography.Body>
          <Box sx={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Button variant="plain" colorScheme="primary">
              Primary
            </Button>
            <Button variant="plain" colorScheme="secondary">
              Secondary
            </Button>
            <Button variant="plain" colorScheme="success">
              Success
            </Button>
            <Button variant="plain" colorScheme="error">
              Error
            </Button>
            <Button variant="plain" colorScheme="warningLabel">
              Warning
            </Button>
            <Button variant="plain" colorScheme="orange">
              Orange
            </Button>
            <Button variant="plain" colorScheme="yellow">
              Yellow
            </Button>
            <Button variant="plain" colorScheme="gray">
              Gray
            </Button>
          </Box>
        </Box>

        {/* With Icons */}
        <Box sx={{ marginBottom: "30px" }}>
          <Typography.Body sx={{ marginBottom: "12px" }}>
            With Icons
          </Typography.Body>
          <Box sx={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Button
              variant="plain"
              colorScheme="primary"
              startDecorator={<AddAPhoto />}
            >
              Upload
            </Button>
            <Button
              variant="plain"
              colorScheme="secondary"
              startDecorator={<Edit />}
            >
              Edit
            </Button>
            <Button
              variant="plain"
              colorScheme="success"
              startDecorator={<CheckCircle />}
            >
              Save
            </Button>
            <Button
              variant="plain"
              colorScheme="error"
              startDecorator={<Delete />}
            >
              Delete
            </Button>
          </Box>
        </Box>

        {/* Size Variants */}
        <Box>
          <Typography.Body sx={{ marginBottom: "12px" }}>
            Size Variants
          </Typography.Body>
          <Box
            sx={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Button variant="plain" colorScheme="primary" size="sm">
              Small
            </Button>
            <Button variant="plain" colorScheme="primary" size="md">
              Medium
            </Button>
            <Button variant="plain" colorScheme="primary" size="lg">
              Large
            </Button>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ marginBottom: "60px" }} />

      {/* ============== DISABLED STATE ============== */}
      <Box sx={{ marginBottom: "60px" }}>
        <Typography.Header color="secondary" weight="bold">
          Disabled State
        </Typography.Header>

        <Box sx={{ marginBottom: "30px" }}>
          <Typography.Body sx={{ marginBottom: "12px" }}>
            All Variants Disabled
          </Typography.Body>
          <Box sx={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Button variant="solid" colorScheme="primary" disabled>
              Solid
            </Button>
            <Button variant="outlined" colorScheme="secondary" disabled>
              Outlined
            </Button>
            <Button variant="soft" colorScheme="success" disabled>
              Soft
            </Button>
            <Button variant="plain" colorScheme="error" disabled>
              Plain
            </Button>
          </Box>
        </Box>

        <Box>
          <Typography.Body sx={{ marginBottom: "12px" }}>
            Disabled with Icons
          </Typography.Body>
          <Box sx={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Button
              variant="solid"
              colorScheme="primary"
              startDecorator={<Edit />}
              disabled
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              colorScheme="error"
              startDecorator={<Delete />}
              disabled
            >
              Delete
            </Button>
            <Button
              variant="soft"
              colorScheme="secondary"
              startDecorator={<AddAPhoto />}
              disabled
            >
              Upload
            </Button>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ marginBottom: "60px" }} />

      {/* ============== ICON BUTTON ============== */}
      <Box sx={{ marginBottom: "60px" }}>
        <Typography.Header color="secondary" weight="bold">
          Icon Buttons
        </Typography.Header>

        {/* Solid Icon Buttons */}
        <Box sx={{ marginBottom: "30px" }}>
          <Typography.Body sx={{ marginBottom: "12px" }}>
            Solid Variant
          </Typography.Body>
          <Box
            sx={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <IconButton variant="solid" colorScheme="primary">
              <Edit />
            </IconButton>
            <IconButton variant="solid" colorScheme="secondary">
              <Settings />
            </IconButton>
            <IconButton variant="solid" colorScheme="success">
              <CheckCircle />
            </IconButton>
            <IconButton variant="solid" colorScheme="error">
              <Delete />
            </IconButton>
            <IconButton variant="solid" colorScheme="warningLabel">
              <Warning />
            </IconButton>
            <IconButton variant="solid" colorScheme="orange">
              <AddAPhoto />
            </IconButton>
          </Box>
        </Box>

        {/* Outlined Icon Buttons */}
        <Box sx={{ marginBottom: "30px" }}>
          <Typography.Body sx={{ marginBottom: "12px" }}>
            Outlined Variant
          </Typography.Body>
          <Box
            sx={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <IconButton variant="outlined" colorScheme="primary">
              <Edit />
            </IconButton>
            <IconButton variant="outlined" colorScheme="secondary">
              <Settings />
            </IconButton>
            <IconButton variant="outlined" colorScheme="success">
              <CheckCircle />
            </IconButton>
            <IconButton variant="outlined" colorScheme="error">
              <Delete />
            </IconButton>
            <IconButton variant="outlined" colorScheme="warningLabel">
              <Warning />
            </IconButton>
            <IconButton variant="outlined" colorScheme="orange">
              <AddAPhoto />
            </IconButton>
          </Box>
        </Box>

        {/* Soft Icon Buttons */}
        <Box sx={{ marginBottom: "30px" }}>
          <Typography.Body sx={{ marginBottom: "12px" }}>
            Soft Variant
          </Typography.Body>
          <Box
            sx={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <IconButton variant="soft" colorScheme="primary">
              <Edit />
            </IconButton>
            <IconButton variant="soft" colorScheme="secondary">
              <Settings />
            </IconButton>
            <IconButton variant="soft" colorScheme="success">
              <CheckCircle />
            </IconButton>
            <IconButton variant="soft" colorScheme="error">
              <Delete />
            </IconButton>
            <IconButton variant="soft" colorScheme="warningLabel">
              <Warning />
            </IconButton>
            <IconButton variant="soft" colorScheme="orange">
              <AddAPhoto />
            </IconButton>
          </Box>
        </Box>

        {/* Plain Icon Buttons */}
        <Box sx={{ marginBottom: "30px" }}>
          <Typography.Body sx={{ marginBottom: "12px" }}>
            Plain Variant
          </Typography.Body>
          <Box
            sx={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <IconButton variant="plain" colorScheme="primary">
              <Edit />
            </IconButton>
            <IconButton variant="plain" colorScheme="secondary">
              <Settings />
            </IconButton>
            <IconButton variant="plain" colorScheme="success">
              <CheckCircle />
            </IconButton>
            <IconButton variant="plain" colorScheme="error">
              <Delete />
            </IconButton>
            <IconButton variant="plain" colorScheme="warningLabel">
              <Warning />
            </IconButton>
            <IconButton variant="plain" colorScheme="orange">
              <AddAPhoto />
            </IconButton>
          </Box>
        </Box>

        {/* Icon Button Sizes */}
        <Box sx={{ marginBottom: "30px" }}>
          <Typography.Body sx={{ marginBottom: "12px" }}>
            Size Variants
          </Typography.Body>
          <Box
            sx={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <IconButton variant="solid" colorScheme="primary" size="sm">
              <Edit />
            </IconButton>
            <IconButton variant="solid" colorScheme="primary" size="md">
              <Edit />
            </IconButton>
            <IconButton variant="solid" colorScheme="primary" size="lg">
              <Edit />
            </IconButton>
          </Box>
        </Box>

        {/* Disabled Icon Buttons */}
        <Box>
          <Typography.Body sx={{ marginBottom: "12px" }}>
            Disabled Icon Buttons
          </Typography.Body>
          <Box
            sx={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <IconButton variant="solid" colorScheme="primary" disabled>
              <Edit />
            </IconButton>
            <IconButton variant="outlined" colorScheme="secondary" disabled>
              <Settings />
            </IconButton>
            <IconButton variant="soft" colorScheme="success" disabled>
              <CheckCircle />
            </IconButton>
            <IconButton variant="plain" colorScheme="error" disabled>
              <Delete />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ marginBottom: "60px" }} />

      {/* ============== CUSTOM STYLING ============== */}
      <Box sx={{ marginBottom: "60px" }}>
        <Typography.Header color="secondary" weight="bold" marginBottom={2}>
          Custom Styling Examples
        </Typography.Header>

        <Box sx={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Button
            variant="solid"
            colorScheme="primary"
            sx={{
              padding: "16px 32px",
              fontSize: "16px",
              borderRadius: "12px",
              fontWeight: "bold",
            }}
            startDecorator={<Save />}
          >
            Large Custom Button
          </Button>
          <Button
            variant="soft"
            colorScheme="secondary"
            sx={{
              width: "200px",
              padding: "12px",
              borderRadius: "20px",
            }}
            endDecorator={<Info />}
          >
            Full Width Custom
          </Button>
          <IconButton
            variant="solid"
            colorScheme="error"
            sx={{
              width: "60px",
              height: "60px",
              borderRadius: "12px",
            }}
          >
            <Delete />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ButtonShowcase;
