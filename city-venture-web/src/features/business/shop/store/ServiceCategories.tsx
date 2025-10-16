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
  Modal,
  ModalDialog,
  ModalClose,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Option,
  Snackbar,
  Alert,
} from "@mui/joy";
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiCheckCircle, FiAlertCircle, FiInfo } from "react-icons/fi";
import PageContainer from "@/src/components/PageContainer";
import { useBusiness } from "@/src/context/BusinessContext";
import * as ShopCategoryService from "@/src/services/ShopCategoryService";
import { useNavigate } from "react-router-dom";
import type { ShopCategory, CreateShopCategoryPayload } from "@/src/types/ShopCategory";

export default function ServiceCategories() {
  const navigate = useNavigate();
  const { businessDetails } = useBusiness();
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    display_order: "",
    status: "active" as "active" | "inactive",
    category_type: "service" as "product" | "service" | "both",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!businessDetails?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await ShopCategoryService.fetchShopCategoriesByBusinessIdAndType(businessDetails.id, 'service');
      setCategories(Array.isArray(data) ? data : []);
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

  const handleOpenModal = (category?: ShopCategory) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name || "",
        description: category.description || "",
        display_order: category.display_order?.toString() || "",
        status: category.status as "active" | "inactive" || "active",
        category_type: category.category_type || "service",
      });
    } else {
      setSelectedCategory(null);
      setFormData({
        name: "",
        description: "",
        display_order: "",
        status: "active",
        category_type: "service",
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCategory(null);
    setFormData({
      name: "",
      description: "",
      display_order: "",
      status: "active",
      category_type: "service",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    if (!businessDetails?.id) {
      setError("Business not selected");
      return;
    }

    setFormLoading(true);
    setError(null);

    try {
      const payload: CreateShopCategoryPayload = {
        business_id: businessDetails.id,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        display_order: formData.display_order ? parseInt(formData.display_order) : undefined,
        status: formData.status,
        category_type: formData.category_type,
      };

      if (selectedCategory) {
        await ShopCategoryService.updateShopCategory(selectedCategory.id, payload);
        setSuccess("Category updated successfully!");
      } else {
        await ShopCategoryService.createShopCategory(payload);
        setSuccess("Category created successfully!");
      }

      await fetchCategories();
      handleCloseModal();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving category:", err);
      setError("Failed to save category");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return;
    }

    try {
      await ShopCategoryService.deleteShopCategory(categoryId);
      setSuccess("Category deleted successfully!");
      await fetchCategories();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting category:", err);
      setError("Failed to delete category. It may be in use by services.");
      setTimeout(() => setError(null), 5000);
    }
  };

  const formatStatus = (status: string | undefined): string => {
    if (!status) return "UNKNOWN";
    return status.toUpperCase();
  };

  const getStatusColor = (status: string | undefined): "success" | "neutral" => {
    if (!status) return "neutral";
    return status === "active" ? "success" : "neutral";
  };

  if (!businessDetails) {
    return (
      <PageContainer>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography level="body-lg" color="neutral">
            Please select a business to manage service categories.
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
            <Button
              variant="plain"
              color="neutral"
              startDecorator={<FiArrowLeft />}
              onClick={() => navigate("/business/store/services")}
              sx={{ mb: 1, px: 0 }}
            >
              Back to Services
            </Button>
            <Typography level="h2" fontWeight={700}>
              Service Categories
            </Typography>
            <Typography level="body-sm" color="neutral">
              Organize your services into categories
            </Typography>
          </Box>
          
          <Button
            startDecorator={<FiPlus />}
            onClick={() => handleOpenModal()}
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
        {!loading && Array.isArray(categories) && categories.length > 0 && (
          <Sheet variant="outlined" sx={{ borderRadius: "sm", overflow: "hidden" }}>
            <Table>
              <thead>
                <tr>
                  <th style={{ width: "5%" }}>Order</th>
                  <th style={{ width: "20%" }}>Name</th>
                  <th style={{ width: "40%" }}>Description</th>
                  <th style={{ width: "10%" }}>Type</th>
                  <th style={{ width: "10%" }}>Status</th>
                  <th style={{ width: "15%", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <Typography level="body-sm">
                        {category.display_order || '—'}
                      </Typography>
                    </td>
                    <td>
                      <Typography level="body-sm" fontWeight={600}>
                        {category.name}
                      </Typography>
                    </td>
                    <td>
                      <Typography level="body-sm" color="neutral">
                        {category.description || '—'}
                      </Typography>
                    </td>
                    <td>
                      <Chip
                        size="sm"
                        color={category.category_type === "product" ? "primary" : category.category_type === "service" ? "success" : "warning"}
                        variant="soft"
                      >
                        {category.category_type.charAt(0).toUpperCase() + category.category_type.slice(1)}
                      </Chip>
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
                          onClick={() => handleOpenModal(category)}
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
        {!loading && Array.isArray(categories) && categories.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              px: 2,
            }}
          >
            <Typography level="h4" mb={1}>
              No categories yet
            </Typography>
            <Typography level="body-sm" color="neutral" mb={3}>
              Create your first service category to get started
            </Typography>
            <Button
              startDecorator={<FiPlus />}
              onClick={() => handleOpenModal()}
            >
              Add Category
            </Button>
          </Box>
        )}
      </Stack>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <ModalDialog sx={{ maxWidth: 500, width: "100%" }}>
          <ModalClose />
          <Typography level="h4" fontWeight={700} mb={2}>
            {selectedCategory ? "Edit Category" : "Add New Category"}
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {error && (
                <Alert color="danger" variant="soft" startDecorator={<FiInfo />}>
                  {error}
                </Alert>
              )}

              <FormControl required>
                <FormLabel>Category Name</FormLabel>
                <Input
                  placeholder="e.g., Spa Services, Tours"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Category Type</FormLabel>
                <Select
                  value={formData.category_type}
                  onChange={(_, value) => setFormData({ ...formData, category_type: value as "product" | "service" | "both" })}
                >
                  <Option value="product">Product</Option>
                  <Option value="service">Service</Option>
                  <Option value="both">Both</Option>
                </Select>
                <Typography level="body-xs" color="neutral">
                  Select which type of items this category will contain
                </Typography>
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  minRows={2}
                  placeholder="Describe this category..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </FormControl>

              <Stack direction="row" spacing={2}>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Display Order</FormLabel>
                  <Input
                    type="number"
                    placeholder="e.g., 1"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_order: e.target.value,
                      })
                    }
                    slotProps={{
                      input: {
                        min: "0",
                      },
                    }}
                  />
                </FormControl>

                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={formData.status}
                    onChange={(_, value) =>
                      setFormData({
                        ...formData,
                        status: value as "active" | "inactive",
                      })
                    }
                  >
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                  </Select>
                </FormControl>
              </Stack>

              <Stack
                direction="row"
                spacing={2}
                justifyContent="flex-end"
                pt={2}
              >
                <Button
                  variant="outlined"
                  color="neutral"
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={formLoading}>
                  {selectedCategory ? "Update" : "Create"}
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
