import { Divider, Box, Chip } from "@mui/joy";
import { Heart, Share2, ShoppingCart, Star, MapPin } from "lucide-react";
import Container from "../components/Container";
import Typography from "../components/Typography";
import Card from "../components/Card";

const CardShowcase = () => {
  const sampleImage = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800";
  const sampleImage2 = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800";
  const sampleImage3 = "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800";

  return (
    <Container padding="40px" gap="32px">
      <Typography.Title weight="bold" color="primary">
        Card Component Showcase
      </Typography.Title>

      {/* Grid Variant - All Sizes */}
      <Box>
        <Typography.Header size="normal" style={{ marginBottom: "16px" } as any}>
          Grid Variant - All Sizes
        </Typography.Header>
        <Divider sx={{ mb: 3 }} />

        {/* Extra Small */}
        <Typography.Label size="sm" style={{ marginBottom: "12px" } as any}>
          Extra Small (xs)
        </Typography.Label>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 2,
            mb: 4,
          }}
        >
          <Card
            size="xs"
            variant="grid"
            image={sampleImage}
            aspectRatio="16/9"
            title="Luxury Hotel"
            subtitle="$299/night"
            actions={[
              { label: "Book", onClick: () => alert("Booked!") },
              { label: "Details", onClick: () => alert("Details"), variant: "outlined" },
            ]}
          >
            <Chip size="sm" color="success">Available</Chip>
          </Card>

          <Card
            size="xs"
            variant="grid"
            image={sampleImage2}
            aspectRatio="4/3"
            title="Beach Resort"
            subtitle="$199/night"
            actions={[
              { label: "Book", onClick: () => alert("Booked!"), colorScheme: "success" },
            ]}
          >
            <Heart size={16} style={{ cursor: "pointer" }} />
          </Card>
        </Box>

        {/* Small */}
        <Typography.Label size="sm" style={{ marginBottom: "12px" } as any}>
          Small (sm)
        </Typography.Label>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 2,
            mb: 4,
          }}
        >
          <Card
            size="sm"
            variant="grid"
            image={sampleImage}
            aspectRatio="16/9"
            title="Mountain Cabin"
            subtitle="Beautiful view • 4.8 ⭐"
            actions={[
              { label: "Book Now", onClick: () => alert("Booked!") },
              { label: "Share", onClick: () => alert("Shared"), variant: "soft" },
            ]}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <Heart size={18} style={{ cursor: "pointer" }} />
              <Share2 size={18} style={{ cursor: "pointer" }} />
            </Box>
          </Card>

          <Card
            size="sm"
            variant="grid"
            image={sampleImage3}
            aspectRatio="1/1"
            title="City Apartment"
            subtitle="Downtown location"
            actions={[
              { label: "View", onClick: () => alert("Viewing"), colorScheme: "info" },
            ]}
          >
            <Chip size="sm" color="warning">Hot Deal</Chip>
          </Card>
        </Box>

        {/* Default */}
        <Typography.Label size="sm" style={{ marginBottom: "12px" } as any}>
          Default
        </Typography.Label>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 3,
            mb: 4,
          }}
        >
          <Card
            size="default"
            variant="grid"
            image={sampleImage2}
            aspectRatio="16/9"
            title="Seaside Villa"
            subtitle="Private pool • Ocean view • 5 bedrooms"
            actions={[
              { label: "Book Now", onClick: () => alert("Booking..."), colorScheme: "primary" },
              { label: "Add to Cart", onClick: () => alert("Added!"), variant: "outlined" },
              { label: "Details", onClick: () => alert("Details"), variant: "soft" },
            ]}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Star size={16} fill="gold" color="gold" />
              <Typography.Label size="xs">4.9</Typography.Label>
            </Box>
          </Card>

          <Card
            size="default"
            variant="grid"
            image={sampleImage}
            aspectRatio="4/3"
            title="Modern Loft"
            subtitle="City center • WiFi • Workspace"
            hoverEffect="scale"
            onClick={() => alert("Card clicked!")}
          >
            <Chip size="md" color="success">New</Chip>
          </Card>
        </Box>

        {/* Medium */}
        <Typography.Label size="sm" style={{ marginBottom: "12px" } as any}>
          Medium (md)
        </Typography.Label>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: 3,
            mb: 4,
          }}
        >
          <Card
            size="md"
            variant="grid"
            image={sampleImage3}
            aspectRatio="16/9"
            title="Luxury Penthouse"
            subtitle="Panoramic views • 3 bathrooms • Rooftop access"
            elevation={3}
            hoverEffect="glow"
            actions={[
              { label: "Reserve", onClick: () => alert("Reserved!"), colorScheme: "success" },
              { label: "Tour", onClick: () => alert("Scheduling tour..."), variant: "outlined" },
            ]}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <Heart size={20} style={{ cursor: "pointer" }} />
              <Share2 size={20} style={{ cursor: "pointer" }} />
              <MapPin size={20} style={{ cursor: "pointer" }} />
            </Box>
          </Card>
        </Box>

        {/* Large */}
        <Typography.Label size="sm" style={{ marginBottom: "12px" } as any}>
          Large (lg)
        </Typography.Label>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
            gap: 3,
            mb: 4,
          }}
        >
          <Card
            size="lg"
            variant="grid"
            image={sampleImage2}
            aspectRatio="21/9"
            title="Grand Estate"
            subtitle="10 acres • Private beach • 8 bedrooms • Full staff"
            elevation={4}
            hoverEffect="shadow-expand"
            actions={[
              { label: "Book Tour", onClick: () => alert("Booking tour..."), colorScheme: "primary" },
              { label: "Request Info", onClick: () => alert("Info sent!"), variant: "outlined", colorScheme: "info" },
              { label: "Add to Favorites", onClick: () => alert("Added!"), variant: "soft", colorScheme: "error" },
            ]}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip size="lg" color="warning">Featured</Chip>
              <Typography.Label size="sm">$2,999/night</Typography.Label>
            </Box>
          </Card>
        </Box>
      </Box>

      <Divider sx={{ my: 5 }} />

      {/* List Variant - All Sizes */}
      <Box>
        <Typography.Header size="normal" style={{ marginBottom: "16px" } as any}>
          List Variant - All Sizes
        </Typography.Header>
        <Divider sx={{ mb: 3 }} />

        {/* Extra Small */}
        <Typography.Label size="sm" style={{ marginBottom: "12px" } as any}>
          Extra Small (xs) - List
        </Typography.Label>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
          <Card
            size="md"
            variant="list"
            image={sampleImage}
            aspectRatio="1/1"
            title="Cozy Studio"
            subtitle="$99/night"
            actions={[
              { label: "Book", onClick: () => alert("Booked!") },
            ]}
          >
            <Chip size="lg" color="success">Available</Chip>
          </Card>

          <Card
            size="xs"
            variant="list"
            image={sampleImage2}
            aspectRatio="4/3"
            title="Garden View Room"
            subtitle="$149/night"
            actions={[
              { label: "View", onClick: () => alert("Viewing"), variant: "outlined" },
            ]}
          >
            <Star size={14} fill="gold" color="gold" />
          </Card>
        </Box>

        {/* Small */}
        <Typography.Label size="sm" style={{ marginBottom: "12px" } as any}>
          Small (sm) - List
        </Typography.Label>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
          <Card
            size="sm"
            variant="list"
            image={sampleImage3}
            aspectRatio="16/9"
            title="Downtown Suite"
            subtitle="Modern amenities • WiFi • Parking"
            actions={[
              { label: "Book Now", onClick: () => alert("Booking...") },
              { label: "Details", onClick: () => alert("Details"), variant: "soft" },
            ]}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <Heart size={16} />
              <Share2 size={16} />
            </Box>
          </Card>
        </Box>

        {/* Default */}
        <Typography.Label size="sm" style={{ marginBottom: "12px" } as any}>
          Default - List
        </Typography.Label>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
          <Card
            size="default"
            variant="list"
            image={sampleImage}
            aspectRatio="3/2"
            title="Riverside Retreat"
            subtitle="Scenic location • Full kitchen • Pet-friendly • Free breakfast"
            elevation={2}
            hoverEffect="lift"
            actions={[
              { label: "Reserve Now", onClick: () => alert("Reserved!"), colorScheme: "success" },
              { label: "Add to Cart", onClick: () => alert("Added!"), variant: "outlined" },
              { label: "Compare", onClick: () => alert("Comparing..."), variant: "soft", colorScheme: "info" },
            ]}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip color="warning">Best Value</Chip>
              <Typography.Label size="sm">4.8 ⭐</Typography.Label>
            </Box>
          </Card>
        </Box>

        {/* Medium */}
        <Typography.Label size="sm" style={{ marginBottom: "12px" } as any}>
          Medium (md) - List
        </Typography.Label>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
          <Card
            size="md"
            variant="list"
            image={sampleImage2}
            aspectRatio="16/9"
            title="Executive Business Suite"
            subtitle="High-speed WiFi • Conference room • Business center • Concierge"
            elevation={3}
            actions={[
              { label: "Book Corporate", onClick: () => alert("Corporate booking..."), colorScheme: "primary" },
              { label: "Request Quote", onClick: () => alert("Quote sent!"), variant: "outlined" },
            ]}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <Chip size="md" color="primary">Business</Chip>
              <ShoppingCart size={20} />
            </Box>
          </Card>
        </Box>

        {/* Large */}
        <Typography.Label size="sm" style={{ marginBottom: "12px" } as any}>
          Large (lg) - List
        </Typography.Label>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 4 }}>
          <Card
            size="lg"
            variant="list"
            image={sampleImage3}
            aspectRatio="21/9"
            title="Presidential Suite"
            subtitle="24/7 butler service • Private elevator • Spa • Gourmet kitchen • Cinema room • Wine cellar"
            elevation={4}
            hoverEffect="shadow-expand"
            actions={[
              { label: "Book Presidential", onClick: () => alert("Booking presidential..."), colorScheme: "warning" },
              { label: "Virtual Tour", onClick: () => alert("Starting tour..."), variant: "outlined", colorScheme: "info" },
              { label: "Concierge", onClick: () => alert("Contacting..."), variant: "soft" },
            ]}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip size="lg" color="warning">Exclusive</Chip>
              <Typography.Label size="md">$5,999/night</Typography.Label>
              <Star size={24} fill="gold" color="gold" />
            </Box>
          </Card>
        </Box>
      </Box>

      <Divider sx={{ my: 5 }} />

      {/* Different Aspect Ratios */}
      <Box>
        <Typography.Header size="normal" style={{ marginBottom: "16px" } as any}>
          Aspect Ratio Variations
        </Typography.Header>
        <Divider sx={{ mb: 3 }} />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 3,
          }}
        >
          <Card
            variant="grid"
            image={sampleImage}
            aspectRatio="1/1"
            title="Square (1:1)"
            subtitle="Perfect for Instagram"
            actions={[{ label: "View", onClick: () => {} }]}
          />

          <Card
            variant="grid"
            image={sampleImage2}
            aspectRatio="4/3"
            title="Classic (4:3)"
            subtitle="Traditional format"
            actions={[{ label: "View", onClick: () => {} }]}
          />

          <Card
            variant="grid"
            image={sampleImage3}
            aspectRatio="16/9"
            title="Widescreen (16:9)"
            subtitle="Cinema format"
            actions={[{ label: "View", onClick: () => {} }]}
          />

          <Card
            variant="grid"
            image={sampleImage}
            aspectRatio="3/2"
            title="Photo (3:2)"
            subtitle="DSLR standard"
            actions={[{ label: "View", onClick: () => {} }]}
          />

          <Card
            variant="grid"
            image={sampleImage2}
            aspectRatio="21/9"
            title="Ultrawide (21:9)"
            subtitle="Panoramic view"
            actions={[{ label: "View", onClick: () => {} }]}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 5 }} />

      {/* Without Image */}
      <Box>
        <Typography.Header size="normal" style={{ marginBottom: "16px" } as any}>
          Cards Without Images
        </Typography.Header>
        <Divider sx={{ mb: 3 }} />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 3,
          }}
        >
          <Card
            variant="grid"
            title="Text-Only Card"
            subtitle="No image, just content"
            elevation={2}
            actions={[
              { label: "Action 1", onClick: () => alert("Action 1") },
              { label: "Action 2", onClick: () => alert("Action 2"), variant: "outlined" },
            ]}
          >
            <Chip color="primary">Featured</Chip>
          </Card>

          <Card
            variant="list"
            title="List Text Card"
            subtitle="Horizontal layout without image"
            elevation={2}
            actions={[
              { label: "Learn More", onClick: () => alert("Learning..."), colorScheme: "info" },
            ]}
          >
            <Typography.Label size="sm" color="success">New</Typography.Label>
          </Card>
        </Box>
      </Box>

      <Divider sx={{ my: 5 }} />

      {/* Interactive Examples */}
      <Box>
        <Typography.Header size="normal" style={{ marginBottom: "16px" } as any}>
          Interactive Cards
        </Typography.Header>
        <Divider sx={{ mb: 3 }} />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 3,
          }}
        >
          <Card
            variant="grid"
            image={sampleImage}
            aspectRatio="16/9"
            title="Clickable Card"
            subtitle="Click anywhere on the card"
            onClick={() => alert("Card clicked!")}
            hoverEffect="scale"
          >
            <Typography.Label size="xs" color="primary">Click me!</Typography.Label>
          </Card>

          <Card
            variant="grid"
            image={sampleImage2}
            aspectRatio="16/9"
            title="Lift on Hover"
            subtitle="Hover to see effect"
            hoverEffect="lift"
            elevation={1}
          />

          <Card
            variant="grid"
            image={sampleImage3}
            aspectRatio="16/9"
            title="Glow Effect"
            subtitle="Hover for glow"
            hoverEffect="glow"
            elevation={2}
          />

          <Card
            variant="grid"
            image={sampleImage}
            aspectRatio="16/9"
            title="Shadow Expand"
            subtitle="Hover to expand shadow"
            hoverEffect="shadow-expand"
            elevation={1}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default CardShowcase;
