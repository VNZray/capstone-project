import { Box, Divider, Stack } from "@mui/joy";
import Container from "../components/Container";
import Typography from "../components/Typography";

const TextShowcase = () => {
  return (
    <Box sx={{ p: 4, maxWidth: 1000, mx: "auto" }}>

      <Typography.Title weight="bold" color="primary">
        City Venture Typography System
      </Typography.Title>
      <Divider sx={{ my: 3 }} />

      {/* Variants Section */}
      <Stack spacing={4}>
        <Box>
          <Typography.Title weight="semibold" color="secondary">
            Variants
          </Typography.Title>
          <Divider sx={{ my: 2 }} />
          
          <Stack spacing={2}>
            <Typography.Title>Title Variant (For Landing Pages)</Typography.Title>
            <Typography.Header>Header Variant</Typography.Header>
            <Typography.CardTitle>Card Title Variant</Typography.CardTitle>
            <Typography.CardSubTitle>Card Sub Title Variant</Typography.CardSubTitle>
            <Typography.Label>Label Variant</Typography.Label>
            <Typography.Body>Body Variant (Default)</Typography.Body>
          </Stack>
        </Box>

        {/* Sizes Section */}
        <Box>
          <Typography.Header weight="semibold" color="secondary">
            Sizes
          </Typography.Header>
          <Divider sx={{ my: 2 }} />
          
          <Stack spacing={2}>
            <Typography.Header size="xs">Extra Small (xs)</Typography.Header>
            <Typography.Header size="sm">Small (sm)</Typography.Header>
            <Typography.Header size="normal">Normal (default)</Typography.Header>
            <Typography.Header size="md">Medium (md)</Typography.Header>
            <Typography.Header size="lg">Large (lg)</Typography.Header>
          </Stack>
        </Box>

        {/* Font Weights Section */}
        <Box>
          <Typography.Header weight="semibold" color="secondary">
            Font Weights
          </Typography.Header>
          <Divider sx={{ my: 2 }} />
          
          <Stack spacing={2}>
            <Typography.Body weight="thin">Thin Weight (100)</Typography.Body>
            <Typography.Body weight="normal">Normal Weight (400) - Default</Typography.Body>
            <Typography.Body weight="semibold">Semi Bold Weight (600)</Typography.Body>
            <Typography.Body weight="bold">Bold Weight (700)</Typography.Body>
            <Typography.Body weight="black">Black Weight (900)</Typography.Body>
          </Stack>
        </Box>

        {/* Font Styles Section */}
        <Box>
          <Typography.Header weight="semibold" color="secondary">
            Font Styles
          </Typography.Header>
          <Divider sx={{ my: 2 }} />
          
          <Stack spacing={2}>
            <Typography.Body style="normal">Normal Style (default)</Typography.Body>
            <Typography.Body style="italic">Italic Style</Typography.Body>
            <Typography.Body style="underline">Underline Style</Typography.Body>
            <Typography.Body style="crossed">Crossed Style</Typography.Body>
          </Stack>
        </Box>

        {/* Alignment Section */}
        <Box>
          <Typography.Header weight="semibold" color="secondary">
            Text Alignment
          </Typography.Header>
          <Divider sx={{ my: 2 }} />
          
          <Stack spacing={2}>
            <Typography.Body align="left">Left Aligned (default)</Typography.Body>
            <Typography.Body align="center">Center Aligned</Typography.Body>
            <Typography.Body align="right">Right Aligned</Typography.Body>
          </Stack>
        </Box>

        {/* Colors Section */}
        <Box>
          <Typography.Header weight="semibold" color="secondary">
            Colors (with Dark Mode Support)
          </Typography.Header>
          <Divider sx={{ my: 2 }} />
          
          <Stack spacing={2}>
            <Typography.Body color="default">Default Color (Black/White)</Typography.Body>
            <Typography.Body color="primary">Primary Color</Typography.Body>
            <Typography.Body color="secondary">Secondary Color</Typography.Body>
            <Typography.Body color="error">Error Color</Typography.Body>
            <Typography.Body color="warning">Warning Color</Typography.Body>
            <Typography.Body color="info">Info Color</Typography.Body>
            <Typography.Body color="success">Success Color</Typography.Body>
          </Stack>
        </Box>

        {/* Combined Examples */}
        <Box>
          <Typography.Header weight="semibold" color="secondary">
            Combined Examples
          </Typography.Header>
          <Divider sx={{ my: 2 }} />
          
          <Stack spacing={2}>
            <Typography.Title size="md" weight="bold" color="primary" align="center">
              Centered Bold Primary Title
            </Typography.Title>
            
            <Typography.Header size="sm" weight="semibold" color="secondary" style="italic">
              Small Italic Semibold Header
            </Typography.Header>
            
            <Typography.CardTitle weight="bold" color="info">
              Bold Info Card Title
            </Typography.CardTitle>
            
            <Typography.CardSubTitle size="sm" color="warning">
              Small Warning Card Subtitle
            </Typography.CardSubTitle>
            
            <Typography.Label size="xs" weight="semibold" color="success">
              Extra Small Success Label
            </Typography.Label>
            
            <Typography.Body size="lg" style="underline" align="center">
              Large Underlined Centered Body Text
            </Typography.Body>
          </Stack>
        </Box>

        {/* Responsive Showcase */}
        <Box>
          <Typography.Header weight="semibold" color="secondary">
            Responsive Text (Resize Browser)
          </Typography.Header>
          <Divider sx={{ my: 2 }} />
          
          <Stack spacing={2}>
            <Typography.Title weight="bold" color="primary">
              This title scales responsively with screen width
            </Typography.Title>
            <Typography.Body>
              All typography components use CSS clamp() for fluid, responsive scaling.
              Try resizing your browser window to see the text adjust smoothly!
            </Typography.Body>
          </Stack>
        </Box>

        {/* Adaptive Color Showcase */}
        <Box>
          <Typography.Header weight="semibold" color="secondary">
            Adaptive Text Color (Based on Parent Background)
          </Typography.Header>
          <Divider sx={{ my: 2 }} />
          
          <Stack spacing={3}>
            {/* Dark Backgrounds */}
            <Box sx={{ backgroundColor: "#0A1B47", padding: 3, borderRadius: 2 }}>
              <Typography.Title size="sm" weight="bold">
                Dark Blue Background
              </Typography.Title>
              <Typography.Body>
                This text automatically turns white on dark backgrounds!
              </Typography.Body>
            </Box>

            <Box sx={{ backgroundColor: "#1a1a1a", padding: 3, borderRadius: 2 }}>
              <Typography.Header weight="semibold">
                Dark Gray Background
              </Typography.Header>
              <Typography.Body>
                The text color adapts based on the parent's background luminance.
              </Typography.Body>
            </Box>

            <Box sx={{ backgroundColor: "#AE2438", padding: 3, borderRadius: 2 }}>
              <Typography.CardTitle weight="bold">
                Dark Red Background
              </Typography.CardTitle>
              <Typography.CardSubTitle>
                Color detection works with any background color!
              </Typography.CardSubTitle>
            </Box>

            {/* Light Backgrounds */}
            <Box sx={{ backgroundColor: "#DEE3F2", padding: 3, borderRadius: 2 }}>
              <Typography.Title size="sm" weight="bold">
                Light Blue Background
              </Typography.Title>
              <Typography.Body>
                This text automatically turns black on light backgrounds!
              </Typography.Body>
            </Box>

            <Box sx={{ backgroundColor: "#f6f6f6", padding: 3, borderRadius: 2 }}>
              <Typography.Header weight="semibold">
                Light Gray Background
              </Typography.Header>
              <Typography.Body>
                The text remains readable regardless of the background.
              </Typography.Body>
            </Box>

            <Box sx={{ backgroundColor: "#fff3e0", padding: 3, borderRadius: 2 }}>
              <Typography.CardTitle weight="bold">
                Light Orange Background
              </Typography.CardTitle>
              <Typography.CardSubTitle>
                Perfect contrast is maintained automatically!
              </Typography.CardSubTitle>
            </Box>

            {/* Gradient Background */}
            <Box 
              sx={{ 
                background: "linear-gradient(135deg, #0A1B47 0%, #0077B6 50%, #DEE3F2 100%)", 
                padding: 3, 
                borderRadius: 2 
              }}
            >
              <Typography.Title size="md" weight="bold" align="center">
                Gradient Background
              </Typography.Title>
              <Typography.Body align="center">
                Text adapts to the immediate parent's background color
              </Typography.Body>
            </Box>

            {/* Nested Example */}
            <Box sx={{ backgroundColor: "#0077B6", padding: 3, borderRadius: 2 }}>
              <Typography.Header weight="bold">
                Parent: Dark Blue
              </Typography.Header>
              <Box sx={{ backgroundColor: "#ffffff", padding: 2, borderRadius: 1, mt: 2 }}>
                <Typography.Body weight="semibold">
                  Nested: White Background (text turns black)
                </Typography.Body>
              </Box>
            </Box>
          </Stack>

          <Box sx={{ mt: 3, p: 2, backgroundColor: "#e8f5e9", borderRadius: 2 }}>
            <Typography.Label weight="semibold" color="success">
              💡 Pro Tip
            </Typography.Label>
            <Typography.Body size="sm">
              When using <code>color="default"</code>, the text automatically adapts to light or dark 
              backgrounds. Use specific colors (primary, secondary, etc.) when you want to maintain 
              a consistent color regardless of the background.
            </Typography.Body>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default TextShowcase;
