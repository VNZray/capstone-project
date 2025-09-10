import * as React from "react";
import {
  Modal,
  ModalDialog,
  DialogContent,
  DialogActions,
  Button,
  Input,
  FormControl,
  FormLabel,
  Grid,
} from "@mui/joy";
import { updateData } from "@/src/services/Service";
import CardHeader from "@/src/components/CardHeader";
import { Add, Email, PhoneOutlined } from "@mui/icons-material";
import Container from "@/src/components/Container";
import { colors } from "@/src/utils/Colors";
import Text from "@/src/components/Text";
import MapInput from "@/src/components/MapInput";

interface EditDescriptionModalProps {
  open: boolean;
  initialLatitude?: string;
  initialLongitude?: string;
  businessId?: string;
  onClose: () => void;
  onSave: (latitude: string, longitude: string) => void;
  onUpdate?: () => void;
}

const EditMapCoordinatesModal: React.FC<EditDescriptionModalProps> = ({
  open,
  initialLatitude = "",
  initialLongitude = "",
  businessId,
  onClose,
  onSave,
  onUpdate,
}) => {
  const [latitude, setLatitude] = React.useState(initialLatitude);
  const [longitude, setLongitude] = React.useState(initialLongitude);

  React.useEffect(() => {
    setLatitude(initialLatitude);
    setLongitude(initialLongitude);
  }, [initialLatitude, initialLongitude, open]);

  const handleSave = async () => {
    if (businessId) {
      try {
        await updateData(businessId, { latitude, longitude }, "business");
        onSave(latitude, longitude);
      } catch (err) {
        console.error("Failed to update business contact", err);
      }
    } else {
      onSave(latitude, longitude);
    }

    if (onUpdate) onUpdate();
    onClose();
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toString();
        const lng = position.coords.longitude.toString();

        setLatitude(lat);
        setLongitude(lng);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert(
          "Unable to retrieve your location. Please allow location access."
        );
      }
    );
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog size="lg" variant="outlined" maxWidth={600} minWidth={600}>
        <CardHeader title="Edit Map Coordinates" color="white" />
        <DialogContent>
          <Container padding="0" gap="20px" style={{ overflow: "hidden" }}>
            <Container
              background={colors.secondary}
              elevation={2}
              padding="20px"
            >
              <Grid container spacing={2} columns={12}>
                <Grid xs={8}>
                  <Text color="white" variant="card-title">
                    Map Coordinates
                  </Text>
                  <Text color="white" variant="card-sub-title">
                    Pin the location of your business in the map
                  </Text>
                </Grid>
                <Grid xs={4}>
                  <Button
                    fullWidth
                    variant="soft"
                    color="neutral"
                    size="sm"
                    style={{ height: "100%" }}
                    startDecorator={<Add />}
                    onClick={handleGetCurrentLocation}
                  >
                    Locate
                  </Button>
                </Grid>
              </Grid>
            </Container>
            <Container padding="0">
              <Grid container spacing={3} columns={12}>
                <Grid xs={6}>
                  <FormControl required>
                    <FormLabel>Longitude</FormLabel>
                    <Input
                      variant="outlined"
                      size="md"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                    />
                  </FormControl>
                </Grid>
                <Grid xs={6}>
                  <FormControl required>
                    <FormLabel>Latitude</FormLabel>

                    <Input
                      variant="outlined"
                      size="md"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <MapInput
                latitude={latitude}
                longitude={longitude}
                onChange={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
              />
            </Container>
          </Container>
        </DialogContent>
        <DialogActions>
          <Button fullWidth variant="plain" color="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button fullWidth color="primary" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};

export default EditMapCoordinatesModal;
