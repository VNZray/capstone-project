import * as React from "react";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import Chip from "@mui/joy/Chip";
import Box from "@mui/joy/Box";
import { Grid } from "@mui/joy";
import { colors } from "@/src/utils/Colors";
import { PeopleAltTwoTone, WidthWide } from "@mui/icons-material";
import Container from "@/src/components/Container";

interface RoomCardProps {
  image: string;
  status: string;
  floor: string;
  roomNumber: string;
  roomType: string;
  type: string;
  price: string;
  room_size: number | string;
  capacity?: string;
  amenities: string[];
  onDeleted: () => void;
  onClick: () => void;
  onStatusUpdate?: (id: string, newStatus: string) => void;
  onUpdate?: () => void;
}

const RoomCard: React.FC<RoomCardProps> = ({
  image,
  status,
  floor,
  roomNumber,
  roomType,
  price,
  capacity,
  room_size,
  amenities,

  onClick,
}) => {
  // local state (initialize with prop)
  const [room_status] = React.useState(status);

  return (
    <Container
      onClick={onClick}
      elevation={2}
      hover
      hoverEffect="lift"
      hoverDuration={50}
      cursor="pointer"
    >
      <Box sx={{ position: "relative" }}>
        <img
          src={image}
          alt={roomNumber}
          loading="lazy"
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "300px",
            aspectRatio: "16/9",
            objectFit: "cover",
            borderRadius: 6,
          }}
        />

        {/* status chip */}
        {room_status === "Available" && (
          <Chip
            color="success"
            variant="solid"
            size="md"
            sx={{ position: "absolute", top: 12, left: 12 }}
          >
            {room_status}
          </Chip>
        )}
        {room_status === "Reserved" && (
          <Chip
            color="neutral"
            variant="solid"
            size="md"
            sx={{ position: "absolute", top: 12, left: 12 }}
          >
            {room_status}
          </Chip>
        )}
        {room_status === "Occupied" && (
          <Chip
            color="warning"
            variant="solid"
            size="md"
            sx={{ position: "absolute", top: 12, left: 12 }}
          >
            {room_status}
          </Chip>
        )}
        {room_status === "Maintenance" && (
          <Chip
            color="danger"
            variant="solid"
            size="md"
            sx={{ position: "absolute", top: 12, left: 12 }}
          >
            {room_status}
          </Chip>
        )}

        <Chip
          color="primary"
          variant="soft"
          size="md"
          sx={{ position: "absolute", top: 12, right: 12 }}
        >
          Floor {floor}
        </Chip>
      </Box>

      <CardContent>
        <Grid container>
          <Grid xs={12} md={6}>
            <Typography level="h4"> Room {roomNumber}</Typography>
            <Typography level="body-sm" color="neutral">
              {roomType}
            </Typography>
          </Grid>
          <Grid xs={12} md={6}>
            <Typography
              sx={{ color: colors.yellow }}
              level="h4"
              textAlign={{ xs: "left", md: "right" } as any}
            >
              ₱{price.toLocaleString()}
            </Typography>
            <Typography
              level="body-xs"
              color="neutral"
              textAlign={{ xs: "left", md: "right" } as any}
              sx={{ ml: 0.5 }}
            >
              per night
            </Typography>
          </Grid>
        </Grid>

        <Typography
          startDecorator={<PeopleAltTwoTone sx={{ fontSize: "1.25rem" }} />}
          level="body-md"
          color="neutral"
        >
          Capacity: {capacity}
        </Typography>
        <Typography
          startDecorator={<WidthWide sx={{ fontSize: "1.25rem" }} />}
          level="body-md"
          color="neutral"
        >
          Room Size: {room_size} sqm
        </Typography>
        {/* Amenities list */}
        {amenities?.length ? (
          <Box
            sx={{
              mt: 1,
              display: "flex",
              flexWrap: "wrap",
              gap: 0.5,
            }}
          >
            {amenities.map((a, idx) => (
              <Chip
                key={`${a}-${idx}`}
                size="sm"
                variant="soft"
                color="neutral"
              >
                {a}
              </Chip>
            ))}
          </Box>
        ) : null}
      </CardContent>
    </Container>
  );
};

export default RoomCard;
