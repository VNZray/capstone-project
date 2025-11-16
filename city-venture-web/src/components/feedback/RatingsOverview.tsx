import * as React from "react";
import { Box, LinearProgress, Divider } from "@mui/joy";
import StarIcon from "@mui/icons-material/Star";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";

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
    <Container elevation={2} hover>
      {/* Top: Average Rating - Centered */}
      <Container padding="0" align="center" justify="center" gap="4px">
        <Typography.Title>{average.toFixed(1)}</Typography.Title>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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

        <Typography.Body>
          {totalReviews} review{totalReviews !== 1 ? "s" : ""}
        </Typography.Body>
      </Container>

      <Divider></Divider>
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
                }}
              >
                <Typography.Body
                  endDecorator={
                    <StarIcon sx={{ fontSize: 14, color: "#FFA726" }} />
                  }
                >
                  {star}
                </Typography.Body>
              </Box>

              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  determinate
                  value={pct}
                  color={
                    star >= 4 ? "success" : star === 3 ? "warning" : "danger"
                  }
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    "--LinearProgress-radius": "4px",
                    "--LinearProgress-thickness": "8px",
                  }}
                  aria-label={`${star} star bar`}
                />
              </Box>

              <Typography.Body>{count}</Typography.Body>
            </Box>
          );
        })}
      </Box>
    </Container>
  );
};

export default RatingsOverview;
