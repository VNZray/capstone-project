import * as React from "react";
import { Box, Typography, LinearProgress } from "@mui/joy";
import StarIcon from "@mui/icons-material/Star";
import Container from "@/src/components/Container";

interface RatingsOverviewProps {
  average: number;
  totalReviews: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>; // counts per star
}

const barOrder: (5 | 4 | 3 | 2 | 1)[] = [5, 4, 3, 2, 1];

const RatingsOverview: React.FC<RatingsOverviewProps> = ({
  average,
  totalReviews,
  distribution,
}) => {
  // Calculate filled stars
  const filledStars = Math.floor(average);
  const hasHalfStar = average % 1 >= 0.5;

  return (
    <Container elevation={2} style={{ width: '35%' }}>
      {/* Top: Average Rating - Centered */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          pb: 2,
          mb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          level="h1"
          sx={{
            fontSize: 48,
            fontWeight: 700,
            lineHeight: 1,
            mb: 1.5,
            color: "text.primary",
          }}
        >
          {average.toFixed(1)}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon
              key={i}
              sx={{
                fontSize: 28,
                color:
                  i < filledStars
                    ? "#FFA726"
                    : i === filledStars && hasHalfStar
                    ? "#FFD54F"
                    : "#E0E0E0",
              }}
            />
          ))}
        </Box>

        <Typography
          level="body-sm"
          sx={{ color: "text.tertiary", fontWeight: 500 }}
        >
          {totalReviews} review{totalReviews !== 1 ? "s" : ""}
        </Typography>
      </Box>

      {/* Bottom: Distribution Bars */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {barOrder.map((star) => {
          const count = distribution[star] || 0;
          const pct =
            totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

          return (
            <Box
              key={star}
              sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  minWidth: 40,
                }}
              >
                <Typography
                  level="body-sm"
                  sx={{ fontWeight: 600, color: "text.secondary" }}
                >
                  {star}
                </Typography>
                <StarIcon sx={{ fontSize: 14, color: "#FFA726" }} />
              </Box>

              <Box sx={{ flex: 1, minWidth: 100 }}>
                <LinearProgress
                  determinate
                  value={pct}
                  color={star >= 4 ? 'success' : star === 3 ? 'warning' : 'danger'}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    '--LinearProgress-radius': '4px',
                    '--LinearProgress-thickness': '8px',
                  }}
                  aria-label={`${star} star bar`}
                />
              </Box>

              <Typography
                level="body-xs"
                sx={{
                  minWidth: 28,
                  textAlign: "right",
                  fontWeight: 600,
                  color: "text.tertiary",
                }}
              >
                {count}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Container>
  );
};

export default RatingsOverview;
