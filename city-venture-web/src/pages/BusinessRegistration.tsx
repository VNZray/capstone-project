import { Button } from "@mui/joy";
import PageContainer from "../components/PageContainer";
import Stepper from "../components/Stepper";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Container from "../components/Container";
import Step1 from "./components/Step1";
import Step2 from "./components/Step2";
import Step3 from "./components/Step3";
import Step4 from "./components/Step4";
import Step5 from "./components/Step5";
import type { Business, BusinessHours, Registration } from "../types/Business";
import type { Address } from "../types/Address";
import type { Permit } from "../types/Permit";
import type { BusinessAmenity } from "../types/Amenity";
import axios from "axios";
import api from "../services/api";
import type { Owner } from "../types/Owner";
import type { User } from "../types/User";

const steps = [
  "Business Information",
  "Owner Information",
  "Address",
  "Business Permits",
  "Review & Submit",
];

// Props passed down to each step component
type CommonProps = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  addressData: Address;
  setAddressData: React.Dispatch<React.SetStateAction<Address>>;
  userData: User;
  setUserData: React.Dispatch<React.SetStateAction<User>>;
  ownerData: Owner;
  setOwnerData: React.Dispatch<React.SetStateAction<Owner>>;
  bookingSite: { name: string; link: string }[];
  setBookingSites: React.Dispatch<
    React.SetStateAction<{ name: string; link: string }[]>
  >;
  permitData: Permit[];
  businessHours: BusinessHours[];
  businessAmenities: BusinessAmenity[];
  setPermitData: React.Dispatch<React.SetStateAction<Permit[]>>;
  setBusinessHours: React.Dispatch<React.SetStateAction<BusinessHours[]>>;
  setBusinessAmenities: React.Dispatch<React.SetStateAction<BusinessAmenity[]>>;
};

