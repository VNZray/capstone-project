import React, { useState, useEffect } from "react";
import { Modal, ModalDialog } from "@mui/joy";
import { apiService } from "@/src/utils/api";
import { supabase } from "@/src/lib/supabase";
import type { Event, EventCategory, EventFormData } from "@/src/types/Event";
import type { Barangay, Municipality, Province } from "@/src/types";
import EventStepper from "./EventStepper";
import BasicInfoStep from "./steps/BasicInfoStep";
import LocationStep from "./steps/LocationStep";
import ScheduleStep from "./steps/ScheduleStep";
import DetailsStep from "./steps/DetailsStep";
import SocialsStep from "./steps/SocialsStep";
import ImagesStep from "./steps/ImagesStep";
import type { PendingEventImage } from "./EventImageManager";

// Helper function to upload event image to storage
const uploadEventImageToStorage = async (
  eventId: string,
  file: File,
  isPrimary: boolean = false,
  altText?: string,
  folderName?: string
) => {
  const folder = folderName || `event-${eventId}`;
  const fileExt = file.name.split('.').pop();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `${timestamp}.${fileExt}`;
  const filePath = `${folder}/imgs/${fileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("event-images")
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;
  if (!uploadData?.path) throw new Error("Upload failed: no file path");
  
  const { data: publicData } = supabase.storage
    .from("event-images")
    .getPublicUrl(uploadData.path);

  if (!publicData?.publicUrl) {
    throw new Error("Failed to get public URL");
  }

  const imageData = {
    file_url: publicData.publicUrl,
    file_name: fileName,
    file_format: fileExt || 'jpg',
    file_size: file.size,
    is_primary: isPrimary,
    alt_text: altText || undefined,
  };

  return await apiService.addEventImage(eventId, imageData);
};

interface EventFormProps {
  isVisible: boolean;
  onClose: () => void;
  onEventAdded?: () => void;
  onEventUpdated?: () => void;
  mode: "add" | "edit";
  initialData?: Event;
  categories: EventCategory[];
  initialStep?: number;
}

const EventForm: React.FC<EventFormProps> = ({
  isVisible,
  onClose,
  onEventAdded,
  onEventUpdated,
  mode,
  initialData,
  categories,
  initialStep = 0,
}) => {
  // Form state
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    description: "",
    short_description: "",
    start_date: "",
    end_date: "",
    is_all_day: false,
    event_category_id: "",
    event_category_ids: [],
    venue_name: "",
    address: "",
    barangay_id: "",
    latitude: "",
    longitude: "",
    is_free: true,
    entry_fee: "",
    max_attendees: "",
    registration_required: false,
    registration_url: "",
    organizer_name: "",
    organizer_email: "",
    organizer_phone: "",
    contact_phone: "",
    contact_email: "",
    website: "",
    facebook_url: "",
    instagram_url: "",
    status: "draft",
  });

  // Location data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>("");

  // Image state
  const [pendingImages, setPendingImages] = useState<PendingEventImage[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [formInitialized, setFormInitialized] = useState(false);

  // Reset to initialStep when modal opens
  useEffect(() => {
    if (isVisible) {
      setCurrentStep(initialStep);
    }
  }, [isVisible, initialStep]);

  // Fetch location data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const locationData = await apiService.getLocationData();
        setProvinces(locationData.provinces);
        setMunicipalities(locationData.municipalities);
        setBarangays(locationData.barangays);
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    };
    fetchData();
  }, []);

  // Initialize form data when editing
  useEffect(() => {
    if (isVisible) {
      if (mode === "edit" && initialData) {
        // Only set form data after location options are loaded, and only once
        if (formInitialized) return;
        if (!(provinces.length && municipalities.length && barangays.length)) return;

        let province_id = "";
        let municipality_id = "";
        let barangay_id = initialData.barangay_id?.toString() || "";

        // Try to resolve province and municipality from barangay
        if (barangay_id) {
          const barangay = barangays.find(b => b.id.toString() === barangay_id);
          if (barangay) {
            municipality_id = barangay.municipality_id.toString();
            const municipality = municipalities.find(m => m.id.toString() === municipality_id);
            if (municipality) {
              province_id = municipality.province_id.toString();
            }
          }
        }

        const categoryId = initialData.event_category_id?.toString() || "";
        setFormData({
          name: initialData.name,
          description: initialData.description,
          short_description: initialData.short_description || "",
          start_date: initialData.start_date ? new Date(initialData.start_date).toISOString().slice(0, 16) : "",
          end_date: initialData.end_date ? new Date(initialData.end_date).toISOString().slice(0, 16) : "",
          is_all_day: Boolean(initialData.is_all_day),
          event_category_id: categoryId,
          event_category_ids: categoryId ? [categoryId] : [],
          venue_name: initialData.venue_name || "",
          address: initialData.address || "",
          barangay_id: barangay_id,
          latitude: initialData.latitude?.toString() || "",
          longitude: initialData.longitude?.toString() || "",
          is_free: initialData.is_free ?? true,
          entry_fee: initialData.entry_fee?.toString() || "",
          max_attendees: initialData.max_attendees?.toString() || "",
          registration_required: Boolean(initialData.registration_required),
          registration_url: initialData.registration_url || "",
          organizer_name: initialData.organizer_name || "",
          organizer_email: initialData.organizer_email || "",
          organizer_phone: initialData.organizer_phone || "",
          contact_phone: initialData.contact_phone || "",
          contact_email: initialData.contact_email || "",
          website: initialData.website || "",
          facebook_url: initialData.facebook_url || "",
          instagram_url: initialData.instagram_url || "",
          status: initialData.status || "draft",
        });

        setSelectedProvince(province_id);
        setSelectedMunicipality(municipality_id);
        setFormInitialized(true);
      } else if (mode === "add") {
        // Reset form for add mode
        setFormData({
          name: "",
          description: "",
          short_description: "",
          start_date: "",
          end_date: "",
          is_all_day: false,
          event_category_id: "",
          event_category_ids: [],
          venue_name: "",
          address: "",
          barangay_id: "",
          latitude: "",
          longitude: "",
          is_free: true,
          entry_fee: "",
          max_attendees: "",
          registration_required: false,
          registration_url: "",
          organizer_name: "",
          organizer_email: "",
          organizer_phone: "",
          contact_phone: "",
          contact_email: "",
          website: "",
          facebook_url: "",
          instagram_url: "",
          status: "draft",
        });
        setSelectedProvince("");
        setSelectedMunicipality("");
        setCurrentStep(0);
        setFormInitialized(false);
      }
    }
  }, [isVisible, mode, initialData, provinces, municipalities, barangays, formInitialized]);

  const handleClose = () => {
    setCurrentStep(0);
    setFormInitialized(false);
    setPendingImages([]);
    onClose();
  };

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (type: "province" | "municipality" | "barangay", value: string) => {
    if (type === "province") {
      setSelectedProvince(value);
      setSelectedMunicipality("");
      handleInputChange("barangay_id", "");
    } else if (type === "municipality") {
      setSelectedMunicipality(value);
      handleInputChange("barangay_id", "");
    } else if (type === "barangay") {
      handleInputChange("barangay_id", value);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return formData.name && formData.description && formData.event_category_id;
      case 1: // Location
        // Location is optional in some cases, but let's say at least venue name or address is good?
        // For now, let's make it permissive or check requirements
        return true; 
      case 2: // Schedule
        return formData.start_date && formData.end_date;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep === 5) { // Last step (Socials - now step 5)
      handleSubmit();
    } else if (canProceedToNext()) {
      setCurrentStep((prev) => prev + 1);
    } else {
      alert("Please complete the required fields before proceeding.");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Prepare data for submission
      const submitData: EventFormData = {
        ...formData,
        // Ensure empty strings are treated as undefined if necessary
        barangay_id: formData.barangay_id || undefined,
        event_category_id: formData.event_category_id || undefined,
        entry_fee: formData.entry_fee || undefined,
        max_attendees: formData.max_attendees || undefined,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
      };

      if (mode === "add") {
        const result = await apiService.createEvent(submitData);
        
        // Upload pending images if any
        if (pendingImages.length > 0 && result.data?.id) {
          const eventId = result.data.id;
          const folderName = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
          
          for (const pendingImage of pendingImages) {
            try {
              await uploadEventImageToStorage(eventId, pendingImage.file, pendingImage.is_primary, pendingImage.alt_text, folderName);
            } catch (imgError) {
              console.error("Failed to upload image:", imgError);
            }
          }
        }
        
        onEventAdded?.();
      } else if (mode === "edit" && initialData) {
        await apiService.updateEvent(initialData.id, submitData);
        onEventUpdated?.();
      }
      handleClose();
    } catch (error) {
      console.error("Error submitting event:", error);
      alert(`Error ${mode === "add" ? "creating" : "updating"} event. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep
            formData={formData}
            categories={categories}
            onInputChange={handleInputChange}
          />
        );
      case 1:
        return (
          <LocationStep
            formData={formData}
            provinces={provinces}
            municipalities={municipalities}
            barangays={barangays}
            selectedProvince={selectedProvince}
            selectedMunicipality={selectedMunicipality}
            onInputChange={handleInputChange}
            onLocationChange={handleLocationChange}
          />
        );
      case 2:
        return (
          <ScheduleStep
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      case 3:
        return (
          <DetailsStep
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      case 4:
        return (
          <ImagesStep
            mode={mode}
            eventId={initialData?.id}
            pendingImages={pendingImages}
            onPendingImagesChange={setPendingImages}
            initialEventName={formData.name || initialData?.name}
          />
        );
      case 5:
        return (
          <SocialsStep
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal open={isVisible} onClose={handleClose} sx={{ zIndex: 2000 }}>
      <ModalDialog
        size="md"
        sx={{
          zIndex: 2100,
          width: "90%",
          maxWidth: 1000,
          maxHeight: "90vh",
          margin: "0 auto",
          overflow: "auto",
          p: 0,
        }}
      >
        <EventStepper
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          onNext={handleNext}
          onBack={() => setCurrentStep((prev) => prev - 1)}
          onCancel={handleClose}
          mode={mode}
          loading={loading}
          formData={formData}
        >
          {renderStepContent()}
        </EventStepper>
      </ModalDialog>
    </Modal>
  );
};

export default EventForm;
