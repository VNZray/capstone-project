import React, { useEffect, useMemo, useState, useRef } from "react";
import { apiService } from "../../utils/api";
import TouristSpotStepper from "./TouristSpotStepper";
import BasicInfoStep from "./steps/BasicInfoStep";
import LocationStep from "./steps/LocationStep";
import ScheduleStep from "./steps/ScheduleStep";
import ImagesStep from "./steps/ImagesStep";
import ReviewStep from "./steps/ReviewStep";
import SocialsStep from "./steps/SocialsStep";
import type { PendingImage } from "@/src/types/TouristSpot";
import { uploadPendingImages } from "@/src/utils/touristSpot";
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
} from "@/src/types/TouristSpot";

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
    is_featured: false,
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
  const initialAddressRef = useRef<{ province_id: number; municipality_id: number; barangay_id: number } | null>(null);

  React.useEffect(() => {
    if (isVisible) {
      setCurrentStep(initialStep);
    }
  }, [isVisible, initialStep]);


  const handleClose = () => {
    setPendingImages([]);
    setCurrentStep(0);
    setFormInitialized(false);
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
      is_featured: false,
    });
    setSchedules(
      Array.from({ length: 7 }, (_, idx) => ({
        dayIndex: idx,
        is_closed: true,
        open_time: "08:00",
        close_time: "17:00",
      }))
    );
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

  const [formInitialized, setFormInitialized] = useState(false);
  useEffect(() => {
    if (mode === "edit" && initialData) {
      // Only set form data after location options are loaded, and only once
      if (formInitialized) return;
      if (!(provinces.length && municipalities.length && barangays.length)) return;
      let province_id = initialData.province_id;
      let municipality_id = initialData.municipality_id;
      let barangay_id = initialData.barangay_id;

      // If IDs are missing, try to look up by name from loaded options
      if ((!province_id || !municipality_id || !barangay_id)) {
        if (!province_id && initialData.province) {
          const found = provinces.find(p => p.province === initialData.province);
          province_id = found ? found.id : 0;
        }
        if (!municipality_id && initialData.municipality) {
          const found = municipalities.find(m => m.municipality === initialData.municipality);
          municipality_id = found ? found.id : 0;
        }
        if (!barangay_id && initialData.barangay) {
          const found = barangays.find(b => b.barangay === initialData.barangay);
          barangay_id = found ? found.id : 0;
        }
      }

      setFormData({
        name: initialData.name,
        description: initialData.description,
        province_id: province_id !== undefined && province_id !== null ? province_id.toString() : "0",
        municipality_id: municipality_id !== undefined && municipality_id !== null ? municipality_id.toString() : "0",
        barangay_id: barangay_id !== undefined && barangay_id !== null ? barangay_id.toString() : "0",
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
        is_featured: Boolean(initialData.is_featured),
      });
      // Store the resolved baseline address IDs for later comparison
      initialAddressRef.current = {
        province_id: Number(province_id) || 0,
        municipality_id: Number(municipality_id) || 0,
        barangay_id: Number(barangay_id) || 0,
      };
      setFormInitialized(true);

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
        is_featured: false,
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
      setFormInitialized(false);
    }
  }, [mode, initialData, isVisible, daysOfWeek, provinces, municipalities, barangays, formInitialized]);

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

  useEffect(() => {
    if (
      mode === "add" &&
      provinceOptions.length > 0 &&
      municipalityOptions.length > 0 &&
      !formData.province_id &&
      !formData.municipality_id
    ) {
      setFormData((prev) => ({
        ...prev,
        province_id: "20",
        municipality_id: "24",
      }));
    }
  }, [mode, provinceOptions, municipalityOptions, formData.province_id, formData.municipality_id]);

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
            alert("Spot was submitted successfully for approval");
          } catch (imageError) {
            console.error("Error uploading images:", imageError);
            alert("Spot was submitted successfully, but some images failed to upload. You can add them by editing the spot upon approval.");
          }
        } else {
          alert("Spot was submitted successfully for approval");
        }
        onSpotAdded?.();
      } else {
        if (!initialData?.id) throw new Error("No ID provided for update");

        // Normalize helper
        const normalize = (v: string | number | boolean | undefined | null) => (v ?? '').toString().trim().replace(/\s+/g, ' ');
        // Use baseline address IDs (resolved once) to avoid false positives when initialData lacked numeric IDs
        const baselineAddress = initialAddressRef.current;
        const addressChanged = baselineAddress ? (
          Number(baselineAddress.province_id) !== Number(formData.province_id) ||
          Number(baselineAddress.municipality_id) !== Number(formData.municipality_id) ||
          Number(baselineAddress.barangay_id) !== Number(formData.barangay_id)
        ) : false;
        const approvalChanged = {
          name: normalize(initialData.name) !== normalize(formData.name),
          description: normalize(initialData.description) !== normalize(formData.description),
          address: addressChanged,
          type_id: Number(initialData.type_id) !== Number(formData.type_id)
        };
        const directChanged = {
          latitude: Number(initialData.latitude) !== Number(formData.latitude),
          longitude: Number(initialData.longitude) !== Number(formData.longitude),
          contact_phone: normalize(initialData.contact_phone) !== normalize(formData.contact_phone),
          contact_email: normalize(initialData.contact_email) !== normalize(formData.contact_email),
          website: normalize(initialData.website) !== normalize(formData.website),
          entry_fee: Number(initialData.entry_fee) !== Number(formData.entry_fee),
          spot_status: initialData.spot_status !== formData.spot_status
        };
        const anyApproval = Object.values(approvalChanged).some(Boolean);
        const anyDirect = Object.values(directChanged).some(Boolean);

        const currentCategories = initialData.categories?.map(c => c.id).sort() || [];
        const newCategories = (formData.category_ids || []).sort();
        const categoriesChanged = JSON.stringify(currentCategories) !== JSON.stringify(newCategories);


  const currentSchedules = await apiService.getTouristSpotSchedules(initialData.id);
  const schedulesChanged = hasScheduleChanges(mappedSchedules, currentSchedules);

        if (!anyApproval && !anyDirect && !categoriesChanged && !schedulesChanged) {
          if (pendingImages.length > 0) {
            try {
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

        // If only direct fields changed
        if (anyDirect && !anyApproval && !categoriesChanged && !schedulesChanged) {
          const resp: any = await apiService.submitEditRequest(initialData.id, {
            ...spotData,
            ...(formData.spot_status ? { spot_status: formData.spot_status as "active" | "inactive" } : {})
          });
          alert(resp?.data?.message || "Fields updated successfully!");
          onSpotUpdated?.();
          handleClose();
          return;
        }
        if (anyApproval) {
          const resp: any = await apiService.submitEditRequest(initialData.id, {
            ...spotData,
            ...(formData.spot_status ? { spot_status: formData.spot_status as "active" | "inactive" } : {})
          });
          alert(resp?.data?.message || "Core information changes submitted for approval!");
          onSpotUpdated?.();
          handleClose();
          return;
        }
        if (categoriesChanged && !anyApproval && !anyDirect && !schedulesChanged) {
          const resp: any = await apiService.submitEditRequest(initialData.id, {
            ...spotData
          });
          alert(resp?.data?.message || "Categories updated successfully!");
          onSpotUpdated?.();
          handleClose();
          return;
        }
        if (schedulesChanged && !anyApproval && !anyDirect && !categoriesChanged) {
          await apiService.saveTouristSpotSchedules(initialData.id, mappedSchedules);
          alert("Schedule updated successfully!");
          onSpotUpdated?.();
          handleClose();
          return;
        }
      
        const submitData = {
          ...spotData,
          ...(formData.spot_status
            ? {
                spot_status: formData.spot_status as "active" | "inactive",
              }
            : {}),
        };
        
        await apiService.submitEditRequest(initialData.id, submitData);
        if (schedulesChanged) {
          await apiService.saveTouristSpotSchedules(initialData.id, mappedSchedules);
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
  const hasScheduleChanges = (
    newSchedules: { day_of_week: number; is_closed: boolean | number; open_time: string | null; close_time: string | null; }[],
    currentSchedules: { day_of_week: number; is_closed: boolean | number; open_time: string | null; close_time: string | null; }[]
  ): boolean => {
    if (newSchedules.length !== currentSchedules.length) return true;
    return newSchedules.some((newSched) => {
      const currentSched = currentSchedules.find(s => s.day_of_week === newSched.day_of_week);
      if (!currentSched) return true;
      // Compare is_closed as boolean
      const newClosed = !!newSched.is_closed;
      const currClosed = !!currentSched.is_closed;
      // Compare open/close times as strings or null
      const newOpen = newSched.open_time ?? null;
      const currOpen = currentSched.open_time ?? null;
      const newClose = newSched.close_time ?? null;
      const currClose = currentSched.close_time ?? null;
      return (
        newClosed !== currClosed ||
        newOpen !== currOpen ||
        newClose !== currClose
      );
    });
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
