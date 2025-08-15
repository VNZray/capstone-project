import PageContainer from "@/src/components/PageContainer";
import Text from "@/src/components/Text";
import React from "react";
import Paper from "@mui/material/Paper";
import { useBusiness } from "@/src/context/BusinessContext";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { useAddress } from "@/src/hooks/useAddress";
import { colors } from "@/src/utils/Colors";
import { Button } from "@mui/material";
import BusinessMap from "./components/businessMap"; // <-- new import

const ManageBusiness = () => {
  const { businessDetails, API_URL } = useBusiness();

  const { fullAddress } = useAddress(
    API_URL,
    businessDetails?.province_id,
    businessDetails?.municipality_id,
    businessDetails?.barangay_id
  );

  return (
    <PageContainer
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: 0,
      }}
    >
      <Paper
        elevation={3}
        style={{
          padding: "20px",
          display: "flex",
          alignItems: "center",
          borderRadius: "20px",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div
          style={{
            padding: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderRadius: "20px",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              width={120}
              height={120}
              className="card-image"
              src={businessDetails?.business_image || ""}
              style={{ borderRadius: "10px" }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Text variant="title" color={colors.primary}>
                {businessDetails?.business_name || "Business Name"}
              </Text>
              <Text variant="medium" color={colors.gray}>
                <LocationOnIcon style={{ color: colors.success }} fontSize="medium" />
                {fullAddress}
              </Text>
              <Text variant="medium" color={colors.gray}>
                <StarIcon style={{ color: colors.yellow }} fontSize="medium" />
                Review
              </Text>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", height: 50, width: "30%" }}>
            <Button
              style={{ flex: 1, backgroundColor: colors.tertiary }}
              variant="contained"
              startIcon={<EditIcon style={{ color: colors.dark }} fontSize="large" />}
            >
              <Text>Edit Business</Text>
            </Button>
            <Button
              style={{ flex: 1 }}
              variant="contained"
              startIcon={<AddIcon style={{ color: colors.white }} fontSize="large" />}
            >
              <Text color={colors.white}>Add Room</Text>
            </Button>
          </div>
        </div>

        {/* Map Component */}
        <BusinessMap
          latitude={businessDetails?.latitude}
          longitude={businessDetails?.longitude}
          name={businessDetails?.business_name}
        />
      </Paper>

      <Paper
        elevation={3}
        style={{
          padding: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "20px",
        }}
      >
        <div>
          <Text variant="title" color={colors.primary}>
            Tab Here
          </Text>
        </div>
      </Paper>
    </PageContainer>
  );
};

export default ManageBusiness;
