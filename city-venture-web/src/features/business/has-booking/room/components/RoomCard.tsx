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
  floor: string;
  roomNumber: string;
  roomType: string;
  type: string;
  price: string;
  room_size: number | string;
  capacity?: string;
  amenities: string[];
  discountPercentage?: number | null;
  onDeleted: () => void;
  onClick: () => void;
  onUpdate?: () => void;
}

const RoomCard: React.FC<RoomCardProps> = ({
  image,
  floor,
  roomNumber,
  roomType,
  price,
  capacity,
  room_size,
  amenities,
  discountPercentage,
  onClick,
}) => {
  // Calculate discounted price if discount exists
  const originalPrice = parseFloat(price.toString().replace(/,/g, ""));
  const hasDiscount = discountPercentage && discountPercentage > 0;
  const discountedPrice = hasDiscount
    ? originalPrice * (1 - discountPercentage / 100)
    : originalPrice;

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

        <Chip
          color="primary"
          variant="soft"
          size="md"
          sx={{ position: "absolute", top: 12, right: 12 }}
        >
          Floor {floor}
        </Chip>

        {/* Discount Badge */}
        {hasDiscount && (
          <Chip
            color="warning"
            variant="soft"
            size="md"
            sx={{ position: "absolute", bottom: 12, right: 12 }}
          >
            {discountPercentage}% OFF
          </Chip>
        )}
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
            {hasDiscount ? (
              <Box>
                <Typography
                  level="body-sm"
                  sx={{
                    textDecoration: "line-through",
                    color: "neutral.500",
                  }}
                  textAlign={{ xs: "left", md: "right" } as any}
                >
                  ₱{originalPrice.toLocaleString()}
                </Typography>
                <Typography
                  sx={{ color: colors.yellow }}
                  level="h4"
                  textAlign={{ xs: "left", md: "right" } as any}
                >
                  ₱{Math.round(discountedPrice).toLocaleString()}
                </Typography>
              </Box>
            ) : (
              <Typography
                sx={{ color: colors.yellow }}
                level="h4"
                textAlign={{ xs: "left", md: "right" } as any}
              >
                ₱{originalPrice.toLocaleString()}
              </Typography>
            )}
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
