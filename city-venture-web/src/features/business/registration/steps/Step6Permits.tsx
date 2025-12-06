import React from "react";
import { Box, Grid, IconButton } from "@mui/joy";
import { Plus, Trash2 } from "lucide-react";
import Typography from "@/src/components/Typography";
import FileUpload from "@/src/components/FileUpload";
import { colors } from "@/src/utils/Colors";
import type { Permit } from "@/src/types/Permit";

type Props = {
  permitData: Permit[];
  setPermitData: React.Dispatch<React.SetStateAction<Permit[]>>;
};

const Step6Permits: React.FC<Props> = ({ permitData, setPermitData }) => {
  const addPermit = () => {
    setPermitData((prev) => [
      ...prev,
      {
        id: "",
        business_id: "",
        permit_type: "",
        file_url: "",
        file_format: "",
        file_size: 0,
        status: "pending" as const,
        submitted_at: new Date().toISOString(),
      },
    ]);
  };

  const removePermit = (index: number) => {
    setPermitData((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePermit = (index: number, field: keyof Permit, value: string) => {
    setPermitData((prev) =>
      prev.map((permit, i) =>
        i === index ? { ...permit, [field]: value } : permit
      )
    );
  };

  const handlePermitUpload = (index: number, publicUrl: string) => {
    updatePermit(index, "file_url", publicUrl);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: "center" }}>
        <Typography.CardTitle size="md" sx={{ mb: 1, color: colors.primary }}>
          Business Permits
        </Typography.CardTitle>
        <Typography.Body size="sm" sx={{ color: colors.gray }}>
          Upload your business permits and licenses
        </Typography.Body>
      </Box>

      {/* Permits */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        <IconButton
          size="md"
          variant="soft"
          color="primary"
          onClick={addPermit}
          sx={{
            borderRadius: "8px",
            px: 2,
            gap: 1,
          }}
        >
          <Plus size={18} />
          <Typography.Body size="sm">Add Permit</Typography.Body>
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {permitData.length === 0 ? (
          <Grid xs={12}>
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                backgroundColor: colors.offWhite,
                borderRadius: "12px",
                border: `2px dashed ${colors.gray}`,
              }}
            >
              <Typography.Body size="sm" sx={{ color: colors.gray, mb: 2 }}>
                No permits added yet. Click "Add Permit" to get started.
              </Typography.Body>
            </Box>
          </Grid>
        ) : (
          permitData.map((_permit, index) => (
            <Grid xs={12} key={index}>
              <Box
                sx={{
                  p: 3,
                  backgroundColor: colors.white,
                  borderRadius: "12px",
                  border: `1px solid ${colors.offWhite}`,
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography.Label size="sm">
                    Permit #{index + 1}
                  </Typography.Label>
                  <IconButton
                    size="sm"
                    variant="soft"
                    color="danger"
                    onClick={() => removePermit(index)}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Box>

                <FileUpload
                  folderName="permits"
                  uploadTo="business-permits"
                  onUploadComplete={(publicUrl) =>
                    handlePermitUpload(index, publicUrl)
                  }
                  placeholder="Upload permit document"
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxSizeMB={10}
                  allowedTypes={[
                    "application/pdf",
                    "image/jpeg",
                    "image/jpg",
                    "image/png",
                  ]}
                  storeLocally={false}
                />
              </Box>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default Step6Permits;
