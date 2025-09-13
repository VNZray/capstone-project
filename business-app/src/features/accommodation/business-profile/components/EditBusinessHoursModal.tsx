import * as React from "react";
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Switch,
  Input,
  FormControl,
  FormLabel,
} from "@mui/joy";
import { updateData } from "@/src/services/Service";
import CardHeader from "@/src/components/CardHeader";
import Container from "@/src/components/Container";
import type { BusinessHours } from "@/src/types/Business";
import { Save } from "@mui/icons-material";

interface EditBusinessHoursModalProps {
  open: boolean;
  businessId?: string;
  initialBusinessHours: BusinessHours[];
  onClose: () => void;
  onUpdate?: (updatedHours: BusinessHours[]) => void;
}

const EditBusinessHoursModal: React.FC<EditBusinessHoursModalProps> = ({
  open,
  businessId,
  initialBusinessHours,
  onClose,
  onUpdate,
}) => {
  const [hours, setHours] = React.useState<BusinessHours[]>(initialBusinessHours);

  React.useEffect(() => {
    setHours(initialBusinessHours);
  }, [initialBusinessHours, open]);

  const handleSave = async () => {
    try {
      if (businessId) {
        // loop through each day and update
        for (const h of hours) {
          await updateData(
            h.id !== undefined ? String(h.id) : "", // ensure id is a string
            {
              day_of_week: h.day_of_week,
              open_time: h.open_time,
              close_time: h.close_time,
              is_open: h.is_open,
            },
            "business-hours"
          );
        }
      }
      if (onUpdate) onUpdate(hours);
      onClose();
    } catch (err) {
      console.error("Failed to update business hours", err);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog size="lg" variant="outlined" sx={{ width: 600 }}>
        <CardHeader title="Edit Business Hours" color="white" />

        <DialogContent>
          <FormControl>
            <FormLabel>Business Hours</FormLabel>

            {hours.map((hour, index) => (
              <Container
                key={hour.day_of_week}
                padding="12px 0"
                align="center"
                direction="row"
                style={{ gap: "12px" }}
              >
                <Typography level="body-sm" style={{ width: "80px" }}>
                  {hour.day_of_week}
                </Typography>

                <Input
                  size="md"
                  type="time"
                  value={hour.open_time}
                  readOnly={!hour.is_open}
                  onChange={(e) => {
                    const newTime = e.target.value;
                    setHours((prev) =>
                      prev.map((h, i) =>
                        i === index ? { ...h, open_time: newTime } : h
                      )
                    );
                  }}
                />

                <Input
                  size="md"
                  type="time"
                  value={hour.close_time}
                  readOnly={!hour.is_open}
                  onChange={(e) => {
                    const newTime = e.target.value;
                    setHours((prev) =>
                      prev.map((h, i) =>
                        i === index ? { ...h, close_time: newTime } : h
                      )
                    );
                  }}
                />

                <Typography level="body-sm">
                  {hour.is_open ? "Open" : "Closed"}
                </Typography>
                <Switch
                  checked={hour.is_open}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setHours((prev) =>
                      prev.map((h, i) =>
                        i === index ? { ...h, is_open: checked } : h
                      )
                    );
                  }}
                />
              </Container>
            ))}
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button fullWidth variant="plain" color="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button fullWidth color="primary" startDecorator={<Save />} onClick={handleSave}>
            Save Changes
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};

export default EditBusinessHoursModal;
