import { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Button,
  Stack,
  Box,
  Table,
  Chip,
  IconButton,
  Sheet,
  CircularProgress,
  Snackbar,
  Modal,
  ModalDialog,
  ModalClose,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from "@mui/joy";
import { FiPlus, FiEdit2, FiTrash2, FiCheckCircle, FiAlertCircle, FiTag, FiArrowLeft } from "react-icons/fi";
import PageContainer from "@/src/components/PageContainer";
import { useBusiness } from "@/src/context/BusinessContext";
import * as ProductService from "@/src/services/ProductService";
import type { ProductCategory, CreateCategoryPayload } from "@/src/types/Product";
import { useNavigate } from "react-router-dom";

export default function Categories() {
  const navigate = useNavigate();
  const { businessDetails } = useBusiness();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateCategoryPayload>({
    business_id: businessDetails?.id || "",
    name: "",
    description: "",
    display_order: 0,
    status: "active",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    if (!businessDetails?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const categoriesData = await ProductService.fetchProductCategoriesByBusinessId(businessDetails.id);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [businessDetails?.id]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Reset form
  const resetForm = () => {
    setFormData({
      business_id: businessDetails?.id || "",
      name: "",
      description: "",
      display_order: categories.length,
      status: "active",
    });
    setFormErrors({});
    setSelectedCategory(null);
  };

  // Open modal for add/edit
  const openModal = (category?: ProductCategory) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        business_id: category.business_id,
        name: category.name,
        description: category.description || "",
        display_order: category.display_order,
        status: category.status,
      });
    } else {
      resetForm();
    }
    setCategoryModalOpen(true);
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Category name is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!businessDetails?.id) return;

    try {
      if (selectedCategory) {
        await ProductService.updateProductCategory(selectedCategory.id, formData);
        setSuccess("Category updated successfully!");
      } else {
        await ProductService.createProductCategory(formData);
        setSuccess("Category created successfully!");
      }
      
      await fetchCategories();
      setCategoryModalOpen(false);
      resetForm();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving category:", err);
      setFormErrors({ submit: "Failed to save category. Please try again." });
    }
  };

  // Handle delete
  const handleDelete = async (categoryId: string) => {
    if (!window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return;
    }

    try {
      await ProductService.deleteProductCategory(categoryId);
      setSuccess("Category deleted successfully!");
      await fetchCategories();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting category:", err);
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to delete category.";
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    }
  };

  // Format status
  const formatStatus = (status: string): string => {
    return status.toUpperCase();
  };

  const getStatusColor = (status: string): "success" | "neutral" => {
    return status === "active" ? "success" : "neutral";
  };

  if (!businessDetails) {
    return (
      <PageContainer>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography level="body-lg" color="neutral">
            Please select a business to manage categories.
          </Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                variant="outlined"
                color="neutral"
                onClick={() => navigate("/business/store/products")}
              >
                <FiArrowLeft />
              </IconButton>
              <Box>
                <Typography level="h2" fontWeight={700}>
                  Product Categories
                </Typography>
                <Typography level="body-sm" color="neutral">
                  Organize your products into categories
                </Typography>
              </Box>
            </Stack>
          </Box>
          
          <Button
            startDecorator={<FiPlus />}
            onClick={() => openModal()}
          >
            Add Category
          </Button>
        </Stack>

        {/* Loading State */}
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {/* Categories Table */}
        {!loading && categories.length > 0 && (
          <Sheet variant="outlined" sx={{ borderRadius: "sm", overflow: "hidden" }}>
            <Table>
              <thead>
                <tr>
                  <th style={{ width: "5%" }}>Order</th>
                  <th style={{ width: "30%" }}>Category Name</th>
                  <th style={{ width: "45%" }}>Description</th>
                  <th style={{ width: "10%" }}>Status</th>
                  <th style={{ width: "10%", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <Typography level="body-sm" fontWeight={600}>
                        {category.display_order}
                      </Typography>
                    </td>
                    <td>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <FiTag size={16} />
                        <Typography level="body-sm" fontWeight={600}>
                          {category.name}
                        </Typography>
                      </Stack>
                    </td>
                    <td>
                      <Typography level="body-sm" color="neutral">
                        {category.description || "—"}
                      </Typography>
                    </td>
                    <td>
                      <Chip
                        size="sm"
                        color={getStatusColor(category.status)}
                        variant="soft"
                      >
                        {formatStatus(category.status)}
                      </Chip>
                    </td>
                    <td>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="neutral"
                          onClick={() => openModal(category)}
                        >
                          <FiEdit2 />
                        </IconButton>
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="danger"
                          onClick={() => handleDelete(category.id)}
                        >
                          <FiTrash2 />
                        </IconButton>
                      </Stack>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Sheet>
        )}

        {/* Empty State */}
        {!loading && categories.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              px: 2,
            }}
          >
            <FiTag size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography level="h4" mb={1}>
              No categories yet
            </Typography>
            <Typography level="body-sm" color="neutral" mb={3}>
              Create your first category to organize your products
            </Typography>
            <Button
              startDecorator={<FiPlus />}
              onClick={() => openModal()}
            >
              Add Category
            </Button>
          </Box>
        )}
      </Stack>

      {/* Category Form Modal */}
      <Modal open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)}>
        <ModalDialog size="md" sx={{ maxWidth: 500, width: "90%" }}>
          <ModalClose />
          <Typography level="h4" fontWeight={700} mb={2}>
            {selectedCategory ? "Edit Category" : "Add New Category"}
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {/* Category Name */}
              <FormControl error={!!formErrors.name}>
                <FormLabel>Category Name *</FormLabel>
                <Input
                  placeholder="e.g., Main Dishes, Desserts, Beverages"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  autoFocus
                />
                {formErrors.name && (
                  <Typography level="body-sm" color="danger">
                    {formErrors.name}
                  </Typography>
                )}
              </FormControl>

              {/* Description */}
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="Brief description of this category (optional)"
                  minRows={3}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </FormControl>

              {/* Display Order */}
              <FormControl>
                <FormLabel>Display Order</FormLabel>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  slotProps={{
                    input: {
                      min: 0,
                    },
                  }}
                />
                <Typography level="body-xs" color="neutral">
                  Lower numbers appear first
                </Typography>
              </FormControl>

              {/* Status */}
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Stack direction="row" spacing={1}>
                  <Chip
                    variant={formData.status === "active" ? "solid" : "outlined"}
                    color="success"
                    onClick={() => setFormData({ ...formData, status: "active" })}
                    sx={{ cursor: "pointer" }}
                  >
                    Active
                  </Chip>
                  <Chip
                    variant={formData.status === "inactive" ? "solid" : "outlined"}
                    color="neutral"
                    onClick={() => setFormData({ ...formData, status: "inactive" })}
                    sx={{ cursor: "pointer" }}
                  >
                    Inactive
                  </Chip>
                </Stack>
              </FormControl>

              {/* Error Message */}
              {formErrors.submit && (
                <Typography level="body-sm" color="danger">
                  {formErrors.submit}
                </Typography>
              )}

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
                <Button
                  variant="outlined"
                  color="neutral"
                  onClick={() => setCategoryModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedCategory ? "Update Category" : "Add Category"}
                </Button>
              </Stack>
            </Stack>
          </form>
        </ModalDialog>
      </Modal>

      {/* Toast Notifications */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        color="success"
        variant="soft"
        startDecorator={<FiCheckCircle />}
      >
        {success}
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        color="danger"
        variant="soft"
        startDecorator={<FiAlertCircle />}
      >
        {error}
      </Snackbar>
    </PageContainer>
  );
}
