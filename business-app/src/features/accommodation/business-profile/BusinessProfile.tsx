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
import { Button } from "@mui/joy";
import BusinessMap from "./components/businessMap"; // <-- new import
import { Add, AddBox, AddBusiness, EditDocument } from "@mui/icons-material";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";


const BusinessProfile = () => {
  const { businessDetails } = useBusiness();
  const { address, loading } = useAddress(businessDetails?.barangay_id);

  return (
    <PageContainer
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
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
                <LocationOnIcon
                  style={{ color: colors.success }}
                  fontSize="medium"
                />
                {address?.barangay_name}, {address?.municipality_name},{" "}
                {address?.province_name}
              </Text>
              <Text variant="medium" color={colors.gray}>
                <StarIcon style={{ color: colors.yellow }} fontSize="medium" />
                Review
              </Text>
            </div>
          </div>

          <div
            style={{ display: "flex", gap: "12px", height: 50, width: "26%" }}
          >
            <Button
              color="primary"
              size="lg"
              variant="outlined"
              style={{ flex: 1, minHeight: "50px" }}
              startDecorator={<EditIcon />}
            >
              Edit Business
            </Button>

            <Button
              color="primary"
              size="lg"
              variant="solid"
              style={{ flex: 1, minHeight: "50px" }}
              startDecorator={<Add />}
            >
              Add Room
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

export default BusinessProfile;
