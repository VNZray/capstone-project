/**
 * Emergency Facility Form Component
 * Form for creating and editing emergency facilities
 */

import { useState, useEffect } from "react";
import {
  Modal,
  ModalDialog,
  ModalClose,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Option,
  Stack,
  Box,
  FormHelperText,
} from "@mui/joy";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import MapInput from "@/src/components/MapInput";
import { AddressService } from "@/src/services/AddressService";
import type {
  EmergencyFacility,
  CreateEmergencyFacilityInput,
  FacilityType,
  FacilityStatus,
} from "@/src/types/EmergencyFacility";

interface EmergencyFacilityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEmergencyFacilityInput) => Promise<void>;
  initialData?: EmergencyFacility;
  isLoading?: boolean;
}

interface AddressOption {
  id: number;
  name: string;
}

const FACILITY_TYPES: { value: FacilityType; label: string }[] = [
  { value: "police_station", label: "Police Station" },
  { value: "hospital", label: "Hospital" },
  { value: "fire_station", label: "Fire Station" },
  { value: "evacuation_center", label: "Evacuation Center" },
];

const FACILITY_STATUSES: { value: FacilityStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "under_maintenance", label: "Under Maintenance" },
];

export default function EmergencyFacilityForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: EmergencyFacilityFormProps) {
  const [formData, setFormData] = useState<CreateEmergencyFacilityInput>({
    name: "",
    description: "",
    facility_type: "police_station",
    barangay_id: 0,
    address: "",
    latitude: undefined,
    longitude: undefined,
    contact_phone: "",
    contact_email: "",
    emergency_hotline: "",
    operating_hours: "",
    facility_image: "",
    status: "active",
    capacity: undefined,
    services_offered: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [provinces, setProvinces] = useState<AddressOption[]>([]);
  const [municipalities, setMunicipalities] = useState<AddressOption[]>([]);
  const [barangays, setBarangays] = useState<AddressOption[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<
    number | null
  >(null);

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const data = await AddressService.getProvinces();
        setProvinces(data.map((p: any) => ({ id: p.id, name: p.province })));
      } catch (error) {
        console.error("Failed to load provinces:", error);
      }
    };
    loadProvinces();
  }, []);

  // Load municipalities when province changes
  useEffect(() => {
    if (!selectedProvince) {
      setMunicipalities([]);
      return;
    }
    const loadMunicipalities = async () => {
      try {
        const data = await AddressService.getMunicipalities(selectedProvince);
        setMunicipalities(
          data.map((m: any) => ({ id: m.id, name: m.municipality }))
        );
      } catch (error) {
        console.error("Failed to load municipalities:", error);
      }
    };
    loadMunicipalities();
  }, [selectedProvince]);

  // Load barangays when municipality changes
  useEffect(() => {
    if (!selectedMunicipality) {
      setBarangays([]);
      return;
    }
    const loadBarangays = async () => {
      try {
        const data = await AddressService.getBarangays(selectedMunicipality);
        setBarangays(data.map((b: any) => ({ id: b.id, name: b.barangay })));
      } catch (error) {
        console.error("Failed to load barangays:", error);
      }
    };
    loadBarangays();
  }, [selectedMunicipality]);

  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || "",
        facility_type: initialData.facility_type,
        barangay_id: initialData.barangay_id,
        address: initialData.address || "",
        latitude: initialData.latitude,
        longitude: initialData.longitude,
        contact_phone: initialData.contact_phone || "",
        contact_email: initialData.contact_email || "",
        emergency_hotline: initialData.emergency_hotline || "",
        operating_hours: initialData.operating_hours || "",
        facility_image: initialData.facility_image || "",
        status: initialData.status,
        capacity: initialData.capacity,
        services_offered: initialData.services_offered || "",
      });

      // Load address hierarchy for editing
      if (initialData.barangay_id) {
        loadAddressHierarchy(initialData.barangay_id);
      }
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const loadAddressHierarchy = async (barangayId: number) => {
    try {
      const address = await AddressService.fetchFullAddress(barangayId);
      setSelectedProvince(address.province_id);
      setSelectedMunicipality(address.municipality_id);
    } catch (error) {
      console.error("Failed to load address hierarchy:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      facility_type: "police_station",
      barangay_id: 0,
      address: "",
      latitude: undefined,
      longitude: undefined,
      contact_phone: "",
      contact_email: "",
      emergency_hotline: "",
      operating_hours: "",
      facility_image: "",
      status: "active",
      capacity: undefined,
      services_offered: "",
    });
    setSelectedProvince(null);
    setSelectedMunicipality(null);
    setErrors({});
  };

  const handleChange = (
    field: keyof CreateEmergencyFacilityInput,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleLocationChange = (lat: string, lng: string) => {
    setFormData((prev) => ({
      ...prev,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.facility_type) {
      newErrors.facility_type = "Facility type is required";
    }
    if (!formData.barangay_id || formData.barangay_id === 0) {
      newErrors.barangay_id = "Barangay is required";
    }
    if (
      formData.contact_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)
    ) {
      newErrors.contact_email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await onSubmit(formData);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalDialog
        sx={{
          width: "100%",
          maxWidth: 700,
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <ModalClose />
        <Typography.CardTitle>
          {initialData ? "Edit Emergency Facility" : "Add Emergency Facility"}
        </Typography.CardTitle>

        <Stack spacing={2} sx={{ mt: 2 }}>
          {/* Basic Information */}
          <Box>
            <Typography.Label sx={{ mb: 1 }}>
              Basic Information
            </Typography.Label>
            <Stack spacing={2}>
              <FormControl error={!!errors.name}>
                <FormLabel>Facility Name *</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter facility name"
                />
                {errors.name && <FormHelperText>{errors.name}</FormHelperText>}
              </FormControl>

              <FormControl error={!!errors.facility_type}>
                <FormLabel>Facility Type *</FormLabel>
                <Select
                  value={formData.facility_type}
                  onChange={(_, value) => handleChange("facility_type", value)}
                >
                  {FACILITY_TYPES.map((type) => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
                {errors.facility_type && (
                  <FormHelperText>{errors.facility_type}</FormHelperText>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(_, value) => handleChange("status", value)}
                >
                  {FACILITY_STATUSES.map((status) => (
                    <Option key={status.value} value={status.value}>
                      {status.label}
                    </Option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Enter description"
                  minRows={3}
                />
              </FormControl>
            </Stack>
          </Box>

          {/* Location */}
          <Box>
            <Typography.Label sx={{ mb: 1 }}>Location</Typography.Label>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2}>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Province</FormLabel>
                  <Select
                    value={selectedProvince}
                    onChange={(_, value) => {
                      setSelectedProvince(value);
                      setSelectedMunicipality(null);
                      handleChange("barangay_id", 0);
                    }}
                    placeholder="Select province"
                  >
                    {provinces.map((p) => (
                      <Option key={p.id} value={p.id}>
                        {p.name}
                      </Option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Municipality</FormLabel>
                  <Select
                    value={selectedMunicipality}
                    onChange={(_, value) => {
                      setSelectedMunicipality(value);
                      handleChange("barangay_id", 0);
                    }}
                    placeholder="Select municipality"
                    disabled={!selectedProvince}
                  >
                    {municipalities.map((m) => (
                      <Option key={m.id} value={m.id}>
                        {m.name}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              <FormControl error={!!errors.barangay_id}>
                <FormLabel>Barangay *</FormLabel>
                <Select
                  value={formData.barangay_id || null}
                  onChange={(_, value) => handleChange("barangay_id", value)}
                  placeholder="Select barangay"
                  disabled={!selectedMunicipality}
                >
                  {barangays.map((b) => (
                    <Option key={b.id} value={b.id}>
                      {b.name}
                    </Option>
                  ))}
                </Select>
                {errors.barangay_id && (
                  <FormHelperText>{errors.barangay_id}</FormHelperText>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Street Address</FormLabel>
                <Input
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Enter street address"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Map Location</FormLabel>
                <Box
                  sx={{ height: 300, borderRadius: "md", overflow: "hidden" }}
                >
                  <MapInput
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    onChange={handleLocationChange}
                  />
                </Box>
              </FormControl>
            </Stack>
          </Box>

          {/* Contact Information */}
          <Box>
            <Typography.Label sx={{ mb: 1 }}>
              Contact Information
            </Typography.Label>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2}>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Contact Phone</FormLabel>
                  <Input
                    value={formData.contact_phone}
                    onChange={(e) =>
                      handleChange("contact_phone", e.target.value)
                    }
                    placeholder="e.g., +63 912 345 6789"
                  />
                </FormControl>

                <FormControl sx={{ flex: 1 }} error={!!errors.contact_email}>
                  <FormLabel>Contact Email</FormLabel>
                  <Input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) =>
                      handleChange("contact_email", e.target.value)
                    }
                    placeholder="e.g., facility@email.com"
                  />
                  {errors.contact_email && (
                    <FormHelperText>{errors.contact_email}</FormHelperText>
                  )}
                </FormControl>
              </Stack>

              <FormControl>
                <FormLabel>Emergency Hotline</FormLabel>
                <Input
                  value={formData.emergency_hotline}
                  onChange={(e) =>
                    handleChange("emergency_hotline", e.target.value)
                  }
                  placeholder="e.g., 911 or 117"
                />
              </FormControl>
            </Stack>
          </Box>

          {/* Additional Information */}
          <Box>
            <Typography.Label sx={{ mb: 1 }}>
              Additional Information
            </Typography.Label>
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>Operating Hours</FormLabel>
                <Input
                  value={formData.operating_hours}
                  onChange={(e) =>
                    handleChange("operating_hours", e.target.value)
                  }
                  placeholder="e.g., 24/7 or Mon-Fri 8AM-5PM"
                />
              </FormControl>

              {formData.facility_type === "evacuation_center" && (
                <FormControl>
                  <FormLabel>Capacity (persons)</FormLabel>
                  <Input
                    type="number"
                    value={formData.capacity || ""}
                    onChange={(e) =>
                      handleChange(
                        "capacity",
                        parseInt(e.target.value) || undefined
                      )
                    }
                    placeholder="Enter maximum capacity"
                  />
                </FormControl>
              )}

              <FormControl>
                <FormLabel>Services Offered</FormLabel>
                <Textarea
                  value={formData.services_offered}
                  onChange={(e) =>
                    handleChange("services_offered", e.target.value)
                  }
                  placeholder="List the services offered by this facility"
                  minRows={2}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Facility Image URL</FormLabel>
                <Input
                  value={formData.facility_image}
                  onChange={(e) =>
                    handleChange("facility_image", e.target.value)
                  }
                  placeholder="Enter image URL"
                />
              </FormControl>
            </Stack>
          </Box>

          {/* Actions */}
          <Stack
            direction="row"
            spacing={2}
            justifyContent="flex-end"
            sx={{ mt: 2 }}
          >
            <Button variant="outlined" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={isLoading}>
              {initialData ? "Update" : "Create"} Facility
            </Button>
          </Stack>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}
