import React from "react";
import { Card, Typography, Box, Stack, Chip } from "@mui/joy";
import { TrendingUp, Award, Star } from "lucide-react";
import { colors } from "@/src/utils/Colors";
import Container from "@/src/components/Container";

interface RoomRank {
  roomNumber: string;
  roomType: string;
  bookings: number;
  revenue: number;
  rank: number;
}

interface RoomRankingCardProps {
  rooms: RoomRank[];
  title: string;
  type: "bookings" | "revenue";
}

const RoomRankingCard: React.FC<RoomRankingCardProps> = ({ rooms, title, type }) => {
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "#FFD700"; // Gold
      case 2:
        return "#C0C0C0"; // Silver
      case 3:
        return "#CD7F32"; // Bronze
      default:
        return colors.primary;
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank <= 3) {
      return <Award size={18} style={{ color: getMedalColor(rank) }} />;
    }
    return <Star size={16} style={{ color: colors.gray }} />;
  };

  return (
    <Container
      elevation={2}
      hoverEffect="lift"
      hoverDuration={300}
      hover
    >
      <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
        <TrendingUp size={20} style={{ color: colors.primary }} />
        <Typography level="title-lg" fontWeight="700">
          {title}
        </Typography>
      </Box>

      <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
        {rooms.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              No room data available
            </Typography>
          </Box>
        ) : (
          <Stack spacing={0}>
            {rooms.map((room, index) => (
              <Box
                key={`${room.roomNumber}-${index}`}
                sx={{
                  p: 2,
                  borderBottom: index < rooms.length - 1 ? "1px solid" : "none",
                  borderColor: "divider",
                  transition: "all 0.2s",
                  bgcolor: room.rank <= 3 ? "background.level1" : "transparent",
                  "&:hover": {
                    bgcolor: "background.level2",
                  },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        bgcolor: room.rank <= 3 ? getMedalColor(room.rank) : "neutral.softBg",
                        color: room.rank <= 3 ? "white" : "neutral.solidBg",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {room.rank}
                    </Box>
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Typography level="title-sm" fontWeight="600">
                          Room {room.roomNumber}
                        </Typography>
                        {room.rank === 1 && getMedalIcon(room.rank)}
                      </Box>
                      <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                        {room.roomType}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {type === "bookings" ? (
                    <Chip size="sm" color="primary" variant="soft">
                      {room.bookings} bookings
                    </Chip>
                  ) : (
                    <Typography level="body-sm" fontWeight="700" sx={{ color: "success.solidBg" }}>
                      ₱{room.revenue.toLocaleString()}
                    </Typography>
                  )}
                </Box>

                {type === "revenue" && (
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                      {room.bookings} bookings
                    </Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Container>
  );
};

export default RoomRankingCard;
