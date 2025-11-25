import React from "react";
import { Box, Typography, Stack } from "@mui/joy";
import Container from "@/src/components/Container";
import { Trophy } from "lucide-react";
import { colors } from "@/src/utils/Colors";

interface Room {
  rank: number;
  roomNumber: string;
  roomType: string;
  bookings: number;
  revenue: number;
}

interface TopRoomsCardProps {
  rooms: Room[];
  title: string;
  type: "bookings" | "revenue";
}

const TopRoomsCard: React.FC<TopRoomsCardProps> = ({ rooms, title }) => {
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "#FFD700"; // Gold
      case 2:
        return "#C0C0C0"; // Silver
      case 3:
        return "#CD7F32"; // Bronze
      default:
        return colors.background;
    }
  };

  const getMedalGradient = (rank: number) => {
    switch (rank) {
      case 1:
        return `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`;
      case 2:
        return `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.info} 100%)`;
      case 3:
        return `linear-gradient(135deg, ${colors.orange} 0%, ${colors.orange} 100%)`;
      default:
        return colors.background;
    }
  };

  const topThree = rooms.slice(0, 3);

  return (
    <Container elevation={2}>
      <Box
        sx={{
          p: 2.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Trophy size={20} style={{ color: "#FFD700" }} />
        <Typography level="title-md" fontWeight="700">
          {title}
        </Typography>
      </Box>

      <Box sx={{ p: 2.5 }}>
        <Stack spacing={2.5}>
          {topThree.map((room, index) => (
            <Box
              key={index}
              sx={{
                position: "relative",
                p: 2.5,
                borderRadius: 12,
                background: getMedalGradient(room.rank),
                boxShadow:
                  room.rank <= 3 ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                },
              }}
            >
              {/* Rank Badge */}
              <Box
                sx={{
                  position: "absolute",
                  top: -10,
                  left: 20,
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: getMedalColor(room.rank),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  border: "3px solid white",
                }}
              >
                <Typography
                  level="title-lg"
                  fontWeight="900"
                  sx={{
                    color: room.rank === 1 ? "#8B4513" : "white",
                  }}
                >
                  {room.rank}
                </Typography>
              </Box>

              {/* Content */}
              <Box sx={{ ml: 5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 1,
                  }}
                >
                  <Box>
                    <Typography
                      level="title-md"
                      fontWeight="700"
                      sx={{
                        color: room.rank <= 3 ? "white" : "text.primary",
                      }}
                    >
                      Room {room.roomNumber}
                    </Typography>
                    <Typography
                      level="body-sm"
                      sx={{
                        color:
                          room.rank <= 3
                            ? "rgba(255,255,255,0.9)"
                            : "text.secondary",
                      }}
                    >
                      {room.roomType}
                    </Typography>
                  </Box>

                  {room.rank === 1 && (
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 6,
                        bgcolor: "rgba(255,255,255,0.3)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <Typography
                        level="body-xs"
                        fontWeight="700"
                        sx={{ color: "white" }}
                      >
                        TOP PICK
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Stats */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 3,
                    mt: 2,
                  }}
                >
                  <Box>
                    <Typography
                      level="body-xs"
                      sx={{
                        color:
                          room.rank <= 3
                            ? "rgba(255,255,255,0.8)"
                            : "text.tertiary",
                        mb: 0.5,
                      }}
                    >
                      Bookings
                    </Typography>
                    <Typography
                      level="title-lg"
                      fontWeight="700"
                      sx={{
                        color: room.rank <= 3 ? "white" : "text.primary",
                      }}
                    >
                      {room.bookings}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      level="body-xs"
                      sx={{
                        color:
                          room.rank <= 3
                            ? "rgba(255,255,255,0.8)"
                            : "text.tertiary",
                        mb: 0.5,
                      }}
                    >
                      Revenue
                    </Typography>
                    <Typography
                      level="title-lg"
                      fontWeight="700"
                      sx={{
                        color: room.rank <= 3 ? "white" : "text.primary",
                      }}
                    >
                      ₱{room.revenue.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>

        {/* Additional Info */}
        {rooms.length > 3 && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 8,
              bgcolor: "background.level1",
              textAlign: "center",
            }}
          >
            <Typography level="body-sm" sx={{ color: "text.secondary" }}>
              + {rooms.length - 3} more rooms
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default TopRoomsCard;
