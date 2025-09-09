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
import HotelIcon from "@mui/icons-material/Hotel"; // Occupied
import BuildIcon from "@mui/icons-material/Build"; // Maintenance
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Available
import EventSeatIcon from "@mui/icons-material/EventSeat"; // Reserved
import { Grid, Dropdown, Menu, MenuButton, MenuItem } from "@mui/joy";
import { colors } from "@/src/utils/Colors";
import { deleteData, updateData } from "@/src/api_function";
import { PeopleAltTwoTone } from "@mui/icons-material";

interface RoomCardProps {
  id: string;
  image: string;
  status: string;
  floor: string;
  roomNumber: string;
  roomType: string;
  type: string;
  price: string;
  guests: number;
  capacity?: string;
  amenities: string[];
  onDeleted: () => void;
  onClick: () => void;
  onStatusUpdate?: (id: string, newStatus: string) => void;
  onUpdate?: () => void;
}

const RoomCard: React.FC<RoomCardProps> = ({
  id,
  image,
  status,
  floor,
  roomNumber,
  roomType,
  price,
  capacity,
  guests,
  amenities,
  onDeleted,
  onClick,
  onStatusUpdate,
  onUpdate,
}) => {
  // local state (initialize with prop)
  const [room_status, setRoomStatus] = React.useState(status);

  const deleteRoom = async () => {
    try {
      await deleteData(id, "room");
      onDeleted();
    } catch (err) {
      console.error("Failed to delete room:", err);
    }
  };

  const updateRoomStatus = async (newStatus: string) => {
    try {
      await updateData(id, { status: newStatus }, "room");
      setRoomStatus(newStatus); // update UI immediately
      onStatusUpdate?.(id, newStatus);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Failed to update room status:", err);
    }
  };

  const getStatusIcon = (s: string) => {
    switch (s) {
      case "Available":
        return <CheckCircleIcon />;
      case "Reserved":
        return <EventSeatIcon />;
      case "Occupied":
        return <HotelIcon />;
      case "Maintenance":
        return <BuildIcon />;
      default:
        return <EditIcon />;
    }
  };

  const statuses = ["Available", "Reserved", "Occupied", "Maintenance"];

  return (
    <Card variant="outlined" sx={{ maxWidth: "100%", borderRadius: 8 }}>
      <Box sx={{ position: "relative" }}>
        <img
          src={image}
          alt={roomNumber}
          style={{ width: "100%", height: "300px", borderRadius: 6 }}
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
          <Grid xs={6}>
            <Typography level="h4"> Room {roomNumber}</Typography>
            <Typography level="body-sm" color="neutral">
              {roomType}
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

        <Typography
          startDecorator={<PeopleAltTwoTone sx={{ fontSize: "1.25rem" }} />}
          level="body-md"
          color="neutral"
        >
          Capacity: {capacity}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: "center" }}>
        <Button onClick={onClick} fullWidth variant="solid">
          View Details
        </Button>

        {/* Dropdown for Status Update */}
        <Dropdown>
          <MenuButton
            slots={{ root: IconButton }}
            slotProps={{
              root: { variant: "solid", style: { borderRadius: 8 } },
            }}
          >
            {getStatusIcon(room_status)}
          </MenuButton>
          <Menu>
            {statuses.map((s) => (
              <MenuItem
                key={s}
                onClick={() => updateRoomStatus(s)} // call API + update state
                selected={room_status === s}
              >
                {getStatusIcon(s)}
                <Typography sx={{ ml: 1 }}>{s}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </Dropdown>

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
