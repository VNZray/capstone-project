import React, { useEffect, useMemo, useState } from "react";
import { IoClose } from "react-icons/io5";
import { apiService } from "../../../../utils/api";
import MapInput from "../../../../components/touristSpot/MapInput";
import {
  Modal,
  ModalDialog,
  DialogTitle,
  IconButton,
  Typography,
  Grid,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Autocomplete,
  Button,
  Divider,
  Select,
  Option,
  Sheet,
} from "@mui/joy";
// import Stepper from "../../../../components/Stepper";

export interface Event {
  id?: string;
  name: string;
  date: string;
  categories?: { id?: number; category: string }[];
  description?: string;
  status?: "active" | "inactive" | "pending";
}

interface EventFormProps {
  isVisible: boolean;
  onClose: () => void;
  onEventAdded?: () => void;
  onEventUpdated?: () => void;
  initialData?: Event;
  initialStep?: number;
  mode: "add" | "edit";
}

type OptionType = { id: number; label: string };

const EventForm: React.FC<EventFormProps> = ({
  isVisible,
  onClose,
  onEventAdded,
  onEventUpdated,
  initialData,
  mode,
  initialStep,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    date: initialData?.date || "",
    end_date: initialData?.date || "",
    start_time: "",
    end_time: "",
    category_ids: initialData?.categories?.map((c) => c.id!).filter(Boolean) || ([] as number[]),
    description: initialData?.description || "",
    contact_number: "",
    website: "",
    facebook: "",
    instagram: "",
    twitter: "",
    status: (initialData?.status as "active" | "inactive" | "pending") || "pending",
  });

  const [loading, setLoading] = useState(false);
  const [mainPhoto, setMainPhoto] = useState<File | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<File[]>([]);
  const [categories, setCategories] = useState<OptionType[]>([]);
  const [locations, setLocations] = useState<{ address: string; latitude: string; longitude: string }[]>([
    { address: "", latitude: "", longitude: "" },
  ]);

  const [currentStep, setCurrentStep] = useState<number>(initialStep ?? 0);

  useEffect(() => {
    if (isVisible) {
      setCurrentStep(initialStep ?? 0);
    }
  }, [isVisible, initialStep]);
  const stepLabels = ["Basic", "Schedule", "Locations", "Links", "Description"] as const;

  const selectedCategories = useMemo<OptionType[]>(
    () => categories.filter((c) => formData.category_ids.includes(c.id)),
    [categories, formData.category_ids]
  );

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { categories: cats } = await apiService.getEventCategoriesAndTypes();
        if (cats && cats.length > 0) {
          const mapped = cats.map((c: any) => ({ id: c.id, label: c.category }));
          setCategories(mapped);
          if (mode === "edit" && initialData?.categories && (!formData.category_ids || formData.category_ids.length === 0)) {
            const byName = mapped.filter((m) => initialData.categories!.some((c) => (c as any).category === m.label)).map((m) => m.id);
            if (byName.length > 0) setFormData((prev) => ({ ...prev, category_ids: byName }));
          }
        } else {
          // Fallback to fixed categories if no data returned
          const fixed = [
            { id: 1, label: "Cultural" },
            { id: 2, label: "Food" },
            { id: 3, label: "Adventure" },
            { id: 4, label: "Religious" },
          ];
          setCategories(fixed);
          if (mode === "edit" && initialData?.categories && (!formData.category_ids || formData.category_ids.length === 0)) {
            const byName = fixed.filter((m) => initialData.categories!.some((c) => (c as any).category === m.label)).map((m) => m.id);
            if (byName.length > 0) setFormData((prev) => ({ ...prev, category_ids: byName }));
          }
        }
      } catch (e) {
        console.warn("Failed to load categories from backend, using fallback", e);
        // Fallback to fixed categories if API fails
        const fixed = [
          { id: 1, label: "Cultural" },
          { id: 2, label: "Food" },
          { id: 3, label: "Adventure" },
          { id: 4, label: "Religious" },
        ];
        setCategories(fixed);
        if (mode === "edit" && initialData?.categories && (!formData.category_ids || formData.category_ids.length === 0)) {
          const byName = fixed.filter((m) => initialData.categories!.some((c) => (c as any).category === m.label)).map((m) => m.id);
          if (byName.length > 0) setFormData((prev) => ({ ...prev, category_ids: byName }));
        }
      }
    };
    if (isVisible) loadCategories();
  }, [isVisible, mode, initialData, formData.category_ids]);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        name: initialData.name,
        date: initialData.date,
        end_date: initialData.date,
        start_time: "",
        end_time: "",
        category_ids: (initialData.categories || []).map((c) => c.id!).filter(Boolean),
        description: initialData.description || "",
        contact_number: "",
        website: "",
        facebook: "",
        instagram: "",
        twitter: "",
        status: (initialData.status as "active" | "inactive" | "pending") || "pending",
      });
      setLocations([
        {
          address: (initialData as any).address || "",
          latitude: (initialData as any).latitude?.toString?.() || "",
          longitude: (initialData as any).longitude?.toString?.() || "",
        },
      ]);
    }
  }, [mode, initialData, isVisible]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateLocation = (
    index: number,
    patch: Partial<{ address: string; latitude: string; longitude: string }>
  ) => {
    setLocations((prev) => prev.map((loc, i) => (i === index ? { ...loc, ...patch } : loc)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Map to backend fields (primary location is the first entry)
      const primary = locations[0] || { address: "", latitude: "", longitude: "" };
      const payload = {
        event_name: formData.name,
        event_start_date: formData.date,
        event_end_date: formData.end_date,
        address: primary.address || null,
        description: formData.description || null,
        latitude: primary.latitude ? parseFloat(primary.latitude) : null,
        longitude: primary.longitude ? parseFloat(primary.longitude) : null,
        category_ids: formData.category_ids,
      };
      // If files selected, use multipart upload
      if (mainPhoto || (galleryPhotos && galleryPhotos.length > 0)) {
        const fd = new FormData();
        // append JSON fields as needed
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== undefined && v !== null) fd.append(k, Array.isArray(v) ? JSON.stringify(v) : String(v));
        });
        if (mainPhoto) fd.append('main_photo', mainPhoto);
  galleryPhotos.forEach((f) => fd.append('gallery[]', f));

        if (mode === "add") {
          await apiService.createEventWithFiles(fd);
          onEventAdded?.();
        } else {
          if (!initialData?.id) throw new Error("No ID provided for update");
          await apiService.updateEventWithFiles(initialData.id, fd);
          onEventUpdated?.();
        }
      } else {
        if (mode === "add") {
          await apiService.createEvent(payload as any);
          onEventAdded?.();
        } else {
          if (!initialData?.id) throw new Error("No ID provided for update");
          await apiService.updateEvent(initialData.id, payload as any);
          onEventUpdated?.();
        }
      }
    onClose();
    } catch (e) {
      console.error("Event creation/update error:", e);
      const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";
      alert(`Failed to ${mode === "add" ? "create" : "update"} event: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return Boolean(formData.name?.trim()) && formData.category_ids.length >= 1;
      case 1:
        if (!(formData.date && formData.end_date && formData.start_time && formData.end_time)) return false;
        try {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const start = new Date(formData.date);
          start.setHours(0, 0, 0, 0);
          const end = new Date(formData.end_date);
          end.setHours(0, 0, 0, 0);
          return start.getTime() >= today.getTime() && end.getTime() >= start.getTime();
        } catch {
          return false;
        }
      case 2:
        if (locations.length < 1) return false;
        const first = locations[0];
        return Boolean(first.address?.trim()) && Boolean(first.latitude) && Boolean(first.longitude);
      case 3:
        // Links step optional fields validation
        {
          const phoneOk = !formData.contact_number || /^\+?[0-9\-\s]{7,}$/.test(formData.contact_number);
          const websiteOk = !formData.website || /^https?:\/\//i.test(formData.website);
          return phoneOk && websiteOk;
        }
      case 4:
        // Description step - always valid (optional)
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!isStepValid(currentStep)) {
      if (currentStep === 0 && formData.category_ids.length === 0) {
        alert("Please select at least one category.");
      } else if (currentStep === 1) {
        alert("Please fill in all date and time fields correctly.");
      } else if (currentStep === 2) {
        alert("Please provide address and location coordinates for the first location.");
      }
      return;
    }
    setCurrentStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

  return (
    <Modal open={isVisible} onClose={onClose}>
      <ModalDialog
        size="lg"
        sx={{ width: "90%", maxWidth: 900, maxHeight: "100vh", overflow: "auto" }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <DialogTitle>
            <Typography level="h4">{mode === "add" ? "Add Event" : "Edit Event"}</Typography>
          </DialogTitle>
          <IconButton size="sm" variant="soft" onClick={onClose}>
            <IoClose />
          </IconButton>
        </Stack>

      <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid xs={12}>
              {/* Horizontal step header */}
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1, px: 1 }}>
                {stepLabels.map((label, index) => {
                  const completed = index < currentStep;
                  const active = index === currentStep;
                  return (
                    <Stack key={label} direction="row" spacing={1} alignItems="center" sx={{ opacity: completed || active ? 1 : 0.6 }}>
                      <Sheet
                        variant={active ? "solid" : completed ? "soft" : "outlined"}
                        color={completed || active ? "primary" : "neutral"}
                        sx={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Typography level="body-sm" sx={{ color: active || completed ? '#fff' : 'text.primary' }}>{index + 1}</Typography>
                      </Sheet>
                      <Typography level="body-sm">{label}</Typography>
                    </Stack>
                  );
                })}
              </Stack>
            </Grid>
            <Grid xs={12}>
              <Stack spacing={2}>
                {currentStep === 0 && (
                  <FormControl required>
                    <FormLabel>Event Name</FormLabel>
                    <Input name="name" value={formData.name} onChange={handleChange} required />
                  </FormControl>
                )}

                {currentStep === 0 && (
                  <Grid container spacing={2}>
                    <Grid xs={12}>
                      <FormControl required error={formData.category_ids.length === 0}>
                        <FormLabel>Categories (at least 1)</FormLabel>
                        <Autocomplete<OptionType, true>
                          multiple
                          options={categories}
                          value={selectedCategories}
                          isOptionEqualToValue={(a, b) => a?.id === b?.id}
                          getOptionLabel={(opt) => opt?.label ?? ""}
                          onChange={(_e, vals) =>
                            setFormData((prev) => ({ ...prev, category_ids: vals.map((v) => v.id) }))
                          }
                          placeholder="Select Categories"
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                )}

                {currentStep === 1 && (
                  <Grid container spacing={2}>
                    <Grid xs={12} md={6}>
                      <FormControl required>
                        <FormLabel>Start Date</FormLabel>
                        <Input type="date" name="date" value={formData.date} onChange={handleChange} />
                      </FormControl>
                    </Grid>
                    <Grid xs={12} md={6}>
                      <FormControl required>
                        <FormLabel>End Date</FormLabel>
                        <Input type="date" name="end_date" value={formData.end_date} onChange={handleChange} />
                      </FormControl>
                    </Grid>
                    <Grid xs={6} md={3}>
                      <FormControl required>
                        <FormLabel>Start Time</FormLabel>
                        <Input type="time" name="start_time" value={formData.start_time} onChange={handleChange} />
                      </FormControl>
                    </Grid>
                    <Grid xs={6} md={3}>
                      <FormControl required>
                        <FormLabel>End Time</FormLabel>
                        <Input type="time" name="end_time" value={formData.end_time} onChange={handleChange} />
                      </FormControl>
                    </Grid>
                  </Grid>
                )}

                {currentStep === 2 && (
                  <>
                    <Typography level="title-sm">Locations</Typography>
                    {locations.map((loc, index) => (
                      <Stack key={index} spacing={1} sx={{ border: '1px solid', borderColor: 'neutral.outlinedBorder', p: 1, borderRadius: 8 }}>
                        <MapInput
                          latitude={loc.latitude}
                          longitude={loc.longitude}
                          onChange={(lat, lng) => updateLocation(index, { latitude: lat, longitude: lng })}
                        />
                        <Grid container spacing={1}>
                          <Grid xs={12}>
                            <FormControl required={index === 0}>
                              <FormLabel>Address</FormLabel>
                              <Input placeholder="Event Address" value={loc.address} onChange={(e) => updateLocation(index, { address: e.target.value })} />
                            </FormControl>
                          </Grid>
                          <Grid xs={6}>
                            <FormControl required={index === 0}>
                              <Input type="number" placeholder="Latitude" value={loc.latitude} onChange={(e) => updateLocation(index, { latitude: e.target.value })} slotProps={{ input: { step: 'any' } }} />
                            </FormControl>
                          </Grid>
                          <Grid xs={6}>
                            <FormControl required={index === 0}>
                              <Input type="number" placeholder="Longitude" value={loc.longitude} onChange={(e) => updateLocation(index, { longitude: e.target.value })} slotProps={{ input: { step: 'any' } }} />
                            </FormControl>
                          </Grid>
                        </Grid>
                        <Stack direction="row" justifyContent="flex-end" gap={1}>
                          {locations.length > 1 && (
                            <Button size="sm" variant="outlined" color="danger" onClick={() => setLocations((prev) => prev.filter((_, i) => i !== index))}>Remove</Button>
                          )}
                        </Stack>
                      </Stack>
                    ))}
                    <Button size="sm" variant="soft" onClick={() => setLocations((prev) => [...prev, { address: "", latitude: "", longitude: "" }])}>Add Location</Button>
                  </>
                )}

                {currentStep === 3 && (
                  <Grid container spacing={2}>
                    <Grid xs={12}>
                      <Typography level="body-sm" sx={{ mb: 2, color: 'text.secondary' }}>
                        Contact information and social media links (all optional)
                      </Typography>
                    </Grid>
                    <Grid xs={12} md={6}>
                      <FormControl>
                        <FormLabel>Contact Number</FormLabel>
                        <Input name="contact_number" value={formData.contact_number} onChange={handleChange} placeholder="e.g., 09123456789" />
                      </FormControl>
                    </Grid>
                    <Grid xs={12} md={6}>
                      <FormControl>
                        <FormLabel>Website</FormLabel>
                        <Input name="website" value={formData.website} onChange={handleChange} placeholder="https://example.com" />
                      </FormControl>
                    </Grid>
                    <Grid xs={12} md={4}>
                      <FormControl>
                        <FormLabel>Facebook</FormLabel>
                        <Input name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/..." />
                      </FormControl>
                    </Grid>
                    <Grid xs={12} md={4}>
                      <FormControl>
                        <FormLabel>Instagram</FormLabel>
                        <Input name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/..." />
                      </FormControl>
                    </Grid>
                    <Grid xs={12} md={4}>
                      <FormControl>
                        <FormLabel>Twitter</FormLabel>
                        <Input name="twitter" value={formData.twitter} onChange={handleChange} placeholder="https://x.com/..." />
                      </FormControl>
                    </Grid>
                  </Grid>
                )}

                {currentStep === 4 && (
                  <>
                    <Grid container spacing={2} sx={{ mb: 1 }}>
                      <Grid xs={12} md={6}>
                        <FormControl>
                          <FormLabel>Main Photo</FormLabel>
                          <Input
                            component="input"
                            slotProps={{
                              input: {
                                type: 'file',
                                accept: 'image/*',
                                onChange: (e: React.ChangeEvent<HTMLInputElement>) => setMainPhoto(e.target.files?.[0] ?? null),
                              },
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid xs={12} md={6}>
                        <FormControl>
                          <FormLabel>Gallery Photos</FormLabel>
                          <Input
                            component="input"
                            slotProps={{
                              input: {
                                type: 'file',
                                accept: 'image/*',
                                multiple: true,
                                onChange: (e: React.ChangeEvent<HTMLInputElement>) => setGalleryPhotos(Array.from(e.target.files ?? [])),
                              },
                            }}
                          />
                        </FormControl>
                      </Grid>
                    </Grid>

                    <FormControl>
                      <FormLabel>Description</FormLabel>
                      <Textarea minRows={2} name="description" value={formData.description} onChange={handleChange} />
                    </FormControl>
                  </>
                )}
              </Stack>
            </Grid>

            <Grid xs={12} md={3}>
              <Stack spacing={2}>
                {mode === "edit" && (
                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={formData.status}
                      onChange={(_e, value) =>
                        setFormData((prev) => ({ ...prev, status: (value as any) as "active" | "inactive" | "pending" }))
                      }
                    >
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                      <Option value="pending">Pending</Option>
                    </Select>
                  </FormControl>
                )}
              </Stack>
            </Grid>
          </Grid>

          <Divider />
          <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} justifyContent="space-between" sx={{ mt: 2 }}>
            <Button type="button" variant="soft" color="neutral" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Stack direction="row" gap={1.5}>
              {currentStep > 0 && (
                <Button type="button" variant="outlined" onClick={handleBack} disabled={loading}>Back</Button>
              )}
              {currentStep < 4 ? (
                <Button type="button" variant="solid" onClick={handleNext} disabled={loading || !isStepValid(currentStep)}>Next</Button>
              ) : (
                <Button type="submit" variant="solid" color="primary" disabled={loading || !(isStepValid(0) && isStepValid(1) && isStepValid(2) && isStepValid(3) && isStepValid(4))}>
                  {loading ? (mode === "add" ? "Adding..." : "Updating...") : mode === "add" ? "Add Event" : "Update Event"}
                </Button>
              )}
            </Stack>
          </Stack>
      </form>
      </ModalDialog>
    </Modal>
  );
};

export default EventForm;
