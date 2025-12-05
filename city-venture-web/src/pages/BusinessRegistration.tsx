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
import apiClient from "../services/apiClient";
import type { Owner } from "../types/Owner";
import type { User } from "../types/User";
import {
  initializeEmailJS,
  sendAccountCredentials,
} from "../services/email/EmailService";

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
    email: "sample.business@gmail.com",
    phone_number: "09123456789",
    password: "SamplePass123!",
    barangay_id: 3,
    user_role_id: 4,
  });

  const [ownerData, setOwnerData] = useState<Owner>({
    first_name: "Maria",
    last_name: "Santos",
    middle_name: "Cruz",
    age: "35",
    birthdate: "1989-05-15",
    gender: "Female",
  });

  const [formData, setFormData] = useState<Business>({
    id: "",
    business_image: "",
    business_name: "Sample Restaurant & Café",
    phone_number: "09171234567",
    email: "contact@samplerestaurant.com",
    description:
      "A cozy family-friendly restaurant offering authentic Filipino cuisine and specialty coffee. We pride ourselves on using fresh local ingredients and providing excellent service in a warm, welcoming atmosphere.",
    address: "123 Main Street, Corner Rizal Avenue, Barangay Centro",
    longitude: "121.0244",
    latitude: "14.5547",
    owner_id: "",
    category_ids: [],
    primary_category_id: undefined,
    barangay_id: 3,
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

  // Initialize EmailJS
  useEffect(() => {
    initializeEmailJS();
  }, []);

  if (!formData) return null;

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Business Information
        if (!formData.business_name?.trim()) {
          alert("Please enter business name");
          return false;
        }
        if (!formData.phone_number?.trim()) {
          alert("Please enter phone number");
          return false;
        }
        if (!formData.email?.trim()) {
          alert("Please enter email");
          return false;
        }
        if (!formData.category_ids || formData.category_ids.length === 0) {
          alert("Please select at least one category");
          return false;
        }
        break;
      case 1: // Owner Information
        if (!ownerData.first_name?.trim()) {
          alert("Please enter first name");
          return false;
        }
        if (!ownerData.last_name?.trim()) {
          alert("Please enter last name");
          return false;
        }
        if (!userData.email?.trim()) {
          alert("Please enter email");
          return false;
        }
        if (!userData.password?.trim()) {
          alert("Please enter password");
          return false;
        }
        break;
      case 2: // Address
        if (!addressData.barangay_id) {
          alert("Please select barangay");
          return false;
        }
        if (!formData.address?.trim()) {
          alert("Please enter address");
          return false;
        }
        break;
      case 3: // Permits
        if (permitData.length === 0) {
          alert(
            "Please upload at least one permit (Business Permit or Mayor's Permit)"
          );
          return false;
        }
        // Check if all permits have expiration dates
        const permitsWithoutExpiration = permitData.filter(
          (permit) => !permit.expiration_date
        );
        if (permitsWithoutExpiration.length > 0) {
          alert("Please provide expiration dates for all permits");
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (submitting) return; // avoid double submit

    // Validate current step before proceeding
    if (!validateStep(activeStep)) {
      return;
    }

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

      // Validate permits before submission
      if (permitData.length === 0) {
        alert("Please upload at least one permit before submitting");
        return;
      }

      const permitsWithoutExpiration = permitData.filter(
        (permit) => !permit.expiration_date
      );
      if (permitsWithoutExpiration.length > 0) {
        alert("All permits must have expiration dates");
        return;
      }

      // Create User first if needed (endpoint: /api/users)
      let effectiveUserId = userData.id;
      if (!effectiveUserId) {
        const userRes = await apiClient.post(`/users`, {
          ...userData,
        });
        effectiveUserId = userRes?.data?.id;
        if (!effectiveUserId) {
          throw new Error(
            "Failed to create user account. Please check your email and try again."
          );
        }
        // keep state in sync for any subsequent steps
        setUserData((prev) => ({ ...prev, id: effectiveUserId! }));

        // Send account credentials via email
        try {
          await sendAccountCredentials(
            userData.email,
            `${ownerData.first_name} ${ownerData.last_name}`,
            userData.email,
            userData.password || "owner123"
          );
        } catch (emailError) {
          console.error("Failed to send credentials email:", emailError);
          // Don't fail the whole registration if email fails
        }
      }

      // If no owner created yet, create it now from Step 2 data
      let effectiveOwnerId = formData.owner_id;
      if (!effectiveOwnerId) {
        const ownerRes = await apiClient.post(`/owner`, {
          ...ownerData,
          user_id: effectiveUserId,
        });
        const ownerId = ownerRes?.data?.id;
        if (!ownerId) {
          throw new Error("Failed to create owner profile. Please try again.");
        }
        effectiveOwnerId = ownerId;
        // set for subsequent UI uses
        setFormData((prev) => ({ ...prev, owner_id: ownerId }));
      }

      // Insert Business
      const res = await apiClient.post(`/business`, {
        ...formData,
        owner_id: effectiveOwnerId,
        barangay_id: addressData.barangay_id || formData.barangay_id,
      });

      const businessId = res.data.id;
      if (!businessId) {
        throw new Error("Failed to create business. Please try again.");
      }
      console.log("Business created with ID:", businessId);

      // Insert External Bookings (if any)
      if (externalBookings.length > 0) {
        try {
          await Promise.all(
            externalBookings.map((site) => {
              if (!site.name || !site.link) return null; // skip empty

              return apiClient.post(`/external-booking`, {
                business_id: businessId,
                name: site.name,
                link: site.link,
              });
            })
          );
        } catch (bookingError) {
          console.error("Failed to save external bookings:", bookingError);
          // Continue with registration even if external bookings fail
        }
      }

      // Insert Business Hours
      if (businessHours.length > 0) {
        try {
          await Promise.all(
            businessHours.map((hours) =>
              apiClient.post(`/business-hours`, {
                business_id: businessId,
                day_of_week: hours.day_of_week,
                open_time: hours.open_time,
                close_time: hours.close_time,
                is_open: hours.is_open,
              })
            )
          );
        } catch (hoursError) {
          console.error("Failed to save business hours:", hoursError);
          // Continue with registration
        }
      }

      // Insert Business Amenities
      if (businessAmenities.length > 0) {
        try {
          await Promise.all(
            businessAmenities.map((amenity) =>
              apiClient.post(`/business-amenities`, {
                business_id: businessId,
                amenity_id: amenity.amenity_id,
              })
            )
          );
        } catch (amenityError) {
          console.error("Failed to save amenities:", amenityError);
          // Continue with registration
        }
      }

      // Insert Permits - THIS IS CRITICAL, must succeed
      if (permitData.length > 0) {
        try {
          await Promise.all(
            permitData.map((permit) => {
              if (!permit.file_url || !permit.permit_type) {
                throw new Error(`Invalid permit data: ${permit.permit_type}`);
              }
              return apiClient.post(`/permit`, {
                business_id: businessId,
                permit_type: permit.permit_type,
                file_url: permit.file_url,
                file_format: permit.file_format,
                file_size: permit.file_size,
                file_name: permit.file_name,
                status: permit.status || "pending",
                expiration_date: permit.expiration_date,
              });
            })
          );
          console.log("✅ Permits saved successfully");
        } catch (permitError) {
          console.error("❌ Failed to save permits:", permitError);
          throw new Error(
            "Failed to upload permits. Please ensure all permits are properly uploaded with expiration dates."
          );
        }
      } else {
        throw new Error(
          "At least one permit is required to complete registration."
        );
      }

      // Insert Business Registration
      const registration = await apiClient.post(`/registration`, {
        ...registrationData,
        business_id: businessId,
      });

      if (!registration.data) {
        throw new Error("Failed to create registration record");
      }

      console.log("✅ Business registration submitted successfully");
      alert(
        "Registration submitted successfully! You will be notified once your application is reviewed."
      );
      navigate("/business");
    } catch (error: any) {
      console.error("❌ Failed to submit registration:", error);

      // Provide specific error message
      const errorMessage =
        error.message || "Something went wrong. Please try again.";
      alert(errorMessage);
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
