import * as React from "react";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import CardActions from "@mui/joy/CardActions";
import Typography from "@mui/joy/Typography";
import Chip from "@mui/joy/Chip";
import Button from "@mui/joy/Button";
import Box from "@mui/joy/Box";
import IconButton from "@mui/joy/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Grid } from "@mui/joy";
import { colors } from "@/src/utils/Colors";
import { deleteData } from "@/src/api_function";

interface RoomCardProps {
  id: string;
  image: string;
  status: string;
  floor: string;
  roomNumber: string;
  type: string;
  price: string;
  guests: number;
  amenities: string[];
  onDeleted: () => void;
  onClick: () => void;
}

const RoomCard: React.FC<RoomCardProps> = ({
  id,
  image,
  status,
  floor,
  roomNumber,
  type,
  price,
  guests,
  amenities,
  onDeleted,
  onClick,
}) => {
  const editRoom = () => {};

  const deleteRoom = async () => {
    try {
      await deleteData(id, "room");
      onDeleted();
    } catch (err) {
      console.error("Failed to delete room:", err);
    }
  };

  return (
    <Card variant="outlined" sx={{ maxWidth: "100%", borderRadius: 8 }}>
      <Box sx={{ position: "relative" }}>
        <img
          src={image}
          alt={roomNumber}
          style={{ width: "100%", height: "300px", borderRadius: 6 }}
        />

        {status === "Available" && (
          <Chip
            color="success"
            variant="solid"
            size="md"
            sx={{ position: "absolute", top: 12, left: 12 }}
          >
            {status}
          </Chip>
        )}
        {status === "Reserved" && (
          <Chip
            color="neutral"
            variant="soft"
            size="md"
            sx={{ position: "absolute", top: 12, left: 12 }}
          >
            {status}
          </Chip>
        )}
        {status === "Occupied" && (
          <Chip
            color="danger"
            variant="solid"
            size="md"
            sx={{ position: "absolute", top: 12, left: 12 }}
          >
            {status}
          </Chip>
        )}
        {status === "Maintenance" && (
          <Chip
            color="warning"
            variant="solid"
            size="md"
            sx={{ position: "absolute", top: 12, left: 12 }}
          >
            {status}
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
          <Grid xs={6}>
            <Typography level="h4"> Room {roomNumber}</Typography>
            <Typography level="body-sm" color="neutral">
              {type}
            </Typography>
          </Grid>
          <Grid xs={6}>
            <Typography
              sx={{ color: colors.yellow }}
              level="h4"
              textAlign={"right"}
            >
              ₱{price.toLocaleString()}
            </Typography>
            <Typography
              level="body-xs"
              color="neutral"
              textAlign={"right"}
              sx={{ ml: 0.5 }}
            >
              per night
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Typography level="body-xs" color="neutral">
            <span role="img" aria-label="guests">
              👥
            </span>{" "}
            {guests} guests
          </Typography>
        </Box>
        <Typography level="body-xs" color="neutral" sx={{ mb: 0.5 }}>
          Amenities:
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {amenities.slice(0, 4).map((amenity) => (
            <Chip key={amenity} size="sm" variant="soft">
              {amenity}
            </Chip>
          ))}
          {amenities.length > 4 && (
            <Chip size="sm" variant="soft">
              +{amenities.length - 4} more
            </Chip>
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: "center" }}>
        <Button onClick={onClick} fullWidth variant="solid">
          View Details
        </Button>
        <IconButton
          style={{ borderRadius: "8px" }}
          onClick={editRoom}
          variant="solid"
        >
          <EditIcon />
        </IconButton>
        <IconButton
          style={{ borderRadius: "8px" }}
          color="danger"
          variant="solid"
          onClick={deleteRoom}
        >
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default RoomCard;
