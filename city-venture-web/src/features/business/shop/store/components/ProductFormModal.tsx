import React, { useState, useEffect } from "react";
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
  Box,
  ChipDelete,
} from "@mui/joy";
import { FiPlus } from "react-icons/fi";
import type { Product, CreateProductPayload } from "@/src/types/Product";
import type { ShopCategoryAssignment, CreateShopCategoryPayload } from "@/src/types/ShopCategory";

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateProductPayload) => Promise<void>;
  onCreateCategory: (payload: CreateShopCategoryPayload) => Promise<ShopCategoryAssignment>;
  product?: Product | null;
  categories: ShopCategoryAssignment[];
  businessId: string;
}

export default function ProductFormModal({
  open,
  onClose,
  onSubmit,
  onCreateCategory,
  product,
  categories,
  businessId,
}: ProductFormModalProps): React.ReactElement {
  const [formData, setFormData] = useState<CreateProductPayload>({
    business_id: businessId,
    category_ids: [],
    name: "",
    description: "",
    price: 0,
    image_url: "",
    status: "active",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Category creation state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);

  useEffect(() => {
    if (product) {
      // Extract category IDs from product's categories array
      const categoryIds = product.categories?.map(cat => cat.id) || 
                         (product.product_category_id ? [product.product_category_id] : []);
      
      setFormData({
        business_id: product.business_id,
        category_ids: categoryIds,
        name: product.name,
        description: product.description || "",
        price: product.price,
        image_url: product.image_url || "",
        status: product.status,
      });
    } else {
      setFormData({
        business_id: businessId,
        category_ids: [],
        name: "",
        description: "",
        price: 0,
        image_url: "",
        status: "active",
      });
    }
    setErrors({});
    setCategoryModalOpen(false);
    setNewCategoryName("");
    setNewCategoryDescription("");
  }, [product, businessId, open]);



  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.category_ids || formData.category_ids.length === 0) {
      newErrors.category_ids = "Please select at least one category";
    }

    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setErrors({ categoryName: "Category name is required" });
      return;
    }

    setCategoryLoading(true);
    try {
      const categoryPayload: CreateShopCategoryPayload = {
        business_id: businessId,
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
        display_order: categories.length + 1,
        status: "active",
        category_type: "product",
      };

      const newCategory = await onCreateCategory(categoryPayload);
      
      // Reset category form
      setNewCategoryName("");
      setNewCategoryDescription("");
      setCategoryModalOpen(false);
      setErrors({});
      
      // Add new category to selection
      if (newCategory?.id) {
        setFormData((prev) => ({
          ...prev,
          category_ids: [...prev.category_ids, newCategory.id],
        }));
      }
    } catch (error) {
      console.error("Error creating category:", error);
      setErrors({ categorySubmit: "Failed to create category. Please try again." });
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
      setErrors({ submit: "Failed to save product. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
      <ModalDialog size="lg" sx={{ maxWidth: 600, width: "90%" }}>
        <ModalClose />
        <Typography level="h4" fontWeight={700} mb={2}>
          {product ? "Edit Product" : "Add New Product"}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {/* Product Name and Price - 2 Column Layout */}
            <Stack direction="row" spacing={2}>
              {/* Product Name */}
              <FormControl error={!!errors.name} sx={{ flex: 1 }}>
                <FormLabel>Product Name *</FormLabel>
                <Input
                  placeholder="e.g., Bicol Express (1kg)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={loading}
                />
                {errors.name && (
                  <Typography level="body-sm" color="danger">
                    {errors.name}
                  </Typography>
                )}
              </FormControl>

              {/* Price */}
              <FormControl error={!!errors.price} sx={{ width: 180 }}>
                <FormLabel>Price (₱) *</FormLabel>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                  }
                  slotProps={{
                    input: {
                      min: 0,
                      step: 0.01,
                    },
                  }}
                  disabled={loading}
                />
                {errors.price && (
                  <Typography level="body-sm" color="danger">
                    {errors.price}
                  </Typography>
                )}
              </FormControl>
            </Stack>

            {/* Category - Multi-select with chips */}
            <FormControl error={!!errors.category_ids}>
              <FormLabel>Categories *</FormLabel>
              
              {/* Display selected categories as chips */}
              {formData.category_ids.length > 0 && (
                <Box 
                  sx={{ 
                    display: "flex", 
                    flexWrap: "wrap", 
                    gap: 1, 
                    mb: 1
                  }}
                >
                  {formData.category_ids.map((catId, index) => {
                    const category = categories.find((c) => c.id === catId);
                    if (!category) return null;
                    
                    const isPrimary = index === 0;
                    
                    return (
                      <Chip
                        key={catId}
                        size="md"
                        variant={isPrimary ? "solid" : "outlined"}
                        color={isPrimary ? "primary" : "neutral"}
                        endDecorator={
                          <ChipDelete
                            onDelete={() => {
                              setFormData({
                                ...formData,
                                category_ids: formData.category_ids.filter((id) => id !== catId),
                              });
                            }}
                          />
                        }
                      >
                        {category.name}
                      </Chip>
                    );
                  })}
                </Box>
              )}
              
              {/* Select to add categories */}
              <Select
                value={null}
                onChange={(_, value) => {
                  if (value === "__create_new__") {
                    setCategoryModalOpen(true);
                  } else if (value && !formData.category_ids.includes(value as string)) {
                    setFormData({
                      ...formData,
                      category_ids: [...formData.category_ids, value as string],
                    });
                  }
                }}
                disabled={loading || categoryLoading}
                placeholder={formData.category_ids.length > 0 ? "Add another category..." : "Select a category"}
              >
                {/* Create New Category Option */}
                <Option
                  key="create_new"
                  value="__create_new__"
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FiPlus />
                    <span>Create New Category</span>
                  </Stack>
                </Option>
                
                {/* Only show unselected categories */}
                {categories
                  .filter((cat) => !formData.category_ids.includes(cat.id))
                  .map((cat) => (
                    <Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Option>
                  ))}
              </Select>
              
              {errors.category_ids && (
                <Typography level="body-sm" color="danger" sx={{ mt: 0.5 }}>
                  {errors.category_ids}
                </Typography>
              )}
              
              <Typography level="body-xs" color="neutral" sx={{ mt: 0.5 }}>
                First category selected is the primary category
              </Typography>
            </FormControl>

            {/* Description */}
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="Describe your product..."
                minRows={3}
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={loading}
              />
            </FormControl>

            {/* Image URL */}
            <FormControl>
              <FormLabel>Image URL</FormLabel>
              <Input
                placeholder="https://example.com/image.jpg"
                value={formData.image_url || ""}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                disabled={loading}
              />
              <Typography level="body-sm" color="neutral">
                Optional: Paste a URL to an image of your product
              </Typography>
            </FormControl>

            {/* Status */}
            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select
                value={formData.status}
                onChange={(_, value) =>
                  setFormData({
                    ...formData,
                    status: (value as "active" | "inactive" | "out_of_stock") || "active",
                  })
                }
                disabled={loading}
              >
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
                <Option value="out_of_stock">Out of Stock</Option>
              </Select>
            </FormControl>

            {/* Error Message */}
            {errors.submit && (
              <Typography level="body-sm" color="danger">
                {errors.submit}
              </Typography>
            )}

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
              <Button variant="outlined" color="neutral" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                {product ? "Update Product" : "Add Product"}
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
          <FormControl error={!!errors.categoryName}>
            <FormLabel>Category Name *</FormLabel>
            <Input
              placeholder="e.g., Main Dishes, Desserts, Snacks"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              disabled={categoryLoading}
              autoFocus
            />
            {errors.categoryName && (
              <Typography level="body-sm" color="danger">
                {errors.categoryName}
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
              disabled={categoryLoading}
            />
          </FormControl>

          {errors.categorySubmit && (
            <Typography level="body-sm" color="danger">
              {errors.categorySubmit}
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
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.categoryName;
                  delete newErrors.categorySubmit;
                  return newErrors;
                });
              }}
              disabled={categoryLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCategory}
              loading={categoryLoading}
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