const BusinessRegistration = () => {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [externalBookings, setExternalBookings] = useState<
    { name: string; link: string }[]
  >([]);

  const [userData, setUserData] = useState<User>({
    email: "juan@gmail.com",
    phone_number: "9380410303",
    password: "123456",
    barangay_id: 3,
    user_role_id: 4,
  });

  const [ownerData, setOwnerData] = useState<Owner>({
    first_name: "Juan",
    last_name: "Dela Cruz",
    middle_name: "Santos",
    age: "30",
    birthdate: "1993-01-01",
    gender: "Male",
  });

  const [formData, setFormData] = useState<Business>({
    id: "",
    business_image: "",
    business_name: "Kim Angela Homestay",
    phone_number: "09380417373",
    email: "kim@gmail.com",
    description: "This place is great",
    address: "123 Street, City",
    longitude: "",
    latitude: "",
    owner_id: "",
    business_category_id: 0,
    business_type_id: 0,
    barangay_id: 0,
    status: "Pending",
    hasBooking: false,
  });

  const [registrationData] = useState<Registration>({
    id: "",
    business_id: "",
    status: "Pending",
    message: "",
    tourism_id: "",
  });

  const [addressData, setAddressData] = useState<Address>({
    barangay_id: 3,
    municipality_id: 24,
    province_id: 20,
  });

  const [permitData, setPermitData] = useState<Permit[]>([]);
  const [businessAmenities, setBusinessAmenities] = useState<BusinessAmenity[]>(
    []
  );

  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([
    {
      day_of_week: "Monday",
      business_id: "",
      open_time: "08:00",
      close_time: "22:00",
      is_open: false,
    },
    {
      day_of_week: "Tuesday",
      business_id: "",
      open_time: "08:00",
      close_time: "22:00",
      is_open: false,
    },
    {
      day_of_week: "Wednesday",
      business_id: "",
      open_time: "08:00",
      close_time: "22:00",
      is_open: false,
    },
    {
      day_of_week: "Thursday",
      business_id: "",
      open_time: "08:00",
      close_time: "22:00",
      is_open: false,
    },
    {
      day_of_week: "Friday",
      business_id: "",
      open_time: "08:00",
      close_time: "22:00",
      is_open: false,
    },
    {
      day_of_week: "Saturday",
      business_id: "",
      open_time: "08:00",
      close_time: "22:00",
      is_open: false,
    },
    {
      day_of_week: "Sunday",
      business_id: "",
      open_time: "08:00",
      close_time: "22:00",
      is_open: false,
    },
  ]);

  if (!formData) return null;
  const handleNext = () => {
    if (submitting) return; // avoid double submit
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    } else {
      navigate("/"); // Go back to business list if on first step
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Create User first if needed (endpoint: /api/users)
      let effectiveUserId = userData.id;
      if (!effectiveUserId) {
        const userRes = await axios.post(`${api}/users`, {
          ...userData,
        });
        effectiveUserId = userRes?.data?.id;
        if (!effectiveUserId) throw new Error("User creation failed");
        // keep state in sync for any subsequent steps
        setUserData((prev) => ({ ...prev, id: effectiveUserId! }));
      }

      // If no owner created yet, create it now from Step 2 data
      let effectiveOwnerId = formData.owner_id;
      if (!effectiveOwnerId) {
        const ownerRes = await axios.post(`${api}/owner`, {
          ...ownerData,
          user_id: effectiveUserId,
        });
        const ownerId = ownerRes?.data?.id;
        if (!ownerId) throw new Error("Owner creation failed");
        effectiveOwnerId = ownerId;
        // set for subsequent UI uses
        setFormData((prev) => ({ ...prev, owner_id: ownerId }));
      }

      // Insert Business
      const res = await axios.post(`${api}/business`, {
        ...formData,
        owner_id: effectiveOwnerId,
        barangay_id: addressData.barangay_id || formData.barangay_id,
      });

      const businessId = res.data.id;
      console.log(businessId);

      // Insert External Bookings (if any)
      if (externalBookings.length > 0) {
        await Promise.all(
          externalBookings.map((site) => {
            if (!site.name || !site.link) return null; // skip empty

            return axios.post(`${api}/external-booking`, {
              business_id: businessId,
              name: site.name,
              link: site.link,
            });
          })
        );
      }

      if (businessHours.length > 0) {
        await Promise.all(
          businessHours.map((hours) =>
            axios.post(`${api}/business-hours`, {
              business_id: businessId,
              day_of_week: hours.day_of_week,
              open_time: hours.open_time,
              close_time: hours.close_time,
              is_open: hours.is_open,
            })
          )
        );
      }

      if (businessAmenities.length > 0) {
        await Promise.all(
          businessAmenities.map((amenity) =>
            axios.post(`${api}/business-amenities`, {
              business_id: businessId,
              amenity_id: amenity.amenity_id,
            })
          )
        );
      }

      if (permitData.length > 0) {
        await Promise.all(
          permitData.map((permit) =>
            axios.post(`${api}/permit`, {
              business_id: businessId,
              permit_type: permit.permit_type,
              file_url: permit.file_url,
              file_format: permit.file_format,
              file_size: permit.file_size,
              status: permit.status || "Pending",
            })
          )
        );
      }

      // Insert Business Registration
      const registration = await axios.post(`${api}/registration`, {
        ...registrationData,
        business_id: businessId,
      });

      console.log("Registration response:", registration.data);

      console.log("✅ Business registration submitted successfully");
      navigate("/business");
    } catch (error) {
      console.error("❌ Failed to submit registration:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const commonProps: CommonProps = {
    data: formData,
    addressData,
    setAddressData,
    userData,
    setUserData,
    ownerData,
    setOwnerData,
    bookingSite: externalBookings,
    setBookingSites: setExternalBookings,
    permitData,
    businessHours,
    businessAmenities,
    setPermitData,
    setBusinessHours,
    setBusinessAmenities,
    setData: setFormData,
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <Step1 {...commonProps} />;
      case 1:
        return <Step2 {...commonProps} />;
      case 2:
        return <Step3 {...commonProps} />;
      case 3:
        return <Step4 {...commonProps} />;
      case 4:
        return <Step5 {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <PageContainer
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Container
        style={{
          width: "min(100%, clamp(40rem, calc(40vw + 0rem), 70rem))",
          maxWidth: "100%",
          margin: "0 auto",
          padding: 0,
          // add bottom padding so content isn't hidden behind fixed buttons
          paddingBottom: "5rem",
          gap: 0,
        }}
      >
        <Container>
          <Stepper
            currentStep={activeStep}
            steps={steps}
            orientation="horizontal"
          />
        </Container>

        {renderStepContent(activeStep)}

        {/* Fixed action bar at bottom */}
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1200,
            background: "#fff",
            borderTop: "1px solid rgba(0,0,0,0.08)",
            // iOS/Android like elevated feel on web
            boxShadow: "0 -2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              width: "min(100%, clamp(25rem, calc(40vw + 0rem), 70rem))",
              margin: "0 auto",
              padding: "0.75rem 1rem",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button
              size="md"
              variant="soft"
              color="neutral"
              onClick={handleBack}
              aria-label="Back"
              sx={{
                minWidth: "100px",
                fontWeight: 500,
              }}
            >
              Back
            </Button>
            <Button
              size="md"
              variant="solid"
              color="primary"
              onClick={handleNext}
              loading={submitting && activeStep === steps.length - 1}
              disabled={submitting}
              aria-label={
                activeStep === steps.length - 1
                  ? "Submit registration"
                  : "Next step"
              }
              sx={{
                minWidth: "100px",
                fontWeight: 500,
              }}
            >
              {activeStep === steps.length - 1 ? "Submit" : "Next"}
            </Button>
          </div>
        </div>
      </Container>
    </PageContainer>
  );
};

export default BusinessRegistration;
