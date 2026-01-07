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
  ContactMethod,
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
    image_url: "",
    base_price: "",
    price_type: "fixed" as "per_hour" | "per_day" | "per_week" | "per_month" | "per_session" | "fixed",
    requirements: "",
    contact_notes: "",
    display_order: "",
    status: "active" as "active" | "inactive" | "seasonal",
  });

  const [contactMethods, setContactMethods] = useState<ContactMethod[]>([]);
  const [newContactType, setNewContactType] = useState<ContactMethod["type"]>("phone");
  const [newContactValue, setNewContactValue] = useState("");
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
        image_url: service.image_url || "",
        base_price: service.base_price?.toString() || "",
        price_type: service.price_type || "fixed",
        requirements: service.requirements || "",
        contact_notes: service.contact_notes || "",
        display_order: service.display_order?.toString() || "0",
        status: service.status || "active",
      });
      setContactMethods(service.contact_methods || []);
      setSelectedCategoryIds(
        service.categories?.map((cat) => cat.id).filter((id): id is string => !!id) || []
      );
    } else {
      // Reset form for new service
      setFormData({
        name: "",
        description: "",
        image_url: "",
        base_price: "",
        price_type: "fixed",
        requirements: "",
        contact_notes: "",
        display_order: "0",
        status: "active",
      });
      setContactMethods([]);
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
      // Filter out any null/undefined category IDs as a safety measure
      const validCategoryIds = selectedCategoryIds.filter((id): id is string => !!id);
      
      const payload: CreateServicePayload = {
        business_id: businessId,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        image_url: formData.image_url.trim() || undefined,
        base_price: parseFloat(formData.base_price),
        price_type: formData.price_type,
        requirements: formData.requirements.trim() || undefined,
        contact_methods: contactMethods.length > 0 ? contactMethods : undefined,
        contact_notes: formData.contact_notes.trim() || undefined,
        display_order: formData.display_order ? parseInt(formData.display_order) : undefined,
        status: formData.status,
        category_ids: validCategoryIds,
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

  const handleAddContactMethod = () => {
    if (!newContactValue.trim()) {
      setError("Contact value is required");
      return;
    }

    setContactMethods([
      ...contactMethods,
      { type: newContactType, value: newContactValue.trim() }
    ]);
    setNewContactValue("");
    setError(null);
  };

  const handleRemoveContactMethod = (index: number) => {
    setContactMethods(contactMethods.filter((_, i) => i !== index));
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
      if (newCategory?.id) {
        setSelectedCategoryIds([...selectedCategoryIds, newCategory.id]);
      }
      
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

            {/* Pricing */}
            <Typography level="title-sm" fontWeight={600}>
              Pricing
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
                  <Option value="per_day">Per Day</Option>
                  <Option value="per_week">Per Week</Option>
                  <Option value="per_month">Per Month</Option>
                  <Option value="per_session">Per Session</Option>
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

            <FormControl>
              <FormLabel>Image URL</FormLabel>
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel>Requirements</FormLabel>
              <Textarea
                minRows={2}
                placeholder="What customers should know or bring..."
                value={formData.requirements}
                onChange={(e) =>
                  setFormData({ ...formData, requirements: e.target.value })
                }
              />
            </FormControl>

            <Divider />

            {/* Contact Methods */}
            <Typography level="title-sm" fontWeight={600}>
              Contact Methods
            </Typography>

            {contactMethods.length > 0 && (
              <Stack spacing={1}>
                {contactMethods.map((method, index) => (
                  <Chip
                    key={index}
                    variant="outlined"
                    endDecorator={
                      <ChipDelete onDelete={() => handleRemoveContactMethod(index)} />
                    }
                  >
                    <strong>{method.type}:</strong> {method.value}
                  </Chip>
                ))}
              </Stack>
            )}

            <Stack direction="row" spacing={1}>
              <FormControl sx={{ flex: 1 }}>
                <FormLabel>Type</FormLabel>
                <Select
                  value={newContactType}
                  onChange={(_, value) => setNewContactType(value as ContactMethod["type"])}
                >
                  <Option value="phone">Phone</Option>
                  <Option value="email">Email</Option>
                  <Option value="facebook">Facebook</Option>
                  <Option value="viber">Viber</Option>
                  <Option value="whatsapp">WhatsApp</Option>
                  <Option value="other">Other</Option>
                </Select>
              </FormControl>
              <FormControl sx={{ flex: 2 }}>
                <FormLabel>Value</FormLabel>
                <Input
                  placeholder="Contact value"
                  value={newContactValue}
                  onChange={(e) => setNewContactValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddContactMethod();
                    }
                  }}
                />
              </FormControl>
              <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                <Button onClick={handleAddContactMethod} variant="outlined">
                  <FiPlus />
                </Button>
              </Box>
            </Stack>

            <FormControl>
              <FormLabel>Contact Notes</FormLabel>
              <Textarea
                minRows={2}
                placeholder="e.g., Call between 9 AM - 5 PM"
                value={formData.contact_notes}
                onChange={(e) =>
                  setFormData({ ...formData, contact_notes: e.target.value })
                }
              />
            </FormControl>

            <Divider />

            {/* Display Settings */}
            <Typography level="title-sm" fontWeight={600}>
              Display Settings
            </Typography>

            <FormControl>
              <FormLabel>Display Order</FormLabel>
              <Input
                type="number"
                placeholder="0"
                value={formData.display_order}
                onChange={(e) =>
                  setFormData({ ...formData, display_order: e.target.value })
                }
                slotProps={{
                  input: {
                    min: "0",
                  },
                }}
              />
              <Typography level="body-xs" color="neutral" sx={{ mt: 0.5 }}>
                Lower numbers appear first
              </Typography>
            </FormControl>

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
                <Option value="seasonal">Seasonal</Option>
              </Select>
            </FormControl>

            <Divider />

            {/* Categories */}
            <Typography level="title-sm" fontWeight={600}>
              Categories *
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

            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
              <Button variant="outlined" onClick={onClose} disabled={loading}>
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

    {/* Create Category Modal */}
    <Modal open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)}>
      <ModalDialog sx={{ maxWidth: 400, width: "100%" }}>
        <ModalClose />
        <Typography level="h4" fontWeight={700} mb={2}>
          Create New Category
        </Typography>

        <Stack spacing={2}>
          {error && (
            <Alert color="danger" variant="soft" startDecorator={<FiInfo />}>
              {error}
            </Alert>
          )}

          <FormControl required>
            <FormLabel>Category Name</FormLabel>
            <Input
              placeholder="e.g., Wellness Services"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              disabled={isCreatingCategory}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Description (Optional)</FormLabel>
            <Textarea
              minRows={2}
              placeholder="Brief description..."
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              disabled={isCreatingCategory}
            />
          </FormControl>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => setCategoryModalOpen(false)}
              disabled={isCreatingCategory}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCategory} loading={isCreatingCategory}>
              Create Category
            </Button>
          </Stack>
        </Stack>
      </ModalDialog>
    </Modal>
    </>
  );
}
