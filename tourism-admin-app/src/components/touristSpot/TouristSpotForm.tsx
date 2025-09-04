import React, { useEffect, useMemo, useState } from "react";
import { apiService } from "../../utils/api";
import TouristSpotStepper from "./TouristSpotStepper";
import BasicInfoStep from "./steps/BasicInfoStep";
import LocationStep from "./steps/LocationStep";
import ScheduleStep from "./steps/ScheduleStep";
import ImagesStep from "./steps/ImagesStep";
import ReviewStep from "./steps/ReviewStep";
import SocialsStep from "./steps/SocialsStep";
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
  initialStep?: number;
}

const TouristSpotForm: React.FC<TouristSpotFormProps> = ({
  isVisible,
  onClose,
  onSpotAdded,
  onSpotUpdated,
  mode,
  initialData,
  initialStep = 0,
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
    category_ids: [],
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

  const [currentStep, setCurrentStep] = useState(initialStep);

  React.useEffect(() => {
    if (isVisible) {
      setCurrentStep(initialStep);
    }
  }, [isVisible, initialStep]);


  const handleClose = () => {
    setPendingImages([]);
    setCurrentStep(0);
    onClose();
    if (mode === "add") {
      onSpotAdded?.();
    } else {
      onSpotUpdated?.();
    }
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
  
  const selectedCategories = useMemo<FormOption[]>(
    () => 
      categoryOptions.filter((o) => formData.category_ids.includes(o.id)),
    [categoryOptions, formData.category_ids]
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
        category_ids: initialData.categories ? initialData.categories.map(c => c.id) : [],
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
        category_ids: [],
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
      const spotData: Record<string, unknown> = {
        name: formData.name,
        description: formData.description,
        province_id: parseInt(formData.province_id),
        municipality_id: parseInt(formData.municipality_id),
        barangay_id: parseInt(formData.barangay_id),
        contact_phone: formData.contact_phone,
        category_ids: formData.category_ids,
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
            // Clean folder name once and use for all uploads
            const spotFolderName = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            await uploadPendingImages(
              response.data.id.toString(),
              pendingImages,
              undefined,
              formData.name,
              spotFolderName
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
        
        const coreFieldsChanged = await hasSignificantChanges(spotData, initialData);
        
        // Check if only categories have changed
        const currentCategories = initialData.categories?.map(c => c.id).sort() || [];
        const newCategories = (formData.category_ids || []).sort();
        const categoriesChanged = JSON.stringify(currentCategories) !== JSON.stringify(newCategories);
        
        // Check if schedules have changed
        const currentSchedules = await apiService.getTouristSpotSchedules(initialData.id);
        const schedulesChanged = hasScheduleChanges(mappedSchedules, currentSchedules);
        
        // If nothing has changed, inform the user, but check for new images
        if (!coreFieldsChanged && !categoriesChanged && !schedulesChanged) {
          if (pendingImages.length > 0) {
            console.log("Uploading new images in edit mode:", pendingImages);
            try {
              // Always use original folder name from initialData.name ONLY
              if (!initialData?.name) throw new Error("No original spot name found for folder!");
              const spotFolderName = initialData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
              await uploadPendingImages(
                initialData.id,
                pendingImages,
                undefined,
                initialData.name,
                spotFolderName
              );
              alert("Images uploaded successfully!");
              setPendingImages([]);
              onSpotUpdated?.();
            } catch (imageError) {
              console.error("Error uploading images:", imageError);
              alert("Some images failed to upload. You can try again by editing the spot.");
            }
            handleClose();
            return;
          } else {
            alert("No changes detected. Nothing to update.");
            handleClose();
            return;
          }
        }
        
        if (coreFieldsChanged || (categoriesChanged && !coreFieldsChanged)) {
          const submitData = {
            ...spotData,
            ...(formData.spot_status
              ? {
                  spot_status: formData.spot_status as "active" | "inactive",
                }
              : {}),
            ...(categoriesChanged && !coreFieldsChanged ? { categories_only: true } : {})
          };
          
          await apiService.submitEditRequest(initialData.id, submitData);
        }
        
        if (schedulesChanged) {
          await apiService.saveTouristSpotSchedules(initialData.id, mappedSchedules);
        }
        
        // Show appropriate success message
        if ((coreFieldsChanged || categoriesChanged) && schedulesChanged) {
          if (categoriesChanged && !coreFieldsChanged) {
            alert("Categories updated successfully! Schedule updates have been applied immediately.");
          } else {
            alert("Core information changes submitted for approval! Schedule updates have been applied immediately.");
          }
        } else if (coreFieldsChanged || categoriesChanged) {
          if (categoriesChanged && !coreFieldsChanged) {
            alert("Categories updated successfully!");
          } else {
            alert("Changes submitted for approval!");
          }
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

  const hasSignificantChanges = async (newData: Partial<TouristSpot>, originalData: TouristSpot): Promise<boolean> => {
    try {
      const currentData = await apiService.getTouristSpotById(originalData.id);
      
      const significantFields = [
        'name', 'description', 'province_id', 'municipality_id', 'barangay_id',
        'contact_phone', 'contact_email', 'website', 'entry_fee', 'type_id',
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
            selectedCategories={selectedCategories}
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

      case 2: // Socials
        return (
          <SocialsStep
            formData={formData}
            onInputChange={handleInputChange}
          />
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
            initialSpotName={mode === "edit" ? initialData?.name : formData.name}
          />
        );

      case 5: // Review
        return (
          <ReviewStep
            mode={mode}
            formData={formData}
            selectedCategories={selectedCategories}
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
        return formData.name && formData.description && formData.category_ids.length > 0;
      case 1: // Location
        return formData.province_id && formData.municipality_id && formData.barangay_id;
      default:
        return true; // Allow next for all other steps
    }
  };

  const canAccessStep = (step: number) => {
    if (step === 0) return true;
    if (step === 1) return !!(formData.name && formData.description && formData.category_ids.length > 0);
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
    <Modal open={isVisible} onClose={handleClose} sx={{ zIndex: 2000 }}>
      <ModalDialog
        size="md"
        sx={{
          zIndex: 2100,
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
          formData={formData}
        >
          {renderStepContent()}
        </TouristSpotStepper>
      </ModalDialog>
    </Modal>
  );
};

export default TouristSpotForm;
