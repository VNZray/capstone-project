import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Typography,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Stack,
  Select,
  Option,
  Radio,
  RadioGroup,
  Box,
  Divider,
  Alert,
  Card,
  Grid,
  Breadcrumbs,
  Link,
  Table,
  IconButton,
  Sheet,
} from "@mui/joy";
import { FiAlertCircle, FiX, FiTag } from "react-icons/fi";
import PageContainer from "@/src/components/PageContainer";
import { useBusiness } from "@/src/context/BusinessContext";
import * as DiscountService from "@/src/services/DiscountService";
import * as ProductService from "@/src/services/ProductService";
import type { CreateDiscountPayload } from "@/src/types/Discount";
import type { Product } from "@/src/types/Product";

export default function DiscountForm(): React.ReactElement {
  const navigate = useNavigate();
  const { id: discountId } = useParams<{ id?: string }>();
  const { businessDetails } = useBusiness();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const [formData, setFormData] = useState<CreateDiscountPayload>({
    business_id: businessDetails?.id || "",
    name: "",
    description: "",
    discount_type: "percentage",
    discount_value: 0,
    minimum_order_amount: 0,
    maximum_discount_amount: undefined,
    start_datetime: new Date().toISOString().slice(0, 16),
    end_datetime: "",
    usage_limit: undefined,
    usage_limit_per_customer: undefined,
    status: "active",
    applicable_products: [],
  });

  // Fetch discount data if editing
  useEffect(() => {
    const fetchData = async () => {
      if (!businessDetails?.id) {
        setInitialLoading(false);
        return;
      }

      try {
        const productsData = await ProductService.fetchProductsByBusinessId(businessDetails.id);
        setProducts(Array.isArray(productsData) ? productsData : []);

        if (discountId) {
          const discountData = await DiscountService.fetchDiscountById(discountId);
          
          // Helper to extract product ID from applicable product (handles both formats)
          const getProductId = (ap: { product_id?: string; id?: string }): string => {
            return ap.product_id || ap.id || '';
          };

          setFormData({
            business_id: discountData.business_id,
            name: discountData.name,
            description: discountData.description || "",
            discount_type: discountData.discount_type,
            discount_value: discountData.discount_value,
            minimum_order_amount: discountData.minimum_order_amount,
            maximum_discount_amount: discountData.maximum_discount_amount || undefined,
            start_datetime: new Date(discountData.start_datetime).toISOString().slice(0, 16),
            end_datetime: discountData.end_datetime 
              ? new Date(discountData.end_datetime).toISOString().slice(0, 16) 
              : "",
            usage_limit: discountData.usage_limit || undefined,
            usage_limit_per_customer: discountData.usage_limit_per_customer || undefined,
            status: discountData.status,
            // API returns product objects with 'id' field, not 'product_id'
            applicable_products: discountData.applicable_products?.map(getProductId) || [],
          });

          // Set selected products
          // API returns full product objects directly in applicable_products
          if (discountData.applicable_products && discountData.applicable_products.length > 0) {
            const selected = productsData.filter((p: Product) => 
              discountData.applicable_products!.some(ap => getProductId(ap) === p.id)
            );
            setSelectedProducts(selected);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrors({ fetch: "Failed to load data. Please try again." });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [businessDetails?.id, discountId]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Discount name is required";
    }

    if (formData.discount_value <= 0) {
      newErrors.discount_value = "Discount value must be greater than 0";
    }

    if (formData.discount_type === "percentage" && formData.discount_value > 100) {
      newErrors.discount_value = "Percentage discount cannot exceed 100%";
    }

    if (!formData.start_datetime) {
      newErrors.start_datetime = "Start date is required";
    }

    if (formData.end_datetime && new Date(formData.end_datetime) <= new Date(formData.start_datetime)) {
      newErrors.end_datetime = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      if (discountId) {
        await DiscountService.updateDiscount(discountId, formData);
      } else {
        await DiscountService.createDiscount(formData);
      }
      navigate("/business/store/discount");
    } catch (error) {
      console.error("Error submitting discount:", error);
      setErrors({ submit: "Failed to save discount. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (productId: string | null) => {
    if (!productId) return;

    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Check if already selected
    if (selectedProducts.some(p => p.id === productId)) {
      return;
    }

    const newSelectedProducts = [...selectedProducts, product];
    setSelectedProducts(newSelectedProducts);
    setFormData(prev => ({
      ...prev,
      applicable_products: newSelectedProducts.map(p => p.id),
    }));
  };

  const handleRemoveProduct = (productId: string) => {
    const newSelectedProducts = selectedProducts.filter(p => p.id !== productId);
    setSelectedProducts(newSelectedProducts);
    setFormData(prev => ({
      ...prev,
      applicable_products: newSelectedProducts.map(p => p.id),
    }));
  };

  const calculateDiscountPreview = (product: Product) => {
    if (formData.discount_type === "percentage") {
      const discountAmount = (product.price * formData.discount_value) / 100;
      const maxDiscount = formData.maximum_discount_amount || Infinity;
      const finalDiscount = Math.min(discountAmount, maxDiscount);
      return {
        originalPrice: product.price,
        discountAmount: finalDiscount,
        finalPrice: product.price - finalDiscount,
      };
    } else {
      return {
        originalPrice: product.price,
        discountAmount: formData.discount_value,
        finalPrice: Math.max(0, product.price - formData.discount_value),
      };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (!businessDetails?.id) {
    return (
      <PageContainer>
        <Alert color="warning" variant="soft" startDecorator={<FiAlertCircle />}>
          Please select a business to manage discounts.
        </Alert>
      </PageContainer>
    );
  }

  if (initialLoading) {
    return (
      <PageContainer>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <Typography>Loading...</Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        {/* Breadcrumbs Navigation */}
        <Breadcrumbs>
          <Link
            color="neutral"
            onClick={() => navigate("/business/store/discount")}
            sx={{ cursor: "pointer" }}
          >
            Discounts
          </Link>
          <Typography>{discountId ? "Edit Discount" : "Create Discount"}</Typography>
        </Breadcrumbs>

        {errors.fetch && (
          <Alert color="danger" variant="soft" startDecorator={<FiAlertCircle />}>
            {errors.fetch}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Discount Form - Compact Layout */}
            <Card variant="outlined">
              <Stack spacing={2.5}>
                <Typography level="title-lg" fontWeight="bold" startDecorator={<FiTag />}>
                  Discount Details
                </Typography>

                {/* Row 1: Name and Description */}
                <Grid container spacing={2}>
                  <Grid xs={12} md={6}>
                    <FormControl error={!!errors.name} size="sm">
                      <FormLabel>Discount Name *</FormLabel>
                      <Input
                        size="sm"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Summer Sale, Buy One Get One"
                      />
                      {errors.name && (
                        <Typography level="body-xs" color="danger">
                          {errors.name}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid xs={12} md={6}>
                    <FormControl size="sm">
                      <FormLabel>Description</FormLabel>
                      <Textarea
                        size="sm"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the discount offer"
                        minRows={2}
                      />
                    </FormControl>
                  </Grid>
                </Grid>

                <Divider />

                {/* Row 2: Discount Configuration */}
                <Grid container spacing={2} alignItems="flex-start">
                  <Grid xs={12} sm={6} md={3}>
                    <FormControl size="sm">
                      <FormLabel>Discount Type *</FormLabel>
                      <RadioGroup
                        value={formData.discount_type}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          discount_type: e.target.value as "percentage" | "fixed_amount" 
                        })}
                        size="sm"
                      >
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Radio value="percentage" label="Percentage" size="sm" />
                          <Radio value="fixed_amount" label="Fixed" size="sm" />
                        </Box>
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                  <Grid xs={12} sm={6} md={3}>
                    <FormControl error={!!errors.discount_value} size="sm">
                      <FormLabel>
                        Value * {formData.discount_type === "percentage" ? "(%)" : "($)"}
                      </FormLabel>
                      <Input
                        size="sm"
                        type="number"
                        value={formData.discount_value}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          discount_value: parseFloat(e.target.value) || 0 
                        })}
                        slotProps={{
                          input: {
                            min: 0,
                            max: formData.discount_type === "percentage" ? 100 : undefined,
                            step: formData.discount_type === "percentage" ? 1 : 0.01,
                          }
                        }}
                      />
                      {errors.discount_value && (
                        <Typography level="body-xs" color="danger">
                          {errors.discount_value}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid xs={12} sm={6} md={3}>
                    <FormControl size="sm">
                      <FormLabel>Min. Order ($)</FormLabel>
                      <Input
                        size="sm"
                        type="number"
                        value={formData.minimum_order_amount}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          minimum_order_amount: parseFloat(e.target.value) || 0 
                        })}
                        placeholder="0"
                        slotProps={{
                          input: {
                            min: 0,
                            step: 0.01,
                          }
                        }}
                      />
                    </FormControl>
                  </Grid>

                  <Grid xs={12} sm={6} md={3}>
                    <FormControl size="sm">
                      <FormLabel>Max. Discount Cap ($)</FormLabel>
                      <Input
                        size="sm"
                        type="number"
                        value={formData.maximum_discount_amount || ""}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          maximum_discount_amount: e.target.value ? parseFloat(e.target.value) : undefined 
                        })}
                        placeholder="No limit"
                        disabled={formData.discount_type === "fixed_amount"}
                        slotProps={{
                          input: {
                            min: 0,
                            step: 0.01,
                          }
                        }}
                      />
                    </FormControl>
                  </Grid>
                </Grid>

                <Divider />

                {/* Row 3: Date and Usage Limits */}
                <Grid container spacing={2}>
                  <Grid xs={12} sm={6} md={3}>
                    <FormControl error={!!errors.start_datetime} size="sm">
                      <FormLabel>Start Date & Time *</FormLabel>
                      <Input
                        size="sm"
                        type="datetime-local"
                        value={formData.start_datetime}
                        onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                      />
                      {errors.start_datetime && (
                        <Typography level="body-xs" color="danger">
                          {errors.start_datetime}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid xs={12} sm={6} md={3}>
                    <FormControl error={!!errors.end_datetime} size="sm">
                      <FormLabel>End Date & Time</FormLabel>
                      <Input
                        size="sm"
                        type="datetime-local"
                        value={formData.end_datetime}
                        onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                        placeholder="No end date"
                      />
                      {errors.end_datetime && (
                        <Typography level="body-xs" color="danger">
                          {errors.end_datetime}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid xs={12} sm={6} md={2}>
                    <FormControl size="sm">
                      <FormLabel>Total Uses</FormLabel>
                      <Input
                        size="sm"
                        type="number"
                        value={formData.usage_limit || ""}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          usage_limit: e.target.value ? parseInt(e.target.value) : undefined 
                        })}
                        placeholder="∞"
                        slotProps={{
                          input: {
                            min: 1,
                          }
                        }}
                      />
                    </FormControl>
                  </Grid>

                  <Grid xs={12} sm={6} md={2}>
                    <FormControl size="sm">
                      <FormLabel>Per Customer</FormLabel>
                      <Input
                        size="sm"
                        type="number"
                        value={formData.usage_limit_per_customer || ""}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          usage_limit_per_customer: e.target.value ? parseInt(e.target.value) : undefined 
                        })}
                        placeholder="∞"
                        slotProps={{
                          input: {
                            min: 1,
                          }
                        }}
                      />
                    </FormControl>
                  </Grid>

                  <Grid xs={12} sm={6} md={2}>
                    <FormControl size="sm">
                      <FormLabel>Status</FormLabel>
                      <Select
                        size="sm"
                        value={formData.status}
                        onChange={(_, value) => setFormData({ 
                          ...formData, 
                          status: value as "active" | "inactive" | "expired" | "paused" 
                        })}
                      >
                        <Option value="active">Active</Option>
                        <Option value="inactive">Inactive</Option>
                        <Option value="paused">Paused</Option>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {errors.submit && (
                  <Alert color="danger" variant="soft" size="sm">
                    {errors.submit}
                  </Alert>
                )}

                {/* Action Buttons in Form */}
                <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", pt: 1 }}>
                  <Button
                    variant="outlined"
                    color="neutral"
                    onClick={() => navigate("/business/store/discount")}
                    disabled={loading}
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={loading} size="sm">
                    {discountId ? "Update Discount" : "Create Discount"}
                  </Button>
                </Box>
              </Stack>
            </Card>

            {/* Applicable Products Section */}
            <Card variant="outlined">
              <Stack spacing={2}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography level="title-lg" fontWeight="bold">
                      Applicable Products
                    </Typography>
                    <Typography level="body-sm" textColor="text.secondary">
                      {selectedProducts.length === 0 
                        ? "Discount applies to all products" 
                        : `${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''} selected`}
                    </Typography>
                  </Box>
                  <FormControl sx={{ minWidth: 300 }} size="sm">
                    <Select
                      size="sm"
                      placeholder="Add products..."
                      onChange={(_, value) => handleProductSelect(value as string | null)}
                      value={null}
                    >
                      {products
                        .filter(p => !selectedProducts.some(sp => sp.id === p.id))
                        .map((product) => (
                          <Option key={product.id} value={product.id}>
                            {product.name} - ${product.price}
                          </Option>
                        ))}
                    </Select>
                  </FormControl>
                </Box>

                {selectedProducts.length > 0 ? (
                  <Sheet variant="outlined" sx={{ borderRadius: "sm", overflow: "hidden" }}>
                    <Table size="sm" stripe="odd">
                      <thead>
                        <tr>
                          <th style={{ width: "50%" }}>Product Name</th>
                          <th style={{ width: "20%", textAlign: "right" }}>Original Price</th>
                          <th style={{ width: "25%", textAlign: "right" }}>Discounted Price</th>
                          <th style={{ width: "5%", textAlign: "center" }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProducts.map((product) => {
                          const preview = calculateDiscountPreview(product);
                          return (
                            <tr key={product.id}>
                              <td>
                                <Stack spacing={0.25}>
                                  <Typography level="body-sm" fontWeight="md">
                                    {product.name}
                                  </Typography>
                                  {product.category_name && (
                                    <Typography level="body-xs" textColor="text.tertiary">
                                      {product.category_name}
                                    </Typography>
                                  )}
                                </Stack>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <Typography level="body-sm" sx={{ textDecoration: "line-through" }}>
                                  {formatCurrency(preview.originalPrice)}
                                </Typography>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <Typography level="body-sm" fontWeight="bold" color="primary">
                                  {formatCurrency(preview.finalPrice)}
                                </Typography>
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <IconButton
                                  size="sm"
                                  variant="plain"
                                  color="danger"
                                  onClick={() => handleRemoveProduct(product.id)}
                                >
                                  <FiX />
                                </IconButton>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </Sheet>
                ) : (
                  <Alert color="neutral" variant="soft" size="sm" startDecorator={<FiAlertCircle />}>
                    No specific products selected. This discount will apply to all products that meet the minimum order requirements.
                  </Alert>
                )}
              </Stack>
            </Card>
          </Stack>
        </form>
      </Stack>
    </PageContainer>
  );
}
