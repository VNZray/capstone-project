import { useState, useEffect } from "react";
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Stack,
  Select,
  Option,
  Chip,
  ChipDelete,
  Box,
  Divider,
  Alert,
} from "@mui/joy";
import { FiInfo, FiPlus } from "react-icons/fi";
import type {
  Service,
  CreateServicePayload,
} from "@/src/types/Service";
import type { ShopCategoryAssignment, CreateShopCategoryPayload } from "@/src/types/ShopCategory";

interface ServiceFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateServicePayload) => Promise<void>;
  onCreateCategory: (payload: CreateShopCategoryPayload) => Promise<ShopCategoryAssignment>;
  service?: Service | null;
  categories: ShopCategoryAssignment[];
  businessId: string;
}

export default function ServiceFormModal({
  open,
  onClose,
  onSubmit,
  onCreateCategory,
  service,
  categories,
  businessId,
}: ServiceFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    base_price: "",
    price_type: "fixed" as "fixed" | "per_hour" | "per_person" | "custom",
    duration_value: "",
    duration_unit: "hours" as "minutes" | "hours" | "days" | "weeks",
    capacity: "",
    status: "active" as "active" | "inactive",
    terms_conditions: "",
    cancellation_policy: "",
    advance_booking_hours: "",
  });

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with service data when editing
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || "",
        description: service.description || "",
        base_price: service.base_price?.toString() || "",
        price_type: service.price_type || "fixed",
        duration_value: service.duration_value?.toString() || "",
        duration_unit: service.duration_unit || "hours",
        capacity: service.capacity?.toString() || "",
        status: service.status || "active",
        terms_conditions: service.terms_conditions || "",
        cancellation_policy: service.cancellation_policy || "",
        advance_booking_hours: service.advance_booking_hours?.toString() || "",
      });
      setSelectedCategoryIds(
        service.categories?.map((cat) => cat.id) || []
      );
    } else {
      // Reset form for new service
      setFormData({
        name: "",
        description: "",
        base_price: "",
        price_type: "fixed",
        duration_value: "",
        duration_unit: "hours",
        capacity: "",
        status: "active",
        terms_conditions: "",
        cancellation_policy: "",
        advance_booking_hours: "",
      });
      setSelectedCategoryIds([]);
    }
    setError(null);
    setNewCategoryName("");
    setNewCategoryDescription("");
    setCategoryModalOpen(false);
    setIsCreatingCategory(false);
  }, [service, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError("Service name is required");
      return;
    }

    if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
      setError("Base price must be greater than 0");
      return;
    }

    if (selectedCategoryIds.length === 0) {
      setError("Please select at least one category");
      return;
    }

    setLoading(true);

    try {
      const payload: CreateServicePayload = {
        business_id: businessId,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        base_price: parseFloat(formData.base_price),
        price_type: formData.price_type,
        duration_value: formData.duration_value
          ? parseInt(formData.duration_value)
          : undefined,
        duration_unit: formData.duration_value ? formData.duration_unit : undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        status: formData.status,
        terms_conditions: formData.terms_conditions.trim() || undefined,
        cancellation_policy: formData.cancellation_policy.trim() || undefined,
        advance_booking_hours: formData.advance_booking_hours
          ? parseInt(formData.advance_booking_hours)
          : undefined,
        category_ids: selectedCategoryIds,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      console.error("Error saving service:", err);
      const errorMessage = err && typeof err === 'object' && 'response' in err && 
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data
        ? String(err.response.data.message)
        : "Failed to save service";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = (categoryId: string | null) => {
    if (!categoryId) return;
    if (!selectedCategoryIds.includes(categoryId)) {
      setSelectedCategoryIds([...selectedCategoryIds, categoryId]);
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== categoryId));
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setError("Category name is required");
      return;
    }

    setIsCreatingCategory(true);
    setError(null);

    try {
      const newCategory = await onCreateCategory({
        business_id: businessId,
        name: newCategoryName.trim(),
        status: "active",
      });

      // Add the new category to selected categories
      setSelectedCategoryIds([...selectedCategoryIds, newCategory.id]);
      
      // Reset category form and close modal
      setNewCategoryName("");
      setNewCategoryDescription("");
      setCategoryModalOpen(false);
    } catch (err: unknown) {
      console.error("Error creating category:", err);
      const errorMessage = err && typeof err === 'object' && 'response' in err && 
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data
        ? String(err.response.data.message)
        : "Failed to create category";
      setError(errorMessage);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const getSelectedCategories = () => {
    return selectedCategoryIds
      .map((id) => categories.find((cat) => cat.id === id))
      .filter((cat): cat is ShopCategoryAssignment => cat !== undefined);
  };

  const availableCategories = categories.filter(
    (cat) => !selectedCategoryIds.includes(cat.id)
  );

  return (
    <>
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          maxWidth: 600,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <ModalClose />
        <Typography level="h4" fontWeight={700} mb={2}>
          {service ? "Edit Service" : "Add New Service"}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {error && (
              <Alert color="danger" variant="soft" startDecorator={<FiInfo />}>
                {error}
              </Alert>
            )}

            {/* Basic Information */}
            <Typography level="title-sm" fontWeight={600}>
              Basic Information
            </Typography>

            <FormControl required>
              <FormLabel>Service Name</FormLabel>
              <Input
                placeholder="e.g., Massage Therapy, Guided Tour"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                minRows={2}
                placeholder="Describe your service..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </FormControl>

            <Divider />

            {/* Categories */}
            <Typography level="title-sm" fontWeight={600}>
              Categories
            </Typography>

            <FormControl>
              <FormLabel>Select Categories</FormLabel>
              
              {/* Display selected categories as chips */}
              {getSelectedCategories().length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                  {getSelectedCategories().map((category, index) => (
                    <Chip
                      key={category.id}
                      variant={index === 0 ? "solid" : "outlined"}
                      color={index === 0 ? "primary" : "neutral"}
                      endDecorator={
                        <ChipDelete onDelete={() => handleRemoveCategory(category.id)} />
                      }
                    >
                      {category.name}
                    </Chip>
                  ))}
                </Box>
              )}
              
              <Select
                placeholder={selectedCategoryIds.length > 0 ? "Add another category..." : "Select a category"}
                value={null}
                onChange={(_, value) => {
                  if (value === "__create_new__") {
                    setCategoryModalOpen(true);
                  } else {
                    handleAddCategory(value as string | null);
                  }
                }}
                disabled={loading || isCreatingCategory}
              >
                {/* Create New Category Option */}
                <Option key="create_new" value="__create_new__">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FiPlus />
                    <span>Create New Category</span>
                  </Stack>
                </Option>
                
                {/* Only show unselected categories */}
                {availableCategories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
              
              <Typography level="body-xs" color="neutral" sx={{ mt: 0.5 }}>
                First category selected is the primary category
              </Typography>
            </FormControl>

            <Divider />

            {/* Pricing & Duration */}
            <Typography level="title-sm" fontWeight={600}>
              Pricing & Duration
            </Typography>

            <Stack direction="row" spacing={2}>
              <FormControl sx={{ flex: 1 }}>
                <FormLabel>Price Type</FormLabel>
                <Select
                  value={formData.price_type}
                  onChange={(_, value) =>
                    setFormData({
                      ...formData,
                      price_type: value as typeof formData.price_type,
                    })
                  }
                >
                  <Option value="fixed">Fixed Price</Option>
                  <Option value="per_hour">Per Hour</Option>
                  <Option value="per_person">Per Person</Option>
                  <Option value="custom">Custom</Option>
                </Select>
              </FormControl>

              <FormControl required sx={{ flex: 1 }}>
                <FormLabel>Base Price (₱)</FormLabel>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.base_price}
                  onChange={(e) =>
                    setFormData({ ...formData, base_price: e.target.value })
                  }
                  slotProps={{
                    input: {
                      min: "0",
                      step: "0.01",
                    },
                  }}
                />
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={2}>
              <FormControl sx={{ flex: 2 }}>
                <FormLabel>Duration</FormLabel>
                <Input
                  type="number"
                  placeholder="e.g., 2"
                  value={formData.duration_value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_value: e.target.value,
                    })
                  }
                  slotProps={{
                    input: {
                      min: "0",
                      step: "1",
                    },
                  }}
                />
              </FormControl>

              <FormControl sx={{ flex: 1 }}>
                <FormLabel>Unit</FormLabel>
                <Select
                  value={formData.duration_unit}
                  onChange={(_, value) =>
                    setFormData({
                      ...formData,
                      duration_unit: value as typeof formData.duration_unit,
                    })
                  }
                >
                  <Option value="minutes">Minutes</Option>
                  <Option value="hours">Hours</Option>
                  <Option value="days">Days</Option>
                  <Option value="weeks">Weeks</Option>
                </Select>
              </FormControl>
            </Stack>

            <Divider />

            {/* Booking Settings */}
            <Typography level="title-sm" fontWeight={600}>
              Booking Settings
            </Typography>

            <Stack direction="row" spacing={2}>
              <FormControl sx={{ flex: 1 }}>
                <FormLabel>Capacity</FormLabel>
                <Input
                  type="number"
                  placeholder="Max people"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  slotProps={{
                    input: {
                      min: "1",
                    },
                  }}
                />
              </FormControl>

              <FormControl sx={{ flex: 1 }}>
                <FormLabel>Advance Booking (hours)</FormLabel>
                <Input
                  type="number"
                  placeholder="e.g., 24"
                  value={formData.advance_booking_hours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      advance_booking_hours: e.target.value,
                    })
                  }
                  slotProps={{
                    input: {
                      min: "0",
                    },
                  }}
                />
                <Typography level="body-xs" color="neutral" sx={{ mt: 0.5 }}>
                  Minimum hours required before customers can book. Example: 24 hours = customers must book at least 1 day ahead
                </Typography>
              </FormControl>
            </Stack>

            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select
                value={formData.status}
                onChange={(_, value) =>
                  setFormData({
                    ...formData,
                    status: value as typeof formData.status,
                  })
                }
              >
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </FormControl>

            <Divider />

            {/* Policies */}
            <Typography level="title-sm" fontWeight={600}>
              Terms & Policies (Optional)
            </Typography>

            <FormControl>
              <FormLabel>Terms & Conditions</FormLabel>
              <Textarea
                minRows={2}
                placeholder="Service terms and conditions..."
                value={formData.terms_conditions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    terms_conditions: e.target.value,
                  })
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel>Cancellation Policy</FormLabel>
              <Textarea
                minRows={2}
                placeholder="Cancellation and refund policy..."
                value={formData.cancellation_policy}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cancellation_policy: e.target.value,
                  })
                }
              />
            </FormControl>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2}>
              <Button variant="outlined" color="neutral" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                {service ? "Update Service" : "Add Service"}
              </Button>
            </Stack>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>

    {/* Category Creation Modal - Separate */}
    <Modal open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)}>
      <ModalDialog size="sm" sx={{ maxWidth: 400, width: "90%" }}>
        <ModalClose />
        <Typography level="h4" fontWeight={700} mb={2}>
          Create New Category
        </Typography>

        <Stack spacing={2}>
          <FormControl error={!!error && error.includes("Category name")}>
            <FormLabel>Category Name *</FormLabel>
            <Input
              placeholder="e.g., Spa Services, Tours, Activities"
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                if (error) setError(null);
              }}
              disabled={isCreatingCategory}
              autoFocus
            />
            {error && error.includes("Category name") && (
              <Typography level="body-sm" color="danger">
                {error}
              </Typography>
            )}
          </FormControl>

          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea
              placeholder="Brief description of this category (optional)"
              minRows={2}
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              disabled={isCreatingCategory}
            />
          </FormControl>

          {error && !error.includes("Category name") && (
            <Typography level="body-sm" color="danger">
              {error}
            </Typography>
          )}

          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => {
                setCategoryModalOpen(false);
                setNewCategoryName("");
                setNewCategoryDescription("");
                setError(null);
              }}
              disabled={isCreatingCategory}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCategory}
              loading={isCreatingCategory}
              startDecorator={<FiPlus />}
            >
              Create Category
            </Button>
          </Stack>
        </Stack>
      </ModalDialog>
    </Modal>
    </>
  );
}
