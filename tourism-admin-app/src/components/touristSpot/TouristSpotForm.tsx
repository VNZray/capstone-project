import React, { useEffect, useMemo, useState } from "react";
import { apiService } from "../../utils/api";
import TouristSpotStepper from "./TouristSpotStepper";
import BasicInfoStep from "./steps/BasicInfoStep";
import LocationStep from "./steps/LocationStep";
import ScheduleStep from "./steps/ScheduleStep";
import ImagesStep from "./steps/ImagesStep";
import ReviewStep from "./steps/ReviewStep";
import type { PendingImage } from "../../types/TouristSpot";
import { uploadPendingImages } from "../../utils/touristSpot";
import {
  Modal,
  ModalDialog,
} from "@mui/joy";
import type {
  Category,
  Province,
  Municipality,
  Barangay,
  TouristSpot,
  TouristSpotFormData,
  FormOption,
  DaySchedule,
} from "../../types/TouristSpot";

interface TouristSpotFormProps {
  isVisible: boolean;
  onClose: () => void;
  onSpotAdded?: () => void;
  onSpotUpdated?: () => void;
  mode: "add" | "edit";
  initialData?: TouristSpot;
}

const TouristSpotForm: React.FC<TouristSpotFormProps> = ({
  isVisible,
  onClose,
  onSpotAdded,
  onSpotUpdated,
  mode,
  initialData,
}) => {
  const [formData, setFormData] = useState<TouristSpotFormData>({
    name: "",
    description: "",
    province_id: "",
    municipality_id: "",
    barangay_id: "",
    latitude: "",
    longitude: "",
    contact_phone: "",
    contact_email: "",
    website: "",
    entry_fee: "",
    category_id: "",
    type_id: "4",
    spot_status: "" as "" | "pending" | "active" | "inactive",
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);

  const daysOfWeek = React.useMemo(
    () => [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    []
  );
  const [schedules, setSchedules] = useState<DaySchedule[]>(() =>
    Array.from({ length: 7 }, (_, idx) => ({
      dayIndex: idx,
      is_closed: false,
      open_time: "08:00",
      close_time: "17:00",
    }))
  );
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  const [currentStep, setCurrentStep] = useState(0);


  const handleClose = () => {
    setPendingImages([]);
    setCurrentStep(0);
    onClose();
  };

  const provinceOptions = useMemo<FormOption[]>(
    () => provinces.map((p) => ({ id: p.id, label: p.province })),
    [provinces]
  );
  const municipalityOptions = useMemo<FormOption[]>(
    () =>
      municipalities
        .filter(
          (m) =>
            !formData.province_id ||
            m.province_id === parseInt(formData.province_id)
        )
        .map((m) => ({ id: m.id, label: m.municipality })),
    [municipalities, formData.province_id]
  );
  const barangayOptions = useMemo<FormOption[]>(
    () =>
      barangays
        .filter(
          (b) =>
            !formData.municipality_id ||
            b.municipality_id === parseInt(formData.municipality_id)
        )
        .map((b) => ({ id: b.id, label: b.barangay })),
    [barangays, formData.municipality_id]
  );
  const categoryOptions = useMemo<FormOption[]>(
    () => categories.map((c) => ({ id: c.id, label: c.category })),
    [categories]
  );

  const selectedProvince = useMemo<FormOption | null>(
    () =>
      provinceOptions.find((o) => o.id === Number(formData.province_id)) ??
      null,
    [provinceOptions, formData.province_id]
  );
  const selectedMunicipality = useMemo<FormOption | null>(
    () =>
      municipalityOptions.find(
        (o) => o.id === Number(formData.municipality_id)
      ) ?? null,
    [municipalityOptions, formData.municipality_id]
  );
  const selectedBarangay = useMemo<FormOption | null>(
    () =>
      barangayOptions.find((o) => o.id === Number(formData.barangay_id)) ??
      null,
    [barangayOptions, formData.barangay_id]
  );
  const selectedCategory = useMemo<FormOption | null>(
    () =>
      categoryOptions.find((o) => o.id === Number(formData.category_id)) ??
      null,
    [categoryOptions, formData.category_id]
  );

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        province_id: initialData.province_id.toString(),
        municipality_id: initialData.municipality_id.toString(),
        barangay_id: initialData.barangay_id.toString(),
        latitude: initialData.latitude?.toString() || "",
        longitude: initialData.longitude?.toString() || "",
        contact_phone: initialData.contact_phone,
        contact_email: initialData.contact_email || "",
        website: initialData.website || "",
        entry_fee: initialData.entry_fee?.toString() || "",
        category_id: initialData.category_id.toString(),
        type_id: initialData.type_id.toString(),
        spot_status:
          (initialData.spot_status as "pending" | "active" | "inactive") || "",
      });

      (async () => {
        try {
          const scheds = await apiService.getTouristSpotSchedules(
            initialData.id
          );
          const ui = Array.from({ length: 7 }, (_, idx) => {
            const found = scheds.find((s) => s.day_of_week === idx);
            return {
              dayIndex: idx,
              is_closed: found?.is_closed ?? false,
              open_time: found?.open_time ?? "08:00",
              close_time: found?.close_time ?? "17:00",
            } as DaySchedule;
          });
          setSchedules(ui);
        } catch (e) {
          console.warn("No schedules yet or failed to load schedules", e);
        }
      })();
    } else if (mode === "add") {
      setFormData({
        name: "",
        description: "",
        province_id: "",
        municipality_id: "",
        barangay_id: "",
        latitude: "",
        longitude: "",
        contact_phone: "",
        contact_email: "",
        website: "",
        entry_fee: "",
        category_id: "",
        type_id: "4",
        spot_status: "" as "" | "pending" | "active" | "inactive",
      });
      setSchedules(
        Array.from({ length: 7 }, (_, idx) => ({
          dayIndex: idx,
          is_closed: true,
          open_time: "08:00",
          close_time: "17:00",
        }))
      );
      setCurrentStep(0);
    }
  }, [mode, initialData, isVisible, daysOfWeek]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesTypes, locationData] = await Promise.all([
          apiService.getCategoriesAndTypes(),
          apiService.getLocationData(),
        ]);
        setCategories(categoriesTypes.categories);
        setProvinces(locationData.provinces);
        setMunicipalities(locationData.municipalities);
        setBarangays(locationData.barangays);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    if (isVisible) loadData();
  }, [isVisible]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const spotData: Partial<TouristSpot> = {
        name: formData.name,
        description: formData.description,
        province_id: parseInt(formData.province_id),
        municipality_id: parseInt(formData.municipality_id),
        barangay_id: parseInt(formData.barangay_id),
        contact_phone: formData.contact_phone,
        category_id: parseInt(formData.category_id),
        type_id: parseInt(formData.type_id) || 4,
        ...(formData.latitude
          ? { latitude: parseFloat(formData.latitude) }
          : {}),
        ...(formData.longitude
          ? { longitude: parseFloat(formData.longitude) }
          : {}),
        ...(formData.contact_email
          ? { contact_email: formData.contact_email }
          : {}),
        ...(formData.website ? { website: formData.website } : {}),
        ...(formData.entry_fee
          ? { entry_fee: parseFloat(formData.entry_fee) }
          : {}),
      };

      // Map UI schedules to API shape
      const mappedSchedules = schedules.map((s) => ({
        day_of_week: s.dayIndex,
        is_closed: s.is_closed,
        open_time: s.is_closed ? null : s.open_time,
        close_time: s.is_closed ? null : s.close_time,
      }));

      if (mode === "add") {
        const response = await apiService.createTouristSpot({
          ...spotData,
          schedules: mappedSchedules,
        });
        
        // Upload pending images if any
        if (pendingImages.length > 0 && response?.data?.id) {
          try {
            await uploadPendingImages(
              response.data.id.toString(), 
              pendingImages,
              selectedCategory?.label,
              formData.name
            );
            alert("Spot added successfully with images!");
          } catch (imageError) {
            console.error("Error uploading images:", imageError);
            alert("Spot added successfully, but some images failed to upload. You can add them by editing the spot.");
          }
        } else {
          alert("Spot added successfully!");
        }
        onSpotAdded?.();
      } else {
        if (!initialData?.id) throw new Error("No ID provided for update");
        
        // Check what has changed to determine if approval is needed
        const coreFieldsChanged = await hasSignificantChanges(spotData, initialData);
        
        // Check if schedules have changed
        const currentSchedules = await apiService.getTouristSpotSchedules(initialData.id);
        const schedulesChanged = hasScheduleChanges(mappedSchedules, currentSchedules);
        
        // If nothing has changed, inform the user
        if (!coreFieldsChanged && !schedulesChanged) {
          alert("No changes detected. Nothing to update.");
          handleClose();
          return;
        }
        
        if (coreFieldsChanged) {
          // Submit approval request for core business information changes
          await apiService.submitEditRequest(initialData.id, {
            ...spotData,
            ...(formData.spot_status
              ? {
                  spot_status: formData.spot_status as "active" | "inactive",
                }
              : {}),
          });
        }
        
        if (schedulesChanged) {
          // Update schedules directly (no approval needed)
          await apiService.saveTouristSpotSchedules(initialData.id, mappedSchedules);
        }
        
        // Show appropriate success message
        if (coreFieldsChanged && schedulesChanged) {
          alert("Core information changes submitted for approval! Schedule updates have been applied immediately.");
        } else if (coreFieldsChanged) {
          alert("Changes submitted for approval!");
        } else if (schedulesChanged) {
          alert("Updated successfully!");
        }
        
        onSpotUpdated?.();
      }
      handleClose();
    } catch (error) {
      console.error("Error:", error);
      alert(
        `Error ${
          mode === "add" ? "adding" : "updating"
        } spot. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if schedules have changed
  const hasScheduleChanges = (newSchedules: { day_of_week: number; is_closed: boolean; open_time: string | null; close_time: string | null; }[], currentSchedules: { day_of_week: number; is_closed: boolean; open_time: string | null; close_time: string | null; }[]): boolean => {
    if (newSchedules.length !== currentSchedules.length) return true;
    
    return newSchedules.some((newSched) => {
      const currentSched = currentSchedules.find(s => s.day_of_week === newSched.day_of_week);
      if (!currentSched) return true;
      
      return (
        newSched.is_closed !== currentSched.is_closed ||
        newSched.open_time !== currentSched.open_time ||
        newSched.close_time !== currentSched.close_time
      );
    });
  };

  // Helper function to check if significant business information has changed
  const hasSignificantChanges = async (newData: Partial<TouristSpot>, originalData: TouristSpot): Promise<boolean> => {
    try {
      // Fetch current data from database to ensure we're comparing against latest state
      const currentData = await apiService.getTouristSpotById(originalData.id);
      
      const significantFields = [
        'name', 'description', 'province_id', 'municipality_id', 'barangay_id',
        'contact_phone', 'contact_email', 'website', 'entry_fee', 'category_id', 'type_id',
        'latitude', 'longitude'
      ];
      
      return significantFields.some(field => {
        const newValue = newData[field as keyof TouristSpot];
        const currentValue = currentData[field as keyof TouristSpot];
        
        if (field === 'contact_email' || field === 'website') {
          const normalizedNew = newValue || null;
          const normalizedCurrent = currentValue || null;
          return normalizedNew !== normalizedCurrent;
        }
        
        if (field === 'latitude' || field === 'longitude' || field === 'entry_fee') {
          const normalizedNew = newValue ? Number(newValue) : null;
          const normalizedCurrent = currentValue ? Number(currentValue) : null;
          return normalizedNew !== normalizedCurrent;
        }
        
        if (typeof newValue === 'string' && typeof currentValue === 'string') {
          return newValue.trim() !== currentValue.trim();
        }
        return newValue !== currentValue;
      });
    } catch (error) {
      console.error('Error fetching current data for comparison:', error);
      return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <BasicInfoStep
            formData={formData}
            categoryOptions={categoryOptions}
            selectedCategory={selectedCategory}
            onInputChange={handleInputChange}
            onFormDataChange={handleFormDataChange}
          />
        );

      case 1: // Location  
        return (
          <LocationStep
            formData={formData}
            provinceOptions={provinceOptions}
            municipalityOptions={municipalityOptions}
            barangayOptions={barangayOptions}
            selectedProvince={selectedProvince}
            selectedMunicipality={selectedMunicipality}
            selectedBarangay={selectedBarangay}
            onFormDataChange={handleFormDataChange}
          />
        );

      case 2: // Socials (new step)
        return (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h3>Social Media & Contact</h3>
            <p>This step will contain social media links and additional contact information.</p>
            <p style={{ color: '#666', fontSize: '0.9em' }}>Coming soon...</p>
          </div>
        );

      case 3: // Schedule
        return (
          <ScheduleStep
            schedules={schedules}
            daysOfWeek={daysOfWeek}
            onScheduleChange={setSchedules}
          />
        );

      case 4: // Images
        return (
          <ImagesStep
            mode={mode}
            touristSpotId={initialData?.id?.toString()}
            pendingImages={pendingImages}
            onPendingImagesChange={setPendingImages}
          />
        );

      case 5: // Review
        return (
          <ReviewStep
            mode={mode}
            formData={formData}
            selectedCategory={selectedCategory}
            selectedProvince={selectedProvince}
            selectedMunicipality={selectedMunicipality}
            selectedBarangay={selectedBarangay}
            schedules={schedules}
            daysOfWeek={daysOfWeek}
            onFormDataChange={handleFormDataChange}
          />
        );

      default:
        return null;
    }
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return formData.name && formData.description && formData.category_id;
      case 1: // Location
        return formData.province_id && formData.municipality_id && formData.barangay_id;
      case 2: // Socials
        return formData.contact_phone || formData.contact_email || formData.website;
      case 3: // Schedule
        return true; // Schedule is optional
      case 4: // Images
        return pendingImages.length > 0; // Require at least one image
      default:
        return true;
    }
  };

  const canAccessStep = (step: number) => {
    if (step === 0) return true;
    if (step === 1) return !!(formData.name && formData.description && formData.category_id);
    if (step === 2) return !!(formData.province_id && formData.municipality_id && formData.barangay_id);
    return true
  };

  const handleNext = () => {
    if (currentStep === 5) {
      // Create a synthetic event for handleSubmit
      const syntheticEvent = {
        preventDefault: () => {},
      } as React.FormEvent;
      handleSubmit(syntheticEvent);
    } else if (canProceedToNext()) {
      nextStep();
    } else {
      alert("Please complete the required fields before proceeding.");
    }
  };

  const handleFormDataChange = (updater: (prev: TouristSpotFormData) => TouristSpotFormData) => {
    setFormData(updater);
  };

  return (
    <Modal open={isVisible} onClose={handleClose}>
      <ModalDialog
        size="md"
        sx={{
          width: "90%",
          maxWidth: 1100,
          maxHeight: "90vh",
          margin: "0 auto",
          overflow: "auto",
          p: 0,
        }}
      >
        <TouristSpotStepper
          currentStep={currentStep}
          onStepChange={(step) => {
            if (canAccessStep(step)) {
              setCurrentStep(step);
            } else {
              alert("Please complete the required fields before accessing this step.");
            }
          }}
          onNext={handleNext}
          onBack={prevStep}
          onCancel={handleClose}
          mode={mode}
          loading={loading}
          formData={formData} // Pass formData
        >
          {renderStepContent()}
        </TouristSpotStepper>
      </ModalDialog>
    </Modal>
  );
};

export default TouristSpotForm;
