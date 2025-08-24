import React, { useEffect, useMemo, useState } from "react";
import { IoClose } from "react-icons/io5";
import { apiService } from "../../utils/api";
import MapInput from "./MapInput";
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
  Select,
  Option,
  Divider,
  Switch,
} from "@mui/joy";
import type {
  Category,
  Province,
  Municipality,
  Barangay,
  TouristSpot,
} from "../../types/TouristSpot";

interface TouristSpotFormProps {
  isVisible: boolean;
  onClose: () => void;
  onSpotAdded?: () => void;
  onSpotUpdated?: () => void;
  mode: "add" | "edit";
  initialData?: TouristSpot;
}

type Option = { id: number; label: string };

type DaySchedule = {
  dayIndex: number;
  is_closed: boolean;
  open_time: string;
  close_time: string;
};

const TouristSpotForm: React.FC<TouristSpotFormProps> = ({
  isVisible,
  onClose,
  onSpotAdded,
  onSpotUpdated,
  mode,
  initialData,
}) => {
  const [formData, setFormData] = useState({
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
    category_id: "3",
    type_id: "",
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
      open_time: "00:00",
      close_time: "00:00",
    }))
  );

  const provinceOptions = useMemo<Option[]>(
    () => provinces.map((p) => ({ id: p.id, label: p.province })),
    [provinces]
  );
  const municipalityOptions = useMemo<Option[]>(
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
  const barangayOptions = useMemo<Option[]>(
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
  const categoryOptions = useMemo<Option[]>(
    () => categories.map((c) => ({ id: c.id, label: c.category })),
    [categories]
  );

  const selectedProvince = useMemo<Option | null>(
    () =>
      provinceOptions.find((o) => o.id === Number(formData.province_id)) ??
      null,
    [provinceOptions, formData.province_id]
  );
  const selectedMunicipality = useMemo<Option | null>(
    () =>
      municipalityOptions.find(
        (o) => o.id === Number(formData.municipality_id)
      ) ?? null,
    [municipalityOptions, formData.municipality_id]
  );
  const selectedBarangay = useMemo<Option | null>(
    () =>
      barangayOptions.find((o) => o.id === Number(formData.barangay_id)) ??
      null,
    [barangayOptions, formData.barangay_id]
  );
  const selectedCategory = useMemo<Option | null>(
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
      // load schedules from API
      (async () => {
        try {
          const scheds = await apiService.getTouristSpotSchedules(
            initialData.id
          );
          // Map API day_of_week (0..6) to UI DaySchedule preserving order Monday..Sunday
          const ui = Array.from({ length: 7 }, (_, idx) => {
            const found = scheds.find((s) => s.day_of_week === idx);
            return {
              dayIndex: idx,
              is_closed: found?.is_closed ?? false,
              open_time: found?.open_time ?? null,
              close_time: found?.close_time ?? null,
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
        category_id: "3",
        type_id: "",
        spot_status: "" as "" | "pending" | "active" | "inactive",
      });
      setSchedules(
        Array.from({ length: 7 }, (_, idx) => ({
          dayIndex: idx,
          is_closed: true,
          open_time: "00:00",
          close_time: "00:00",
        }))
      );
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
        type_id: 4,
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
        await apiService.createTouristSpot({
          ...spotData,
          schedules: mappedSchedules,
        });
        alert("Spot added successfully!");
        onSpotAdded?.();
      } else {
        if (!initialData?.id) throw new Error("No ID provided for update");
        await apiService.submitEditRequest(initialData.id, {
          ...spotData,
          ...(formData.spot_status
            ? {
                spot_status: formData.spot_status as "active" | "inactive",
              }
            : {}),
        });
        alert(
          "Edit request submitted successfully! It is now pending admin approval."
        );
        onSpotUpdated?.();
      }
      onClose();
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

  return (
    <Modal open={isVisible} onClose={onClose}>
      <ModalDialog
        size="lg"
        sx={{
          width: "90%",
          maxWidth: 1400,
          maxHeight: "100vh",
          overflow: "auto",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1 }}
        >
          <DialogTitle>
            <Typography level="h4">
              {mode === "add" ? "Add New Tourist Spot" : "Edit Tourist Spot"}
            </Typography>
          </DialogTitle>
          <IconButton size="sm" variant="soft" onClick={onClose}>
            <IoClose />
          </IconButton>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Left column (65%): main fields + schedule */}
            <Grid xs={12} md={8}>
              <Stack spacing={2}>
                <FormControl required>
                  <FormLabel>Name</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </FormControl>

                <FormControl required>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    minRows={2}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <Grid container spacing={2}>
                  <Grid xs={12} md={7}>
                    <FormControl required>
                      <FormLabel>Category</FormLabel>
                      <Autocomplete<Option>
                        options={categoryOptions}
                        value={selectedCategory}
                        isOptionEqualToValue={(a, b) => a?.id === b?.id}
                        getOptionLabel={(opt) => opt?.label ?? ""}
                        onChange={(_e, val) =>
                          setFormData((prev) => ({
                            ...prev,
                            category_id: val?.id.toString() || "",
                          }))
                        }
                        placeholder="Select Category"
                      />
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={5}>
                    <FormControl>
                      <FormLabel>Entry Fee (₱)</FormLabel>
                      <Input
                        type="number"
                        name="entry_fee"
                        value={formData.entry_fee}
                        onChange={handleInputChange}
                        placeholder="(if applicable)"
                        slotProps={{ input: { step: "0.01" } }}
                      />
                    </FormControl>
                  </Grid>
                </Grid>

                <Divider>
                  <Typography level="title-sm">Contact Information</Typography>
                </Divider>

                <Grid container spacing={2}>
                  <Grid xs={12} md={4}>
                    <FormControl>
                      <Input
                        type="tel"
                        name="contact_phone"
                        value={formData.contact_phone}
                        onChange={handleInputChange}
                        placeholder="Mobile Number"
                      />
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={4}>
                    <FormControl>
                      <Input
                        type="email"
                        name="contact_email"
                        value={formData.contact_email}
                        onChange={handleInputChange}
                        placeholder="Email"
                      />
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={4}>
                    <FormControl>
                      <Input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="Links"
                      />
                    </FormControl>
                  </Grid>
                </Grid>

                <Divider>
                  <Typography level="title-sm">Schedule</Typography>
                </Divider>
                <Stack spacing={1}>
                  {schedules.map((sched) => (
                    <Grid
                      container
                      spacing={1}
                      alignItems="center"
                      key={sched.dayIndex}
                    >
                      <Grid xs={12} sm={1}></Grid>
                      <Grid xs={12} sm={2}>
                        <FormLabel>{daysOfWeek[sched.dayIndex]}</FormLabel>
                      </Grid>
                      <Grid xs={6} sm={3}>
                        <FormControl>
                          <Input
                            type="time"
                            value={sched.open_time}
                            disabled={sched.is_closed}
                            onChange={(e) => {
                              const v = e.target.value;
                              setSchedules((prev) =>
                                prev.map((s) =>
                                  s.dayIndex === sched.dayIndex
                                    ? { ...s, open_time: v }
                                    : s
                                )
                              );
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid xs={6} sm={3}>
                        <FormControl>
                          <Input
                            type="time"
                            value={sched.close_time}
                            disabled={sched.is_closed}
                            onChange={(e) => {
                              const v = e.target.value;
                              setSchedules((prev) =>
                                prev.map((s) =>
                                  s.dayIndex === sched.dayIndex
                                    ? { ...s, close_time: v }
                                    : s
                                )
                              );
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid xs={12} sm={1}>
                        <FormControl orientation="horizontal">
                          <FormLabel>Closed</FormLabel>
                          <Switch
                            checked={sched.is_closed}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSchedules((prev) =>
                                prev.map((s) =>
                                  s.dayIndex === sched.dayIndex
                                    ? { ...s, is_closed: checked }
                                    : s
                                )
                              );
                            }}
                          />
                        </FormControl>
                      </Grid>
                      <Grid xs={12} sm={1}></Grid>
                    </Grid>
                  ))}
                </Stack>
              </Stack>
            </Grid>

            {/* Right column (35%): map + lat/long + address */}
            <Grid xs={12} md={4}>
              <Stack spacing={2}>
                <Typography level="title-sm">Address</Typography>
                <FormControl required>
                  <Autocomplete<Option>
                    options={provinceOptions}
                    value={selectedProvince}
                    isOptionEqualToValue={(a, b) => a?.id === b?.id}
                    getOptionLabel={(opt) => opt?.label ?? ""}
                    onChange={(_e, val) =>
                      setFormData((prev) => ({
                        ...prev,
                        province_id: val?.id.toString() || "",
                        municipality_id: "",
                        barangay_id: "",
                      }))
                    }
                    placeholder="Select Province"
                  />
                </FormControl>

                <FormControl required>
                  <Autocomplete<Option>
                    options={municipalityOptions}
                    value={selectedMunicipality}
                    isOptionEqualToValue={(a, b) => a?.id === b?.id}
                    getOptionLabel={(opt) => opt?.label ?? ""}
                    onChange={(_e, val) =>
                      setFormData((prev) => ({
                        ...prev,
                        municipality_id: val?.id.toString() || "",
                        barangay_id: "",
                      }))
                    }
                    placeholder="Select Municipality"
                    disabled={!formData.province_id}
                  />
                </FormControl>

                <FormControl required>
                  <Autocomplete<Option>
                    options={barangayOptions}
                    value={selectedBarangay}
                    isOptionEqualToValue={(a, b) => a?.id === b?.id}
                    getOptionLabel={(opt) => opt?.label ?? ""}
                    onChange={(_e, val) =>
                      setFormData((prev) => ({
                        ...prev,
                        barangay_id: val?.id.toString() || "",
                      }))
                    }
                    placeholder="Select Barangay"
                    disabled={!formData.municipality_id}
                  />
                </FormControl>

                <Typography level="title-md">Location</Typography>
                <MapInput
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onChange={(lat, lng) =>
                    setFormData((prev) => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                    }))
                  }
                />

                <Grid container spacing={2}>
                  <Grid xs={6}>
                    <FormControl>
                      <Input
                        type="number"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        placeholder="e.g., 13.6191"
                        slotProps={{ input: { step: "any" } }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid xs={6}>
                    <FormControl>
                      <Input
                        type="number"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        placeholder="e.g., 123.1814"
                        slotProps={{ input: { step: "any" } }}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                {mode === "edit" && (
                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={formData.spot_status}
                      onChange={(_e, value) =>
                        setFormData((prev) => ({
                          ...prev,
                          spot_status: (value as string) as "pending" | "active" | "inactive",
                        }))
                      }
                      slotProps={{ root: { sx: { width: '100%' } } }}
                    >
                      <Option value="pending">Pending</Option>
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                    </Select>
                  </FormControl>
                )}
              </Stack>
            </Grid>
          </Grid>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            gap={1.5}
            justifyContent="flex-end"
            sx={{ mt: 3 }}
          >
            <Button
              type="button"
              variant="soft"
              color="neutral"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            {mode === "edit" && initialData?.id && (
              <Button
                type="button"
                variant="outlined"
                color="primary"
                disabled={loading}
                onClick={async () => {
                  try {
                    setLoading(true);
                    const mapped = schedules.map((s) => ({
                      day_of_week: s.dayIndex,
                      is_closed: s.is_closed,
                      open_time: s.is_closed ? null : s.open_time,
                      close_time: s.is_closed ? null : s.close_time,
                    }));
                    await apiService.saveTouristSpotSchedules(
                      initialData.id,
                      mapped
                    );
                    alert("Schedules saved");
                  } catch (e) {
                    console.error(e);
                    alert("Failed to save schedules");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Save Schedules
              </Button>
            )}
            <Button
              type="submit"
              variant="solid"
              color="primary"
              disabled={loading}
            >
              {loading
                ? mode === "add"
                  ? "Adding..."
                  : "Updating..."
                : mode === "add"
                ? "Add Spot"
                : "Update Spot"}
            </Button>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
};

export default TouristSpotForm;
