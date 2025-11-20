import {
  Modal,
  Input,
  FormControl,
  FormLabel,
  Select,
  Option,
  Stack,
  Divider,
  Box,
  Chip,
} from "@mui/joy";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import FileUpload from "@/src/components/FileUpload";
import Container from "@/src/components/Container";

interface PermitModalProps {
  open: boolean;
  onClose: () => void;
  permitForm: {
    permit_type: string;
    file_url: string;
    file_name: string;
    expiration_date: string;
  };
  selectedPermit: any;
  currentBusinessId: string;
  businessName: string;
  permitTypes: string[];
  onPermitFormChange: (field: string, value: string) => void;
  onFileUpload: (url: string, fileName: string) => void;
  onSubmit: () => void;
}

const PermitModal = ({
  open,
  onClose,
  permitForm,
  selectedPermit,
  currentBusinessId,
  businessName,
  permitTypes,
  onPermitFormChange,
  onFileUpload,
  onSubmit,
}: PermitModalProps) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Container
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: 8,
        }}
        width="clamp(10rem, 90vw, 25rem)"
        background="white"
      >
        <Typography.CardTitle size="sm">
          {selectedPermit ? "Update Permit" : "Upload New Permit"}
        </Typography.CardTitle>
        <Divider />

        <Stack spacing={3}>
          <FormControl required>
            <FormLabel>
              <Typography.Label size="sm">Permit Type</Typography.Label>
            </FormLabel>
            <Select
              value={permitForm.permit_type}
              onChange={(_, value) =>
                onPermitFormChange("permit_type", value || "")
              }
              placeholder="Select permit type"
              disabled={!!selectedPermit}
            >
              {permitTypes.map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </FormControl>

          <FormControl required>
            <FormLabel>
              <Typography.Label size="sm">Expiration Date</Typography.Label>
            </FormLabel>
            <Input
              type="date"
              value={permitForm.expiration_date}
              onChange={(e) =>
                onPermitFormChange("expiration_date", e.target.value)
              }
              placeholder="Select expiration date"
            />
          </FormControl>

          <Box>
            <Typography.Label size="sm">Upload File</Typography.Label>
            <FileUpload
              folderName={`business-permits/${
                businessName || currentBusinessId
              }`}
              uploadTo={`permits`}
              onUploadComplete={onFileUpload}
              placeholder={
                selectedPermit
                  ? "Upload new file to replace existing"
                  : "Upload permit document"
              }
              accept=".pdf,.jpg,.jpeg,.png"
              maxSizeMB={10}
              allowedTypes={[
                "application/pdf",
                "image/jpeg",
                "image/jpg",
                "image/png",
              ]}
            />
            {permitForm.file_url && (
              <Box sx={{ mt: 1 }}>
                <Chip size="sm" color="success" variant="soft">
                  File uploaded successfully
                </Chip>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              colorScheme="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              colorScheme="primary"
              onClick={onSubmit}
              disabled={
                !currentBusinessId ||
                !permitForm.permit_type ||
                !permitForm.file_url ||
                !permitForm.expiration_date
              }
            >
              {selectedPermit ? "Update Permit" : "Submit Permit"}
            </Button>
          </Box>
        </Stack>
      </Container>
    </Modal>
  );
};

export default PermitModal;
