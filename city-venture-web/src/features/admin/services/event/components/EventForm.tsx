import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Option,
  Checkbox,
  Stack,
  Autocomplete,
  Grid,
  Sheet,
  IconButton,
  CircularProgress,
  Chip,
  Divider,
} from "@mui/joy";
import { Upload, Star, Trash2, Plus, MapPin } from "lucide-react";
import { apiService } from "@/src/utils/api";
import { uploadFile } from "@/src/services/upload/FileUploadService";
import Typography from "@/src/components/Typography";
import BaseModal from "@/src/components/BaseModal";
import Alert from "@/src/components/Alert";
import Button from "@/src/components/Button";
import MapInput from "../../tourist-spot/components/MapInput";
import { colors } from "@/src/utils/Colors";
import type {
  Event,
  EventCategory,
  EventFormData,
  EventImage,
  EventLocation,
} from "@/src/types/Event";
import ReviewStep from "./steps/ReviewStep";

interface FormOption {
  id: number;
  label: string;
}

interface Province {
  id: number;
  province: string;
}

interface Municipality {
  id: number;
  municipality: string;
  province_id: number;
}

interface Barangay {
  id: number;
  barangay: string;
  municipality_id: number;
}

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

// Extended form data with location IDs
interface ExtendedEventFormData
  extends Omit<EventFormData, "barangay_id" | "latitude" | "longitude"> {
  province_id: string;
  municipality_id: string;
  barangay_id_str: string;
  latitude_str: string;
  longitude_str: string;
  // Multiple categories support
  category_ids: string[];
}

