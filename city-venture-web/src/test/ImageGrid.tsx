import { Box, Typography } from "@mui/joy";

const demoImages = [
  {
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    title: "Naga Metropolitan Cathedral",
    subtitle: "Shrine of Our Lady of Peñafrancia",
  },
  {
    src: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
    title: "Kinalas",
    subtitle: "Authentic Bicolano noodle soup",
  },
  {
    src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
    title: "Plaza Rizal & Heritage Village",
    subtitle: "Heart of historic Naga",
  },
  {
    src: "https://images.unsplash.com/photo-1465101178521-c1a9136a3c8b?auto=format&fit=crop&w=800&q=80",
    title: "Peñafrancia Festival",
    subtitle: "Centuries of devotion",
  },
  {
    src: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
    title: "Mt. Isarog Nature Reserve",
    subtitle: "Hike and relax",
  },
];

export default function ImageGrid({ images = demoImages }) {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 900,
        margin: "0 auto",
        p: { xs: 1, sm: 2 },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: { xs: 2, sm: 3 },
        }}
      >
        {images.map((img, i) => (
          <Box
            key={i}
            sx={{
              position: "relative",
              borderRadius: 4,
              overflow: "hidden",
              minHeight: 180,
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              aspectRatio: { xs: "16/9", sm: i % 2 === 0 ? "16/7" : "16/13" },
              display: "flex",
              alignItems: "flex-end",
              background: "#eee",
            }}
          >
            <img
              src={img.src}
              alt={img.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                position: "absolute",
                inset: 0,
                zIndex: 1,
              }}
            />
            <Box
              sx={{
                position: "relative",
                zIndex: 2,
                color: "#fff",
                width: "100%",
                p: 2,
                background:
                  "linear-gradient(0deg, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.08) 100%)",
              }}
            >
              <Typography level="h3" sx={{ fontWeight: 700, fontSize: 22, mb: 0.5 }}>
                {img.title}
              </Typography>
              <Typography level="body-sm" sx={{ opacity: 0.85 }}>
                {img.subtitle}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
