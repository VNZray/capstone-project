import React from "react";
import { Box, Grid } from "@mui/joy";
import Typography from "@/src/components/Typography";
import ImageUpload from "@/src/components/ImageUpload";
import { colors } from "@/src/utils/Colors";
import type { Business } from "@/src/types/Business";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
};

const Step5Photos: React.FC<Props> = ({ data, setData }) => {
  const handleUploadComplete = (publicUrl: string) => {
    setData((prev) => ({
      ...prev,
      business_image: publicUrl,
    }));
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: "center" }}>
        <Typography.CardTitle size="md" sx={{ mb: 1, color: colors.primary }}>
          Business Photos
        </Typography.CardTitle>
        <Typography.Body size="sm" sx={{ color: colors.gray }}>
          Upload photos to showcase your business
        </Typography.Body>
      </Box>

      {/* Upload Area */}
      <Grid container spacing={3} justifyContent="center">
        <Grid xs={12} md={8}>
          <Box
            sx={{
              p: 3,
              backgroundColor: colors.white,
              borderRadius: "12px",
              border: `1px solid ${colors.offWhite}`,
            }}
          >
            <Typography.Label size="sm" sx={{ mb: 2, display: "block" }}>
              Main Business Image
            </Typography.Label>
            <ImageUpload
              folderName="businesses"
              uploadTo="business-images"
              onUploadComplete={handleUploadComplete}
              placeholder="Upload your main business photo"
              maxSizeMB={5}
              storeLocally={false}
            />
            {data.business_image && (
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <img
                  src={data.business_image}
                  alt="Business preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "300px",
                    borderRadius: "8px",
                    objectFit: "cover",
                  }}
                />
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Step5Photos;