// Location form data for multiple locations
interface LocationFormData {
  id?: string;
  venue_name: string;
  venue_address: string;
  province_id: string;
  municipality_id: string;
  barangay_id: string;
  latitude: string;
  longitude: string;
  is_primary: boolean;
  isNew?: boolean;
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
  const [currentStep, setCurrentStep] = useState(initialStep);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sort categories with "Other" at the end
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const aIsOther = a.name.toLowerCase() === "other";
      const bIsOther = b.name.toLowerCase() === "other";
      if (aIsOther && !bIsOther) return 1;
      if (!aIsOther && bIsOther) return -1;
      return a.name.localeCompare(b.name);
    });
  }, [categories]);

  // Reset to initialStep when modal opens
  useEffect(() => {
    if (isVisible) {
      setCurrentStep(initialStep);
    }
  }, [isVisible, initialStep]);
  const [formData, setFormData] = useState<ExtendedEventFormData>({
    name: "",
    description: "",
    category_id: "",
    category_ids: [],
    venue_name: "",
    venue_address: "",
    province_id: "",
    municipality_id: "",
    barangay_id_str: "",
    latitude_str: "",
    longitude_str: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    is_all_day: false,
    is_free: true,
    ticket_price: undefined,
    max_capacity: undefined,
    contact_phone: "",
    contact_email: "",
    website: "",
    registration_url: "",
    organizer_name: "",
    organizer_type: "",
  });
  const [loading, setLoading] = useState(false);

  // Multiple locations state
  const [locations, setLocations] = useState<LocationFormData[]>([]);
  const [editingLocationIndex, setEditingLocationIndex] = useState<
    number | null
  >(null);

  // Image management state
  interface LocalImage {
    id?: string;
    file?: File;
    file_url: string;
    is_primary: boolean;
    uploading?: boolean;
    isNew?: boolean;
  }
  const [images, setImages] = useState<LocalImage[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Location data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);

  // Alert state
  const [alertConfig, setAlertConfig] = useState<{
    open: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    open: false,
    type: "info",
    title: "",
    message: "",
  });

  const showAlert = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string,
    onConfirm?: () => void
  ) => {
    setAlertConfig({ open: true, type, title, message, onConfirm });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, open: false }));
  };

  // Location options
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

  // State for new/editing location
  // Default to Camarines Sur (id: 20) and Naga City (id: 24)
  const emptyLocation: LocationFormData = {
    venue_name: "",
    venue_address: "",
    province_id: "20",
    municipality_id: "24",
    barangay_id: "",
    latitude: "",
    longitude: "",
    is_primary: false,
    isNew: true,
  };
  const [currentLocation, setCurrentLocation] =
    useState<LocationFormData>(emptyLocation);
  const [showLocationForm, setShowLocationForm] = useState(false);

  // Computed options for current location form
  const currentLocationMunicipalityOptions = useMemo<FormOption[]>(
    () =>
      municipalities
        .filter((m) => m.province_id === Number(currentLocation.province_id))
        .map((m) => ({ id: m.id, label: m.municipality })),
    [municipalities, currentLocation.province_id]
  );

  const currentLocationBarangayOptions = useMemo<FormOption[]>(
    () =>
      barangays
        .filter(
          (b) => b.municipality_id === Number(currentLocation.municipality_id)
        )
        .map((b) => ({ id: b.id, label: b.barangay })),
    [barangays, currentLocation.municipality_id]
  );

  const currentLocationSelectedProvince = useMemo<FormOption | null>(
    () =>
      provinceOptions.find(
        (o) => o.id === Number(currentLocation.province_id)
      ) ?? null,
    [provinceOptions, currentLocation.province_id]
  );

  const currentLocationSelectedMunicipality = useMemo<FormOption | null>(
    () =>
      currentLocationMunicipalityOptions.find(
        (o) => o.id === Number(currentLocation.municipality_id)
      ) ?? null,
    [currentLocationMunicipalityOptions, currentLocation.municipality_id]
  );

  const currentLocationSelectedBarangay = useMemo<FormOption | null>(
    () =>
      currentLocationBarangayOptions.find(
        (o) => o.id === Number(currentLocation.barangay_id)
      ) ?? null,
    [currentLocationBarangayOptions, currentLocation.barangay_id]
  );

  // Location management functions
  const handleAddNewLocation = () => {
    setEditingLocationIndex(null);
    setCurrentLocation({
      ...emptyLocation,
      is_primary: locations.length === 0, // First location is primary by default
    });
    setShowLocationForm(true);
  };

  const handleEditLocation = (index: number) => {
    setEditingLocationIndex(index);
    setCurrentLocation({ ...locations[index] });
    setShowLocationForm(true);
  };

  const handleDeleteLocation = (index: number) => {
    const newLocations = [...locations];
    const wasDeleted = newLocations.splice(index, 1)[0];

    // If deleted location was primary and there are other locations, make first one primary
    if (wasDeleted.is_primary && newLocations.length > 0) {
      newLocations[0].is_primary = true;
    }

    setLocations(newLocations);
  };

  const handleSetPrimaryLocation = (index: number) => {
    setLocations((prev) =>
      prev.map((loc, i) => ({
        ...loc,
        is_primary: i === index,
      }))
    );
  };

  const handleSaveLocation = () => {
    if (!currentLocation.venue_name || !currentLocation.barangay_id) {
      showAlert(
        "error",
        "Missing Information",
        "Please provide at least a venue name and barangay."
      );
      return;
    }

    if (editingLocationIndex !== null) {
      // Editing existing location
      setLocations((prev) => {
        const newLocations = [...prev];
        newLocations[editingLocationIndex] = currentLocation;

        // If this location is set as primary, unset others
        if (currentLocation.is_primary) {
          return newLocations.map((loc, i) => ({
            ...loc,
            is_primary: i === editingLocationIndex,
          }));
        }
        return newLocations;
      });
    } else {
      // Adding new location
      setLocations((prev) => {
        const newLocations = currentLocation.is_primary
          ? prev.map((loc) => ({ ...loc, is_primary: false }))
          : prev;
        return [...newLocations, { ...currentLocation, isNew: true }];
      });
    }

    setShowLocationForm(false);
    setCurrentLocation(emptyLocation);
    setEditingLocationIndex(null);
  };

  const handleCancelLocationForm = () => {
    setShowLocationForm(false);
    setCurrentLocation(emptyLocation);
    setEditingLocationIndex(null);
  };

  // Helper to get location display name
  const getLocationDisplayName = (loc: LocationFormData): string => {
    const barangay = barangays.find((b) => b.id === Number(loc.barangay_id));
    const municipality = municipalities.find(
      (m) => m.id === Number(loc.municipality_id)
    );
    const province = provinces.find((p) => p.id === Number(loc.province_id));

    const parts = [
      barangay?.barangay,
      municipality?.municipality,
      province?.province,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Location not specified";
  };

  // Load location data
  useEffect(() => {
    const loadLocationData = async () => {
      try {
        const locationData = await apiService.getLocationData();
        setProvinces(locationData.provinces);
        setMunicipalities(locationData.municipalities);
        setBarangays(locationData.barangays);
      } catch (error) {
        console.error("Error loading location data:", error);
      }
    };
    if (isVisible) loadLocationData();
  }, [isVisible]);

  // Initialize form data when editing
  useEffect(() => {
    if (mode === "edit" && initialData) {
      // Get category IDs - use categories array if available, otherwise use single category_id
      const categoryIds =
        initialData.category_ids ||
        initialData.categories?.map((c) => c.id) ||
        (initialData.category_id ? [initialData.category_id] : []);

      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        category_id: initialData.category_id || "",
        category_ids: categoryIds,
        venue_name: initialData.venue_name || "",
        venue_address: initialData.venue_address || "",
        province_id: "",
        municipality_id: "",
        barangay_id_str: initialData.barangay_id?.toString() || "",
        latitude_str: initialData.latitude?.toString() || "",
        longitude_str: initialData.longitude?.toString() || "",
        start_date: initialData.start_date?.split("T")[0] || "",
        end_date: initialData.end_date?.split("T")[0] || "",
        start_time: initialData.start_time || "",
        end_time: initialData.end_time || "",
        is_all_day: initialData.is_all_day || false,
        is_free: initialData.is_free !== false,
        ticket_price: initialData.ticket_price,
        max_capacity: initialData.max_capacity,
        contact_phone: initialData.contact_phone || "",
        contact_email: initialData.contact_email || "",
        website: initialData.website || "",
        registration_url: initialData.registration_url || "",
        organizer_name: initialData.organizer_name || "",
        organizer_type: initialData.organizer_type || "",
      });

      // Load existing locations if available
      if (initialData.locations && initialData.locations.length > 0) {
        setLocations(
          initialData.locations.map((loc) => ({
            id: loc.id,
            venue_name: loc.venue_name || "",
            venue_address: loc.venue_address || "",
            province_id: "",
            municipality_id: "",
            barangay_id: loc.barangay_id?.toString() || "",
            latitude: loc.latitude?.toString() || "",
            longitude: loc.longitude?.toString() || "",
            is_primary: loc.is_primary || false,
            isNew: false,
          }))
        );
      } else if (initialData.venue_name || initialData.barangay_id) {
        // Convert legacy single location to locations array
        setLocations([
          {
            venue_name: initialData.venue_name || "",
            venue_address: initialData.venue_address || "",
            province_id: "",
            municipality_id: "",
            barangay_id: initialData.barangay_id?.toString() || "",
            latitude: initialData.latitude?.toString() || "",
            longitude: initialData.longitude?.toString() || "",
            is_primary: true,
            isNew: false,
          },
        ]);
      }

      // Resolve province and municipality from barangay_id
      if (
        initialData.barangay_id &&
        barangays.length &&
        municipalities.length
      ) {
        const barangay = barangays.find(
          (b) => b.id === initialData.barangay_id
        );
        if (barangay) {
          const municipality = municipalities.find(
            (m) => m.id === barangay.municipality_id
          );
          if (municipality) {
            setFormData((prev) => ({
              ...prev,
              municipality_id: municipality.id.toString(),
              province_id: municipality.province_id.toString(),
            }));
          }
        }
      }
    } else if (mode === "add") {
      resetForm();
    }
  }, [mode, initialData, isVisible, barangays, municipalities]);

  // Resolve province/municipality for loaded locations when barangays data becomes available
  useEffect(() => {
    if (
      locations.length > 0 &&
      barangays.length > 0 &&
      municipalities.length > 0
    ) {
      setLocations((prev) =>
        prev.map((loc) => {
          if (loc.barangay_id && (!loc.province_id || !loc.municipality_id)) {
            const barangay = barangays.find(
              (b) => b.id === Number(loc.barangay_id)
            );
            if (barangay) {
              const municipality = municipalities.find(
                (m) => m.id === barangay.municipality_id
              );
              if (municipality) {
                return {
                  ...loc,
                  municipality_id: municipality.id.toString(),
                  province_id: municipality.province_id.toString(),
                };
              }
            }
          }
          return loc;
        })
      );
    }
  }, [locations.length, barangays, municipalities]);

  // Set default location for add mode
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
  }, [
    mode,
    provinceOptions,
    municipalityOptions,
    formData.province_id,
    formData.municipality_id,
  ]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category_id: "",
      category_ids: [],
      venue_name: "",
      venue_address: "",
      province_id: "",
      municipality_id: "",
      barangay_id_str: "",
      latitude_str: "",
      longitude_str: "",
      start_date: "",
      end_date: "",
      start_time: "",
      end_time: "",
      is_all_day: false,
      is_free: true,
      ticket_price: undefined,
      max_capacity: undefined,
      contact_phone: "",
      contact_email: "",
      website: "",
      registration_url: "",
      organizer_name: "",
      organizer_type: "",
    });
    setImages([]);
    setLocations([]);
    setEditingLocationIndex(null);
    setCurrentLocation(emptyLocation);
    setShowLocationForm(false);
    setCurrentStep(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleInputChange = (
    field: keyof ExtendedEventFormData,
    value: string | number | boolean | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFormDataChange = (
    updater: (prev: ExtendedEventFormData) => ExtendedEventFormData
  ) => {
    setFormData(updater);
  };

  const canProceedToNext = (): boolean => {
    switch (currentStep) {
      case 0: // Basic Info - Name, Description, and at least one Category required
        return (
          !!formData.name.trim() &&
          !!(formData.description ?? "").trim() &&
          formData.category_ids.length > 0
        );
      case 1: // Location - At least one location with venue name required
        return (
          locations.length > 0 && locations.some((loc) => loc.venue_name.trim())
        );
      case 2: // Date & Time - Start date required
        return !!formData.start_date;
      case 3: // Pricing - Ticket price required if not free
        return (
          formData.is_free ||
          (!!formData.ticket_price && formData.ticket_price > 0)
        );
      case 4: // Contact & Organizer - Organizer name required
        return !!(formData.organizer_name ?? "").trim();
      default:
        return true;
    }
  };

  const validateSubmission = (): boolean => {
    // Validate all required fields before submission
    if (!formData.name.trim()) {
      showAlert("error", "Validation Error", "Event name is required");
      return false;
    }
    if (!(formData.description ?? "").trim()) {
      showAlert("error", "Validation Error", "Event description is required");
      return false;
    }
    if (!formData.category_id) {
      showAlert("error", "Validation Error", "Event category is required");
      return false;
    }
    if (formData.category_ids.length === 0) {
      showAlert(
        "error",
        "Validation Error",
        "At least one category is required"
      );
      return false;
    }
    if (
      locations.length === 0 ||
      !locations.some((loc) => loc.venue_name.trim())
    ) {
      showAlert(
        "error",
        "Validation Error",
        "At least one location with a venue name is required"
      );
      return false;
    }
    if (!formData.start_date) {
      showAlert("error", "Validation Error", "Start date is required");
      return false;
    }
    if (
      !formData.is_free &&
      (!formData.ticket_price || formData.ticket_price <= 0)
    ) {
      showAlert(
        "error",
        "Validation Error",
        "Ticket price is required for paid events"
      );
      return false;
    }
    if (!(formData.organizer_name ?? "").trim()) {
      showAlert("error", "Validation Error", "Organizer name is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateSubmission()) return;

    setLoading(true);
    try {
      // Get primary location for backward compatibility
      const primaryLocation =
        locations.find((l) => l.is_primary) || locations[0];

      const payload: EventFormData = {
        name: formData.name,
        description: formData.description,
        category_id: formData.category_ids[0] || undefined,
        venue_name: primaryLocation?.venue_name || "",
        venue_address: primaryLocation?.venue_address || "",
        barangay_id: primaryLocation?.barangay_id
          ? parseInt(primaryLocation.barangay_id)
          : undefined,
        latitude: primaryLocation?.latitude
          ? parseFloat(primaryLocation.latitude)
          : undefined,
        longitude: primaryLocation?.longitude
          ? parseFloat(primaryLocation.longitude)
          : undefined,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        start_time: formData.is_all_day ? undefined : formData.start_time,
        end_time: formData.is_all_day ? undefined : formData.end_time,
        is_all_day: formData.is_all_day,
        is_free: formData.is_free,
        ticket_price: formData.is_free ? undefined : formData.ticket_price,
        max_capacity: formData.max_capacity,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        website: formData.website,
        registration_url: formData.registration_url,
        organizer_name: formData.organizer_name,
        organizer_type: formData.organizer_type,
      };

      let eventId: string;

      if (mode === "add") {
        const result = await apiService.createEvent(payload);
        eventId = (result as any).data?.id || (result as any).id;

        // Save images for new event
        if (eventId && images.length > 0) {
          for (let i = 0; i < images.length; i++) {
            const img = images[i];
            await apiService.addEventImage(eventId, {
              file_url: img.file_url,
              is_primary: img.is_primary,
              display_order: i,
            });
          }
        }

        // Save multiple categories
        if (eventId && formData.category_ids.length > 0) {
          await apiService.setEventCategoryMappings(
            eventId,
            formData.category_ids
          );
        }

        // Save multiple locations
        if (eventId && locations.length > 0) {
          for (let i = 0; i < locations.length; i++) {
            const loc = locations[i];
            await apiService.addEventLocation(eventId, {
              venue_name: loc.venue_name,
              venue_address: loc.venue_address || undefined,
              barangay_id: loc.barangay_id
                ? parseInt(loc.barangay_id)
                : undefined,
              latitude: loc.latitude ? parseFloat(loc.latitude) : undefined,
              longitude: loc.longitude ? parseFloat(loc.longitude) : undefined,
              is_primary: loc.is_primary,
              display_order: i,
            });
          }
        }

        showAlert("success", "Success", "Event created successfully", () => {
          onEventAdded?.();
          handleClose();
        });
      } else if (initialData?.id) {
        eventId = initialData.id;
        await apiService.updateEvent(eventId, payload);

        // Handle images for existing event
        // Delete removed images
        const existingImageIds = (initialData.images || []).map(
          (img: EventImage) => img.id
        );
        const currentImageIds = images
          .filter((img) => img.id)
          .map((img) => img.id);

        for (const oldId of existingImageIds) {
          if (!currentImageIds.includes(oldId)) {
            await apiService.deleteEventImage(eventId, oldId);
          }
        }

        // Add new images
        const newImages = images.filter((img) => img.isNew);
        for (let i = 0; i < newImages.length; i++) {
          const img = newImages[i];
          await apiService.addEventImage(eventId, {
            file_url: img.file_url,
            is_primary: img.is_primary,
            display_order: images.indexOf(img),
          });
        }

        // Update primary if changed
        const primaryImage = images.find((img) => img.is_primary && img.id);
        if (primaryImage?.id) {
          await apiService.setEventPrimaryImage(eventId, primaryImage.id);
        }

        // Update categories
        await apiService.setEventCategoryMappings(
          eventId,
          formData.category_ids
        );

        // Handle locations for existing event
        // Delete removed locations
        const existingLocationIds = (initialData.locations || []).map(
          (loc: EventLocation) => loc.id
        );
        const currentLocationIds = locations
          .filter((loc) => loc.id)
          .map((loc) => loc.id);

        for (const oldId of existingLocationIds) {
          if (oldId && !currentLocationIds.includes(oldId)) {
            await apiService.deleteEventLocation(eventId, oldId);
          }
        }

        // Add new locations
        const newLocations = locations.filter((loc) => loc.isNew);
        for (let i = 0; i < newLocations.length; i++) {
          const loc = newLocations[i];
          await apiService.addEventLocation(eventId, {
            venue_name: loc.venue_name,
            venue_address: loc.venue_address || undefined,
            barangay_id: loc.barangay_id
              ? parseInt(loc.barangay_id)
              : undefined,
            latitude: loc.latitude ? parseFloat(loc.latitude) : undefined,
            longitude: loc.longitude ? parseFloat(loc.longitude) : undefined,
            is_primary: loc.is_primary,
            display_order: locations.indexOf(loc),
          });
        }

        // Update existing locations
        const existingLocations = locations.filter(
          (loc) => loc.id && !loc.isNew
        );
        for (const loc of existingLocations) {
          if (loc.id) {
            await apiService.updateEventLocation(eventId, loc.id, {
              venue_name: loc.venue_name,
              venue_address: loc.venue_address || undefined,
              barangay_id: loc.barangay_id
                ? parseInt(loc.barangay_id)
                : undefined,
              latitude: loc.latitude ? parseFloat(loc.latitude) : undefined,
              longitude: loc.longitude ? parseFloat(loc.longitude) : undefined,
              is_primary: loc.is_primary,
            });
          }
        }

        showAlert("success", "Success", "Event updated successfully", () => {
          onEventUpdated?.();
          handleClose();
        });
      }
    } catch (error: any) {
      console.error("Error saving event:", error);
      const message = error?.response?.data?.message || "Failed to save event";
      showAlert("error", "Error", message);
    } finally {
      setLoading(false);
    }
  };

  // ===== IMAGE HANDLING =====
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const newImages: LocalImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith("image/")) {
          showAlert(
            "warning",
            "Invalid File",
            `${file.name} is not an image file`
          );
          continue;
        }

        // Upload to Supabase
        const result = await uploadFile(file, {
          folderName: "events",
          uploadTo: "event-images",
          storeLocally: true,
        });

        if (result.success && result.publicUrl) {
          newImages.push({
            file,
            file_url: result.publicUrl,
            is_primary: images.length === 0 && newImages.length === 0, // First image is primary
            isNew: true,
          });
        } else {
          showAlert(
            "error",
            "Upload Failed",
            result.error || `Failed to upload ${file.name}`
          );
        }
      }

      setImages((prev) => [...prev, ...newImages]);
    } catch (error) {
      console.error("Error uploading images:", error);
      showAlert("error", "Upload Error", "Failed to upload images");
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      const removedWasPrimary = newImages[index].is_primary;
      newImages.splice(index, 1);

      // If removed image was primary, make first remaining image primary
      if (removedWasPrimary && newImages.length > 0) {
        newImages[0].is_primary = true;
      }

      return newImages;
    });
  };

  const handleSetPrimary = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === index,
      }))
    );
  };

  // Load existing images when editing
  useEffect(() => {
    if (
      mode === "edit" &&
      initialData?.images &&
      initialData.images.length > 0
    ) {
      setImages(
        initialData.images.map((img: EventImage) => ({
          id: img.id,
          file_url: img.file_url,
          is_primary: img.is_primary,
          isNew: false,
        }))
      );
    } else if (mode === "add") {
      setImages([]);
    }
  }, [mode, initialData, isVisible]);

  const stepTitles = [
    "Basic Information",
    "Location & Venue",
    "Date & Time",
    "Pricing & Capacity",
    "Contact & Organizer",
    "Images & Gallery",
    "Review & Submit",
  ];

  const totalSteps = stepTitles.length;

  const nextStep = () => {
    if (currentStep >= totalSteps - 1) return;

    if (canProceedToNext()) {
      setCurrentStep(currentStep + 1);
    } else {
      showAlert(
        "warning",
        "Required Fields Missing",
        "Please complete all required fields before proceeding to the next step."
      );
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <Box>
            <Stack spacing={2.5}>
              <FormControl required>
                <FormLabel>Event Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter event name"
                />
              </FormControl>

              <FormControl required>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Enter event description"
                  minRows={4}
                />
              </FormControl>

              <FormControl required>
                <FormLabel>Categories (Select one or more)</FormLabel>
                <Autocomplete
                  multiple
                  options={sortedCategories}
                  value={sortedCategories.filter((cat) =>
                    formData.category_ids.includes(cat.id)
                  )}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  onChange={(_, newValue) => {
                    handleFormDataChange((prev) => ({
                      ...prev,
                      category_ids: newValue.map((cat) => cat.id),
                      category_id: newValue.length > 0 ? newValue[0].id : "",
                    }));
                  }}
                  placeholder="Select categories"
                  slotProps={{ listbox: { sx: { zIndex: 2200 } } }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          size="sm"
                          variant="soft"
                          color="primary"
                          {...tagProps}
                        >
                          {option.name}
                        </Chip>
                      );
                    })
                  }
                />
                <Typography.Body size="sm" sx={{ mt: 0.5, color: colors.gray }}>
                  You can select multiple categories if the event fits more than
                  one
                </Typography.Body>
              </FormControl>
            </Stack>
          </Box>
        );

      case 1: // Location & Venue
        return (
          <Box>
            <Stack spacing={2.5}>
              {/* Existing Locations List */}
              {locations.length > 0 && !showLocationForm && (
                <Box>
                  <Typography.Label sx={{ mb: 1.5, display: "block" }}>
                    Event Locations ({locations.length})
                  </Typography.Label>
                  <Stack spacing={1.5}>
                    {locations.map((loc, index) => (
                      <Sheet
                        key={index}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: "md",
                          borderColor: loc.is_primary
                            ? colors.primary
                            : undefined,
                          position: "relative",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 0.5,
                              }}
                            >
                              <MapPin size={16} color={colors.primary} />
                              <Typography.Label>
                                {loc.venue_name || "Unnamed Venue"}
                              </Typography.Label>
                              {loc.is_primary && (
                                <Chip size="sm" color="primary" variant="soft">
                                  Primary
                                </Chip>
                              )}
                            </Box>
                            <Typography.Body
                              size="sm"
                              sx={{ color: colors.gray, ml: 3 }}
                            >
                              {getLocationDisplayName(loc)}
                            </Typography.Body>
                            {loc.venue_address && (
                              <Typography.Body
                                size="sm"
                                sx={{ color: colors.gray, ml: 3, mt: 0.5 }}
                              >
                                {loc.venue_address}
                              </Typography.Body>
                            )}
                          </Box>
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            {!loc.is_primary && (
                              <IconButton
                                size="sm"
                                variant="plain"
                                color="warning"
                                onClick={() => handleSetPrimaryLocation(index)}
                                title="Set as Primary"
                              >
                                <Star size={16} />
                              </IconButton>
                            )}
                            <IconButton
                              size="sm"
                              variant="plain"
                              color="neutral"
                              onClick={() => handleEditLocation(index)}
                              title="Edit Location"
                            >
                              <MapPin size={16} />
                            </IconButton>
                            <IconButton
                              size="sm"
                              variant="plain"
                              color="danger"
                              onClick={() => handleDeleteLocation(index)}
                              title="Remove Location"
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </Box>
                        </Box>
                      </Sheet>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Add Location Button */}
              {!showLocationForm && (
                <Button
                  variant="outlined"
                  startDecorator={<Plus size={18} />}
                  onClick={handleAddNewLocation}
                  sx={{ alignSelf: "flex-start" }}
                >
                  Add {locations.length > 0 ? "Another " : ""}Location
                </Button>
              )}

              {/* Location Form */}
              {showLocationForm && (
                <Sheet
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: "md",
                    bgcolor: "background.surface",
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
                    <Typography.Label>
                      {editingLocationIndex !== null
                        ? "Edit Location"
                        : "Add New Location"}
                    </Typography.Label>
                    <Checkbox
                      label="Primary Location"
                      checked={currentLocation.is_primary}
                      onChange={(e) =>
                        setCurrentLocation((prev) => ({
                          ...prev,
                          is_primary: e.target.checked,
                        }))
                      }
                    />
                  </Box>

                  <Stack spacing={2}>
                    <FormControl required>
                      <FormLabel>Venue Name</FormLabel>
                      <Input
                        value={currentLocation.venue_name}
                        onChange={(e) =>
                          setCurrentLocation((prev) => ({
                            ...prev,
                            venue_name: e.target.value,
                          }))
                        }
                        placeholder="e.g., City Convention Center"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Venue Address</FormLabel>
                      <Textarea
                        value={currentLocation.venue_address}
                        onChange={(e) =>
                          setCurrentLocation((prev) => ({
                            ...prev,
                            venue_address: e.target.value,
                          }))
                        }
                        placeholder="Enter venue address"
                        minRows={2}
                      />
                    </FormControl>

                    <Grid container spacing={2}>
                      <Grid xs={12} md={4}>
                        <FormControl>
                          <FormLabel>Province</FormLabel>
                          <Autocomplete<FormOption>
                            options={provinceOptions}
                            value={currentLocationSelectedProvince}
                            isOptionEqualToValue={(a, b) => a?.id === b?.id}
                            getOptionLabel={(opt) => opt?.label ?? ""}
                            onChange={(_e, val) =>
                              setCurrentLocation((prev) => ({
                                ...prev,
                                province_id: val?.id.toString() || "",
                                municipality_id: "",
                                barangay_id: "",
                              }))
                            }
                            slotProps={{ listbox: { sx: { zIndex: 2200 } } }}
                            placeholder="Select Province"
                          />
                        </FormControl>
                      </Grid>

                      <Grid xs={12} md={4}>
                        <FormControl>
                          <FormLabel>Municipality</FormLabel>
                          <Autocomplete<FormOption>
                            options={currentLocationMunicipalityOptions}
                            value={currentLocationSelectedMunicipality}
                            isOptionEqualToValue={(a, b) => a?.id === b?.id}
                            getOptionLabel={(opt) => opt?.label ?? ""}
                            onChange={(_e, val) =>
                              setCurrentLocation((prev) => ({
                                ...prev,
                                municipality_id: val?.id.toString() || "",
                                barangay_id: "",
                              }))
                            }
                            slotProps={{ listbox: { sx: { zIndex: 2200 } } }}
                            placeholder="Select Municipality"
                            disabled={!currentLocation.province_id}
                          />
                        </FormControl>
                      </Grid>

                      <Grid xs={12} md={4}>
                        <FormControl required>
                          <FormLabel>Barangay</FormLabel>
                          <Autocomplete<FormOption>
                            options={currentLocationBarangayOptions}
                            value={currentLocationSelectedBarangay}
                            isOptionEqualToValue={(a, b) => a?.id === b?.id}
                            getOptionLabel={(opt) => opt?.label ?? ""}
                            onChange={(_e, val) =>
                              setCurrentLocation((prev) => ({
                                ...prev,
                                barangay_id: val?.id.toString() || "",
                              }))
                            }
                            slotProps={{ listbox: { sx: { zIndex: 2200 } } }}
                            placeholder="Select Barangay"
                            disabled={!currentLocation.municipality_id}
                          />
                        </FormControl>
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 2 }}>
                      <Typography.Label sx={{ mb: 1, display: "block" }}>
                        Pin Location on Map
                      </Typography.Label>
                      <Typography.Body
                        size="sm"
                        sx={{ mb: 1, color: colors.gray }}
                      >
                        Click on the map or drag the marker to set the event
                        location
                      </Typography.Body>
                      <MapInput
                        latitude={currentLocation.latitude}
                        longitude={currentLocation.longitude}
                        onChange={(lat, lng) =>
                          setCurrentLocation((prev) => ({
                            ...prev,
                            latitude: lat,
                            longitude: lng,
                          }))
                        }
                      />
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="outlined"
                        colorScheme="gray"
                        onClick={handleCancelLocationForm}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveLocation}>
                        {editingLocationIndex !== null
                          ? "Update Location"
                          : "Add Location"}
                      </Button>
                    </Box>
                  </Stack>
                </Sheet>
              )}

              {/* Help text */}
              {locations.length === 0 && !showLocationForm && (
                <Typography.Body size="sm" sx={{ color: colors.gray }}>
                  Add at least one location for the event. Events can have
                  multiple venues.
                </Typography.Body>
              )}
            </Stack>
          </Box>
        );

      case 2: // Date & Time
        return (
          <Box>
            <Stack spacing={2.5}>
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <FormControl required>
                    <FormLabel>Start Date</FormLabel>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        handleInputChange("start_date", e.target.value)
                      }
                    />
                  </FormControl>
                </Grid>

                <Grid xs={12} md={6}>
                  <FormControl>
                    <FormLabel>End Date</FormLabel>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        handleInputChange("end_date", e.target.value)
                      }
                    />
                  </FormControl>
                </Grid>
              </Grid>

              <Checkbox
                checked={formData.is_all_day}
                onChange={(e) =>
                  handleInputChange("is_all_day", e.target.checked)
                }
                label="All day event"
              />

              {!formData.is_all_day && (
                <Grid container spacing={2}>
                  <Grid xs={12} md={6}>
                    <FormControl>
                      <FormLabel>Start Time</FormLabel>
                      <Input
                        type="time"
                        value={formData.start_time}
                        onChange={(e) =>
                          handleInputChange("start_time", e.target.value)
                        }
                      />
                    </FormControl>
                  </Grid>

                  <Grid xs={12} md={6}>
                    <FormControl>
                      <FormLabel>End Time</FormLabel>
                      <Input
                        type="time"
                        value={formData.end_time}
                        onChange={(e) =>
                          handleInputChange("end_time", e.target.value)
                        }
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              )}
            </Stack>
          </Box>
        );

      case 3: // Pricing & Capacity
        return (
          <Box>
            <Stack spacing={2.5}>
              <Checkbox
                checked={formData.is_free}
                onChange={(e) => handleInputChange("is_free", e.target.checked)}
                label="Free event"
              />

              {!formData.is_free && (
                <FormControl>
                  <FormLabel>Ticket Price (₱)</FormLabel>
                  <Input
                    type="number"
                    value={formData.ticket_price || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "ticket_price",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    placeholder="Enter ticket price"
                    slotProps={{ input: { min: 0 } }}
                  />
                </FormControl>
              )}

              <FormControl>
                <FormLabel>Maximum Capacity</FormLabel>
                <Input
                  type="number"
                  value={formData.max_capacity || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "max_capacity",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  placeholder="Leave empty for unlimited"
                  slotProps={{ input: { min: 0 } }}
                />
              </FormControl>
            </Stack>
          </Box>
        );

      case 4: // Contact & Organizer
        return (
          <Box>
            <Stack spacing={2.5}>
              <Typography.Label sx={{ color: colors.primary, fontWeight: 600 }}>
                Contact Information
              </Typography.Label>

              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <FormControl>
                    <FormLabel>Contact Phone</FormLabel>
                    <Input
                      value={formData.contact_phone}
                      onChange={(e) =>
                        handleInputChange("contact_phone", e.target.value)
                      }
                      placeholder="Enter contact phone"
                    />
                  </FormControl>
                </Grid>

                <Grid xs={12} md={6}>
                  <FormControl>
                    <FormLabel>Contact Email</FormLabel>
                    <Input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) =>
                        handleInputChange("contact_email", e.target.value)
                      }
                      placeholder="Enter contact email"
                    />
                  </FormControl>
                </Grid>
              </Grid>

              <FormControl>
                <FormLabel>Website</FormLabel>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://example.com"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Registration URL</FormLabel>
                <Input
                  type="url"
                  value={formData.registration_url}
                  onChange={(e) =>
                    handleInputChange("registration_url", e.target.value)
                  }
                  placeholder="https://example.com/register"
                />
              </FormControl>

              <Typography.Label
                sx={{ color: colors.primary, fontWeight: 600, mt: 2 }}
              >
                Organizer Details
              </Typography.Label>

              <FormControl required>
                <FormLabel>Organizer Name</FormLabel>
                <Input
                  value={formData.organizer_name}
                  onChange={(e) =>
                    handleInputChange("organizer_name", e.target.value)
                  }
                  placeholder="Enter organizer name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Organizer Type</FormLabel>
                <Select
                  value={formData.organizer_type}
                  onChange={(_, value) =>
                    handleInputChange("organizer_type", value || "")
                  }
                  placeholder="Select organizer type"
                  slotProps={{ listbox: { sx: { zIndex: 2200 } } }}
                >
                  <Option value="tourism_office">Tourism Office</Option>
                  <Option value="business">Business</Option>
                  <Option value="community">Community</Option>
                </Select>
              </FormControl>
            </Stack>
          </Box>
        );

      case 5: // Images & Gallery
        return (
          <Box>
            <Stack spacing={2.5}>
              <Typography.Label sx={{ color: colors.primary, fontWeight: 600 }}>
                Event Images
              </Typography.Label>
              <Typography.Body size="sm" sx={{ color: colors.gray }}>
                Upload images for your event. The first image will be used as
                the cover image. Click the star to set an image as primary.
              </Typography.Body>

              {/* Upload Button */}
              <Box>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                />
                <Button
                  variant="outlined"
                  colorScheme="primary"
                  onClick={() => fileInputRef.current?.click()}
                  startDecorator={
                    uploadingImage ? (
                      <CircularProgress size="sm" />
                    ) : (
                      <Upload size={18} />
                    )
                  }
                  disabled={uploadingImage}
                >
                  {uploadingImage ? "Uploading..." : "Upload Images"}
                </Button>
              </Box>

              {/* Image Grid */}
              {images.length > 0 ? (
                <Stack direction="row" sx={{ flexWrap: "wrap", gap: 2 }}>
                  {images.map((image, index) => (
                    <Sheet
                      key={index}
                      variant="outlined"
                      sx={{
                        width: 150,
                        height: 150,
                        borderRadius: 8,
                        overflow: "hidden",
                        position: "relative",
                        border: image.is_primary ? "2px solid" : "1px solid",
                        borderColor: image.is_primary
                          ? "primary.500"
                          : "neutral.300",
                      }}
                    >
                      <img
                        src={image.file_url}
                        alt={`Event image ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      {/* Primary Badge */}
                      {image.is_primary && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 4,
                            left: 4,
                            backgroundColor: "primary.500",
                            color: "white",
                            px: 0.75,
                            py: 0.25,
                            borderRadius: 4,
                            fontSize: "10px",
                            fontWeight: 600,
                          }}
                        >
                          Primary
                        </Box>
                      )}
                      {/* Action Buttons */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          display: "flex",
                          gap: 0.5,
                        }}
                      >
                        {!image.is_primary && (
                          <IconButton
                            size="sm"
                            variant="solid"
                            color="warning"
                            onClick={() => handleSetPrimary(index)}
                            sx={{ minWidth: 28, minHeight: 28 }}
                          >
                            <Star size={14} />
                          </IconButton>
                        )}
                        <IconButton
                          size="sm"
                          variant="solid"
                          color="danger"
                          onClick={() => handleRemoveImage(index)}
                          sx={{ minWidth: 28, minHeight: 28 }}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </Box>
                    </Sheet>
                  ))}
                </Stack>
              ) : (
                <Sheet
                  variant="soft"
                  sx={{
                    p: 4,
                    borderRadius: 8,
                    textAlign: "center",
                    border: "2px dashed",
                    borderColor: "neutral.300",
                  }}
                >
                  <Typography.Body sx={{ color: colors.gray }}>
                    No images uploaded yet. Click "Upload Images" to add photos.
                  </Typography.Body>
                </Sheet>
              )}
            </Stack>
          </Box>
        );

      case 6: // Review & Submit
        return (
          <ReviewStep
            mode={mode}
            formData={formData}
            selectedCategories={sortedCategories.filter((cat) =>
              formData.category_ids.includes(cat.id)
            )}
            locations={locations}
            images={images}
            provinces={provinces}
            municipalities={municipalities}
            barangays={barangays}
            onFormDataChange={handleFormDataChange}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <BaseModal
        open={isVisible}
        onClose={handleClose}
        size="md"
        title={mode === "edit" ? "Edit Event" : "Add New Event"}
        maxWidth={580}
        description={stepTitles[currentStep]}
        headerRight={
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 0.5,
              minWidth: 150,
            }}
          >
            <Typography.Body
              size="sm"
              sx={{
                color: colors.gray,
                fontWeight: 600,
              }}
            >
              Step {currentStep + 1} of {totalSteps}
            </Typography.Body>
            <Box
              sx={{
                width: "100%",
                height: "6px",
                backgroundColor: colors.offWhite,
                borderRadius: "3px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${((currentStep + 1) / totalSteps) * 100}%`,
                  backgroundColor: colors.primary,
                  transition: "width 0.3s ease",
                  borderRadius: "3px",
                }}
              />
            </Box>
          </Box>
        }
        actions={[
          {
            label: "Cancel",
            onClick: handleClose,
            variant: "outlined",
            colorScheme: "secondary",
            disabled: loading,
          },
          {
            label: "Back",
            onClick: prevStep,
            variant: "outlined",
            colorScheme: "primary",
            disabled: isFirstStep || loading,
          },
          {
            label: isLastStep
              ? mode === "edit"
                ? "Save Changes"
                : "Create Event"
              : "Next",
            onClick: isLastStep ? handleSubmit : nextStep,
            variant: "solid",
            colorScheme: "primary",
            disabled: loading,
          },
        ]}
      >
        <Box sx={{ padding: "clamp(1.5rem, 4vw, 2.5rem)" }}>
          {renderStepContent()}
        </Box>
      </BaseModal>

      <Alert
        open={alertConfig.open}
        onClose={closeAlert}
        onConfirm={alertConfig.onConfirm}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        showCancel={false}
      />
    </>
  );
};

export default EventForm;
