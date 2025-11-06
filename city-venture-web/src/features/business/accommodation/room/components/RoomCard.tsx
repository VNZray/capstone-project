import * as React from "react";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import CardActions from "@mui/joy/CardActions";
import Typography from "@mui/joy/Typography";
import Chip from "@mui/joy/Chip";
import Box from "@mui/joy/Box";
// import IconButton from "@mui/joy/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HotelIcon from "@mui/icons-material/Hotel"; // Occupied
import BuildIcon from "@mui/icons-material/Build"; // Maintenance
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Available
import EventSeatIcon from "@mui/icons-material/EventSeat"; // Reserved
import { Grid, Dropdown, Menu, MenuButton, MenuItem } from "@mui/joy";
import { colors } from "@/src/utils/Colors";
import { deleteData, updateData } from "@/src/services/Service";
import { PeopleAltTwoTone } from "@mui/icons-material";
import Container from "@/src/components/Container";
import IconButton from "@/src/components/IconButton";
import { Delete, Trash } from "lucide-react";
import Button from "@/src/components/Button";

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
    <Container elevation={2}>
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
          Capacity: {capacity} · Guests: {guests}
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

      <CardActions
        sx={{
          justifyContent: "center",
          alignItems: { xs: "stretch", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 1,
        }}
      >
        {/* <Button onClick={onClick} fullWidth variant="solid">
          View Details
        </Button> */}

        <Button onClick={onClick} fullWidth variant="solid">
          View Details
        </Button>

        {/* Controls group: status dropdown + delete */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "space-between", sm: "center" },
          }}
        >
          {/* Dropdown for Status Update */}
          <Dropdown>
            <MenuButton
              slots={{ root: IconButton }}
              slotProps={{
                root: {
                  variant: "soft",
                  colorScheme: "secondary",
                  sx: { borderRadius: 2, flex: "0 0 auto" },
                },
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

          <IconButton colorScheme="red" variant="soft" onClick={deleteRoom}>
            <Trash />
          </IconButton>
        </Box>
      </CardActions>
    </Container>
  );
};

export default RoomCard;
