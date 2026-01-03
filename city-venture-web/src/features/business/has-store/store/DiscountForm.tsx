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
  Option,
  Box,
  Alert,
  Card,
  Grid,
  Breadcrumbs,
  Link,
  Table,
  IconButton,
  Sheet,
  Select,
  Chip,
  Checkbox,
} from "@mui/joy";
import { FiAlertCircle, FiX, FiTag, FiSettings, FiChevronDown } from "react-icons/fi";
import PageContainer from "@/src/components/PageContainer";
import { useBusiness } from "@/src/context/BusinessContext";
import * as DiscountService from "@/src/services/DiscountService";
import * as ProductService from "@/src/services/ProductService";
import type { CreateDiscountPayload } from "@/src/types/Discount";
import type { Product } from "@/src/types/Product";

interface ProductWithDiscount extends Product {
  original_price: number;
  discounted_price: number;
  stock_limit: number | null;
  purchase_limit: number | null;
  has_no_stock_limit: boolean;
  has_no_purchase_limit: boolean;
}

// Helper function to get current datetime in local format for datetime-local input
const getCurrentDateTimeLocal = (): string => {
  const now = new Date();
  // Get the local ISO string and slice to get datetime-local format
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${date}T${hours}:${minutes}`;
};

// Helper function to get datetime 1 hour from now in local format for datetime-local input
const getDateTimeOneHourFromNow = (): string => {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${date}T${hours}:${minutes}`;
};

// Helper function to convert UTC datetime string to local datetime string for datetime-local input
// Expects UTC datetime string like "2025-10-19T03:20:00Z" or "2025-10-19T03:20:00"
// Returns local datetime string like "2025-10-19T11:20"
const convertUTCToLocalDateTime = (utcDateString: string): string => {
  if (!utcDateString) return "";
  
  const utcDate = new Date(utcDateString);
  const year = utcDate.getFullYear();
  const month = String(utcDate.getMonth() + 1).padStart(2, '0');
  const date = String(utcDate.getDate()).padStart(2, '0');
  const hours = String(utcDate.getHours()).padStart(2, '0');
  const minutes = String(utcDate.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${date}T${hours}:${minutes}`;
};

// Helper function to convert local datetime string to UTC ISO string for API submission
// Expects local datetime string like "2025-10-19T11:20"
// The datetime-local input gives us local time, but new Date() interprets it as UTC
// So we need to adjust by the timezone offset
// Returns UTC ISO string like "2025-10-19T03:20:00Z"
const convertLocalDateTimeToUTC = (localDateString: string): string => {
  if (!localDateString) return "";
  
  // Parse the datetime-local string: "2025-10-19T07:34"
  const [datePart, timePart] = localDateString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  
  // Create a date object from the local time
  const localDate = new Date(year, month - 1, day, hours, minutes, 0);
  
  // Get the timezone offset in milliseconds
  const timezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
  
  // Adjust the date by the timezone offset to get UTC
  const utcDate = new Date(localDate.getTime() - timezoneOffset);
  
  return utcDate.toISOString();
};

export default function DiscountForm(): React.ReactElement {
  const navigate = useNavigate();
  const { id: discountId } = useParams<{ id?: string }>();
  const { businessDetails } = useBusiness();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedProducts, setSelectedProducts] = useState<ProductWithDiscount[]>([]);

  // Batch update controls
  const [showBatchUpdate, setShowBatchUpdate] = useState(false);
  const [batchSelectedProducts, setBatchSelectedProducts] = useState<Set<string>>(new Set());
  const [batchStockLimit, setBatchStockLimit] = useState<number | null>(null);
  const [batchPurchaseLimit, setBatchPurchaseLimit] = useState<number | null>(null);
  const [batchStockLimitType, setBatchStockLimitType] = useState<'no_update' | 'no_limit' | 'set_limit'>('no_update');
  const [batchPurchaseLimitType, setBatchPurchaseLimitType] = useState<'no_update' | 'no_limit' | 'set_limit'>('no_update');
  const [batchDiscountPercentage, setBatchDiscountPercentage] = useState<number>(0);

  const [formData, setFormData] = useState<CreateDiscountPayload>({
    business_id: businessDetails?.id || "",
    name: "",
    description: "",
    start_datetime: getCurrentDateTimeLocal(),
    end_datetime: getDateTimeOneHourFromNow(),
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
          
          setFormData({
            business_id: discountData.business_id,
            name: discountData.name,
            description: discountData.description || "",
            start_datetime: convertUTCToLocalDateTime(discountData.start_datetime),
            end_datetime: discountData.end_datetime 
              ? convertUTCToLocalDateTime(discountData.end_datetime)
              : "",
            status: discountData.status,
            applicable_products: discountData.applicable_products?.map(ap => ({
              product_id: ap.product_id || ap.id,
              discounted_price: ap.discounted_price,
              stock_limit: ap.stock_limit,
              purchase_limit: ap.purchase_limit,
            })) || [],
          });

          // Set selected products with discount details
          if (discountData.applicable_products && discountData.applicable_products.length > 0) {
            const selected = productsData
              .filter((p: Product) => 
                discountData.applicable_products!.some(ap => (ap.product_id || ap.id) === p.id)
              )
              .map((p: Product) => {
                const applicableProduct = discountData.applicable_products!.find(
                  ap => (ap.product_id || ap.id) === p.id
                );
                return {
                  ...p,
                  original_price: p.price,
                  // Use individual discounted price from applicable_products
                  discounted_price: applicableProduct?.discounted_price ?? 0,
                  stock_limit: applicableProduct?.stock_limit ?? null,
                  purchase_limit: applicableProduct?.purchase_limit ?? null,
                  has_no_stock_limit: applicableProduct?.stock_limit === null,
                  has_no_purchase_limit: applicableProduct?.purchase_limit === null,
                };
              });
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

    // Validate that at least one product is selected
    if (selectedProducts.length === 0) {
      newErrors.products = "Please select at least one product for this discount";
    }

    if (!formData.start_datetime) {
      newErrors.start_datetime = "Start date is required";
    }

    if (formData.end_datetime && new Date(formData.end_datetime) <= new Date(formData.start_datetime)) {
      newErrors.end_datetime = "End date must be after start date";
    }

    // Validate that discounted price is less than original price for selected products
    for (const product of selectedProducts) {
      if (product.discounted_price >= product.original_price) {
        newErrors.discount_value = `Discounted price must be less than original price (${formatCurrency(product.original_price)})`;
        break;
      }
    }

    // Validate that promotion stock limit does not exceed stock quantity
    for (const product of selectedProducts) {
      if (!product.has_no_stock_limit && product.stock_limit && product.stock_limit > (product.current_stock || 0)) {
        newErrors.stock_limit = `Promotion stock limit (${product.stock_limit}) for "${product.name}" cannot exceed available stock (${product.current_stock})`;
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const payload = {
      ...formData,
      // Convert local datetime to UTC before sending to API
      start_datetime: convertLocalDateTimeToUTC(formData.start_datetime),
      end_datetime: formData.end_datetime ? convertLocalDateTimeToUTC(formData.end_datetime) : "",
      applicable_products: selectedProducts.map(p => ({
        product_id: p.id,
        discounted_price: p.discounted_price, // Include individual discounted price
        stock_limit: p.stock_limit,
        purchase_limit: p.purchase_limit,
      })),
    };

    setLoading(true);
    try {
      if (discountId) {
        await DiscountService.updateDiscount(discountId, payload);
      } else {
        await DiscountService.createDiscount(payload);
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

    const productWithDiscount: ProductWithDiscount = {
      ...product,
      original_price: product.price,
      discounted_price: product.price, // Start with original price, user will adjust
      stock_limit: null,
      purchase_limit: null,
      has_no_stock_limit: true,
      has_no_purchase_limit: true,
    };

    const newSelectedProducts = [...selectedProducts, productWithDiscount];
    setSelectedProducts(newSelectedProducts);
    setFormData(prev => ({
      ...prev,
      applicable_products: newSelectedProducts.map(p => ({
        product_id: p.id,
        discounted_price: p.discounted_price,
        stock_limit: p.stock_limit,
        purchase_limit: p.purchase_limit,
      })),
    }));
  };

  const handleRemoveProduct = (productId: string) => {
    const newSelectedProducts = selectedProducts.filter(p => p.id !== productId);
    setSelectedProducts(newSelectedProducts);
    setFormData(prev => ({
      ...prev,
      applicable_products: newSelectedProducts.map(p => ({
        product_id: p.id,
        discounted_price: p.discounted_price,
        stock_limit: p.stock_limit,
        purchase_limit: p.purchase_limit,
      })),
    }));
  };

  const updateProductDiscount = (productId: string, field: string, value: any) => {
    const newSelectedProducts = selectedProducts.map(p => {
      if (p.id === productId) {
        return { ...p, [field]: value };
      }
      return p;
    });
    setSelectedProducts(newSelectedProducts);
    setFormData(prev => ({
      ...prev,
      applicable_products: newSelectedProducts.map(p => ({
        product_id: p.id,
        discounted_price: p.discounted_price,
        stock_limit: p.stock_limit,
        purchase_limit: p.purchase_limit,
      })),
    }));
    
    // Clear validation errors when user makes changes
    if (field === 'discounted_price' || field === 'stock_limit') {
      setErrors(prev => {
        const newErrors = { ...prev };
        if (field === 'discounted_price') {
          delete newErrors.discount_value;
        }
        if (field === 'stock_limit') {
          delete newErrors.stock_limit;
        }
        return newErrors;
      });
    }
  };

  const applyBatchLimits = () => {
    // Get the products to apply batch settings to
    const productsToUpdate = batchSelectedProducts.size > 0
      ? selectedProducts.filter(p => batchSelectedProducts.has(p.id))
      : selectedProducts;

    if (productsToUpdate.length === 0) {
      return;
    }

    let updatedProducts = [...selectedProducts];

    // Apply changes only to selected products
    updatedProducts = updatedProducts.map(p => {
      if (!productsToUpdate.some(pu => pu.id === p.id)) {
        return p; // Skip products not selected for batch update
      }

      let newProduct = { ...p };

      // Apply discount percentage if set
      if (batchDiscountPercentage > 0 && batchDiscountPercentage <= 100) {
        newProduct.discounted_price = p.original_price * (1 - batchDiscountPercentage / 100);
      }

      // Apply stock limit if specified
      if (batchStockLimitType !== 'no_update') {
        if (batchStockLimitType === 'no_limit') {
          newProduct.stock_limit = null;
          newProduct.has_no_stock_limit = true;
        } else {
          newProduct.stock_limit = batchStockLimit ?? null;
          newProduct.has_no_stock_limit = false;
        }
      }

      // Apply purchase limit if specified
      if (batchPurchaseLimitType !== 'no_update') {
        if (batchPurchaseLimitType === 'no_limit') {
          newProduct.purchase_limit = null;
          newProduct.has_no_purchase_limit = true;
        } else {
          newProduct.purchase_limit = batchPurchaseLimit ?? null;
          newProduct.has_no_purchase_limit = false;
        }
      }

      return newProduct;
    });

    setSelectedProducts(updatedProducts);
    setFormData(prev => ({
      ...prev,
      applicable_products: updatedProducts.map(p => ({
        product_id: p.id,
        discounted_price: p.discounted_price,
        stock_limit: p.stock_limit,
        purchase_limit: p.purchase_limit,
      })),
    }));

    // Clear batch selection after applying
    setBatchSelectedProducts(new Set());
  };

  const calculateDiscountPercentage = (original: number, discounted: number): number => {
    if (original === 0) return 0;
    return Math.round(((original - discounted) / original) * 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
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
            {/* Discount Form - Modern Layout */}
            <Card variant="outlined" sx={{ bgcolor: "background.surface", borderRadius: "md" }}>
              <Stack spacing={2.5}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 0.5 }}>
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: "md",
                    bgcolor: "primary.softBg",
                    color: "primary.solidBg"
                  }}>
                    <FiTag size={18} />
                  </Box>
                  <Typography level="h4" fontWeight="600">
                    Discount Details
                  </Typography>
                </Box>

                {/* Two Column Layout */}
                <Grid container spacing={3}>
                  {/* Left Column: Name and Description */}
                  <Grid xs={12} md={6}>
                    <Stack spacing={2.5}>
                      <FormControl error={!!errors.name}>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.75 }}>Discount Name *</FormLabel>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., Flash Sale, Weekend Special"
                          sx={{ 
                            '--Input-focusedThickness': '2px',
                            '&:hover': { borderColor: 'primary.outlinedBorder' }
                          }}
                        />
                        {errors.name && (
                          <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
                            {errors.name}
                          </Typography>
                        )}
                      </FormControl>

                      <FormControl>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.75 }}>Description</FormLabel>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Briefly describe this discount offer..."
                          minRows={4}
                          sx={{ 
                            '--Textarea-focusedThickness': '2px',
                            '&:hover': { borderColor: 'primary.outlinedBorder' }
                          }}
                        />
                      </FormControl>
                    </Stack>
                  </Grid>

                  {/* Right Column: Date and Status */}
                  <Grid xs={12} md={6}>
                    <Stack spacing={2.5}>
                      <FormControl error={!!errors.start_datetime}>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.75 }}>Start Date & Time *</FormLabel>
                        <Input
                          type="datetime-local"
                          value={formData.start_datetime}
                          onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                          slotProps={{
                            input: {
                              style: {
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                              }
                            }
                          }}
                          sx={{
                            '--Input-focusedThickness': '2px',
                            '&:hover': { borderColor: 'primary.outlinedBorder' },
                            '& input[type="datetime-local"]::-webkit-outer-spin-button, & input[type="datetime-local"]::-webkit-inner-spin-button': {
                              WebkitAppearance: 'none',
                              margin: 0,
                            },
                            '& input[type="datetime-local"]': {
                              MozAppearance: 'textfield',
                            }
                          }}
                        />
                        {errors.start_datetime && (
                          <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
                            {errors.start_datetime}
                          </Typography>
                        )}
                      </FormControl>

                      <FormControl error={!!errors.end_datetime}>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.75 }}>End Date & Time *</FormLabel>
                        <Input
                          type="datetime-local"
                          value={formData.end_datetime}
                          onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                          slotProps={{
                            input: {
                              style: {
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                              }
                            }
                          }}
                          sx={{
                            '--Input-focusedThickness': '2px',
                            '&:hover': { borderColor: 'primary.outlinedBorder' },
                            '& input[type="datetime-local"]::-webkit-outer-spin-button, & input[type="datetime-local"]::-webkit-inner-spin-button': {
                              WebkitAppearance: 'none',
                              margin: 0,
                            },
                            '& input[type="datetime-local"]': {
                              MozAppearance: 'textfield',
                            }
                          }}
                        />
                        {errors.end_datetime && (
                          <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
                            {errors.end_datetime}
                          </Typography>
                        )}
                      </FormControl>

                      <FormControl>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.75 }}>Status</FormLabel>
                        <Select
                          value={formData.status}
                          onChange={(_, value) => setFormData({ 
                            ...formData, 
                            status: value as "active" | "inactive" | "expired" | "paused" 
                          })}
                          indicator={<FiChevronDown />}
                          sx={{
                            '--Select-focusedThickness': '2px',
                            '&:hover': { borderColor: 'primary.outlinedBorder' }
                          }}
                        >
                          <Option value="active">Active</Option>
                          <Option value="inactive">Inactive</Option>
                          <Option value="paused">Paused</Option>
                        </Select>
                      </FormControl>
                    </Stack>
                  </Grid>
                </Grid>

                {errors.submit && (
                  <Alert color="danger" variant="soft" sx={{ borderRadius: "sm" }}>
                    {errors.submit}
                  </Alert>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end", pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Button
                    variant="outlined"
                    color="neutral"
                    onClick={() => navigate("/business/store/discount")}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={loading}>
                    {discountId ? "Update Discount" : "Create Discount"}
                  </Button>
                </Box>
              </Stack>
            </Card>

            {/* Applicable Products Section */}
            <Card variant="outlined" sx={{ bgcolor: "background.surface", borderRadius: "md" }}>
              <Stack spacing={2.5}>
                {errors.products && (
                  <Alert color="danger" variant="soft" startDecorator={<FiAlertCircle />} sx={{ borderRadius: "sm" }}>
                    {errors.products}
                  </Alert>
                )}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
                  <Box>
                    <Typography level="h4" fontWeight="600" sx={{ mb: 0.5 }}>
                      Applicable Products
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography level="body-sm" textColor="text.secondary">
                        {selectedProducts.length === 0 
                          ? "No products selected yet" 
                          : `${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''} selected`}
                      </Typography>
                      {selectedProducts.length > 0 && (
                        <Chip size="sm" variant="soft" color="primary">
                          {selectedProducts.length}
                        </Chip>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                    <FormControl sx={{ minWidth: 280 }}>
                      <Select
                        placeholder="Add products..."
                        onChange={(_, value) => handleProductSelect(value as string | null)}
                        value={null}
                        indicator={<FiChevronDown />}
                        sx={{
                          '--Select-focusedThickness': '2px',
                          '&:hover': { borderColor: 'primary.outlinedBorder' }
                        }}
                      >
                        {products
                          .filter(p => !selectedProducts.some(sp => sp.id === p.id))
                          .map((product) => (
                            <Option key={product.id} value={product.id}>
                              {product.name} - ₱{product.price}
                            </Option>
                          ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant={showBatchUpdate ? "solid" : "outlined"}
                      color="primary"
                      onClick={() => setShowBatchUpdate(!showBatchUpdate)}
                      startDecorator={<FiSettings />}
                    >
                      Batch Update
                    </Button>
                  </Box>
                </Box>

                {/* Batch Update Section - Modern Compact */}
                {showBatchUpdate && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2.5,
                      p: 2.5,
                      bgcolor: "primary.softBg",
                      borderRadius: "md",
                      border: "1px solid",
                      borderColor: "primary.outlinedBorder",
                      flexWrap: "wrap",
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 140 }}>
                      <Typography level="body-sm" fontWeight="700" textColor="primary.plainColor">
                        Bulk Actions
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Checkbox
                          size="sm"
                          checked={batchSelectedProducts.size === selectedProducts.length && selectedProducts.length > 0}
                          indeterminate={batchSelectedProducts.size > 0 && batchSelectedProducts.size < selectedProducts.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBatchSelectedProducts(new Set(selectedProducts.map(p => p.id)));
                            } else {
                              setBatchSelectedProducts(new Set());
                            }
                          }}
                        />
                        <Chip
                          size="sm"
                          variant="solid"
                          color={batchSelectedProducts.size > 0 ? "primary" : "neutral"}
                        >
                          {batchSelectedProducts.size > 0 
                            ? `${batchSelectedProducts.size} selected` 
                            : "Select all"}
                        </Chip>
                      </Box>
                    </Box>

                    {/* Discount Percentage */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, minWidth: 150 }}>
                      <Typography level="body-xs" fontWeight="600" textColor="text.primary">
                        Discount %
                      </Typography>
                      <Input
                        type="number"
                        value={batchDiscountPercentage || ""}
                        onChange={(e) => setBatchDiscountPercentage(e.target.value ? parseFloat(e.target.value) : 0)}
                        placeholder="0"
                        slotProps={{ 
                          input: { 
                            min: 0, 
                            max: 100,
                            step: 0.01
                          } 
                        }}
                        endDecorator={<Typography level="body-sm" fontWeight="600">% OFF</Typography>}
                        sx={{ 
                          width: "100%",
                          '--Input-focusedThickness': '2px'
                        }}
                      />
                    </Box>

                    {/* Stock Limit */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, minWidth: 180 }}>
                      <Typography level="body-xs" fontWeight="600" textColor="text.primary">
                        Promotion Stock
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.75, width: "100%" }}>
                        <Select
                          value={batchStockLimitType}
                          onChange={(_, value) => setBatchStockLimitType(value as 'no_update' | 'no_limit' | 'set_limit')}
                          sx={{ flex: 1, '--Select-focusedThickness': '2px' }}
                          indicator={<FiChevronDown />}
                        >
                          <Option value="no_update">No Update</Option>
                          <Option value="no_limit">No Limit</Option>
                          <Option value="set_limit">Set Limit</Option>
                        </Select>
                        {batchStockLimitType === 'set_limit' && (
                          <Input
                            type="number"
                            value={batchStockLimit || ""}
                            onChange={(e) => setBatchStockLimit(e.target.value ? parseInt(e.target.value) : null)}
                            placeholder="Qty"
                            slotProps={{ input: { min: 1 } }}
                            sx={{ width: 85 }}
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Purchase Limit */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, minWidth: 180 }}>
                      <Typography level="body-xs" fontWeight="600" textColor="text.primary">
                        Purchase Limit
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.75, width: "100%" }}>
                        <Select
                          value={batchPurchaseLimitType}
                          onChange={(_, value) => setBatchPurchaseLimitType(value as 'no_update' | 'no_limit' | 'set_limit')}
                          sx={{ flex: 1, '--Select-focusedThickness': '2px' }}
                          indicator={<FiChevronDown />}
                        >
                          <Option value="no_update">No Update</Option>
                          <Option value="no_limit">No Limit</Option>
                          <Option value="set_limit">Set Limit</Option>
                        </Select>
                        {batchPurchaseLimitType === 'set_limit' && (
                          <Input
                            type="number"
                            value={batchPurchaseLimit || ""}
                            onChange={(e) => setBatchPurchaseLimit(e.target.value ? parseInt(e.target.value) : null)}
                            placeholder="Qty"
                            slotProps={{ input: { min: 1 } }}
                            sx={{ width: 85 }}
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: "flex", gap: 1.5, ml: "auto", flexWrap: "wrap" }}>
                      <Button
                        onClick={applyBatchLimits}
                        variant="solid"
                        color="primary"
                      >
                        Apply Changes
                      </Button>
                      <Button
                        variant="outlined"
                        color="neutral"
                        onClick={() => setShowBatchUpdate(false)}
                      >
                        Close
                      </Button>
                    </Box>
                  </Box>
                )}

                {selectedProducts.length > 0 ? (
                  <Sheet variant="outlined" sx={{ borderRadius: "md", overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
                    <Table 
                      sx={{ 
                        '& thead th': { 
                          bgcolor: 'background.level1',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          py: 1.5,
                          borderBottom: '2px solid',
                          borderColor: 'divider',
                        },
                        '& tbody tr': {
                          '&:hover': {
                            bgcolor: 'background.level1',
                          }
                        },
                        '& tbody td': {
                          py: 2,
                        }
                      }}
                    >
                      <thead>
                        <tr>
                          {showBatchUpdate && <th style={{ width: "5%" }}>Select</th>}
                          <th style={{ width: "12%" }}>Product</th>
                          <th style={{ width: "8%", textAlign: "right" }}>Stock Qty</th>
                          <th style={{ width: "9%", textAlign: "right" }}>Original</th>
                          <th style={{ width: "13%" }}>Price & Discount</th>
                          <th style={{ width: "14%" }}>Promotion Stock</th>
                          <th style={{ width: "14%" }}>Purchase Limit</th>
                          <th style={{ width: "5%", textAlign: "center" }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProducts.map((product) => {
                          const discountPercentage = calculateDiscountPercentage(product.original_price, product.discounted_price);
                          const isSelected = batchSelectedProducts.has(product.id);
                          return (
                            <tr key={product.id}>
                              {showBatchUpdate && (
                                <td style={{ textAlign: "center" }}>
                                  <Checkbox
                                    size="sm"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      const newSet = new Set(batchSelectedProducts);
                                      if (e.target.checked) {
                                        newSet.add(product.id);
                                      } else {
                                        newSet.delete(product.id);
                                      }
                                      setBatchSelectedProducts(newSet);
                                    }}
                                  />
                                </td>
                              )}
                              <td>
                                <Stack spacing={0.5}>
                                  <Typography level="body-sm" fontWeight="600">
                                    {product.name}
                                  </Typography>
                                  {product.category_name && (
                                    <Chip size="sm" variant="soft" color="neutral">
                                      {product.category_name}
                                    </Chip>
                                  )}
                                </Stack>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <Chip size="sm" variant="soft" color="neutral">
                                  {product.current_stock || 0}
                                </Chip>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <Typography level="body-sm" fontWeight="600" sx={{ textDecoration: "line-through", textColor: "text.tertiary" }}>
                                  {formatCurrency(product.original_price)}
                                </Typography>
                              </td>
                              <td>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                  <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", justifyContent: "center", flexShrink: 0, minWidth: "fit-content" }}>
                                    <Input
                                      size="sm"
                                      type="number"
                                      value={product.discounted_price || ""}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "") {
                                          updateProductDiscount(product.id, 'discounted_price', 0);
                                        } else {
                                          updateProductDiscount(product.id, 'discounted_price', parseFloat(value) || 0);
                                        }
                                      }}
                                      slotProps={{
                                        input: {
                                          min: 0,
                                          max: product.original_price,
                                          step: 0.01,
                                        }
                                      }}
                                      placeholder="Price"
                                      startDecorator="₱"
                                      sx={{ 
                                        width: 75,
                                        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                          WebkitAppearance: 'none',
                                          margin: 0,
                                        },
                                        '& input[type=number]': {
                                          MozAppearance: 'textfield',
                                        }
                                      }}
                                    />
                                    <Typography level="body-xs" textColor="text.tertiary" sx={{ fontWeight: 500, flexShrink: 0 }}>
                                      or
                                    </Typography>
                                    <Input
                                      size="sm"
                                      type="number"
                                      value={Math.round(discountPercentage * 100) / 100 || ""}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        const percentage = value === "" ? 0 : parseFloat(value) || 0;
                                        const calculatedPrice = product.original_price * (1 - percentage / 100);
                                        const roundedPrice = Math.round(calculatedPrice * 100) / 100;
                                        updateProductDiscount(product.id, 'discounted_price', roundedPrice);
                                      }}
                                      slotProps={{
                                        input: {
                                          min: 0,
                                          max: 100,
                                          step: 0.01,
                                        }
                                      }}
                                      placeholder="Off"
                                      endDecorator="%"
                                      sx={{ 
                                        width: 75,
                                        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                          WebkitAppearance: 'none',
                                          margin: 0,
                                        },
                                        '& input[type=number]': {
                                          MozAppearance: 'textfield',
                                        }
                                      }}
                                    />
                                  </Box>
                                  {errors.discount_value && product.discounted_price >= product.original_price && (
                                    <Typography level="body-xs" color="danger" sx={{ fontSize: "11px" }}>
                                      Discounted price must be less than original
                                    </Typography>
                                  )}
                                </Box>
                              </td>
                              <td>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                  <Box sx={{ display: "flex", gap: 0.5 }}>
                                    <Select
                                      size="sm"
                                      value={product.has_no_stock_limit ? 'no_limit' : 'set_limit'}
                                      onChange={(_, value) => {
                                        const isNoLimit = value === 'no_limit';
                                        const newSelectedProducts = selectedProducts.map(p => {
                                          if (p.id === product.id) {
                                            return {
                                              ...p,
                                              has_no_stock_limit: isNoLimit,
                                              stock_limit: isNoLimit ? null : (p.stock_limit || 1),
                                            };
                                          }
                                          return p;
                                        });
                                        setSelectedProducts(newSelectedProducts);
                                        setFormData(prev => ({
                                          ...prev,
                                          applicable_products: newSelectedProducts.map(p => ({
                                            product_id: p.id,
                                            discounted_price: p.discounted_price,
                                            stock_limit: p.stock_limit,
                                            purchase_limit: p.purchase_limit,
                                          })),
                                        }));
                                      }}
                                      sx={{ flex: 1 }}
                                      indicator={<FiChevronDown />}
                                    >
                                      <Option value="no_limit">No Limit</Option>
                                      <Option value="set_limit">Set Limit</Option>
                                    </Select>
                                    {!product.has_no_stock_limit && (
                                      <Input
                                        size="sm"
                                        type="number"
                                        value={product.stock_limit || ""}
                                        onChange={(e) => updateProductDiscount(product.id, 'stock_limit', e.target.value ? parseInt(e.target.value) : null)}
                                        placeholder="Qty"
                                        slotProps={{ input: { min: 1 } }}
                                        sx={{ 
                                          width: 70,
                                          '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                            WebkitAppearance: 'none',
                                            margin: 0,
                                          },
                                          '& input[type=number]': {
                                            MozAppearance: 'textfield',
                                          }
                                        }}
                                      />
                                    )}
                                  </Box>
                                  {!product.has_no_stock_limit && product.stock_limit && product.stock_limit > (product.current_stock || 0) && (
                                    <Typography level="body-xs" color="danger" sx={{ fontSize: "11px" }}>
                                      Must be ≤ {product.current_stock}
                                    </Typography>
                                  )}
                                </Box>
                              </td>
                              <td>
                                <Box sx={{ display: "flex", gap: 0.5 }}>
                                  <Select
                                    size="sm"
                                    value={product.has_no_purchase_limit ? 'no_limit' : 'set_limit'}
                                    onChange={(_, value) => {
                                      const isNoLimit = value === 'no_limit';
                                      const newSelectedProducts = selectedProducts.map(p => {
                                        if (p.id === product.id) {
                                          return {
                                            ...p,
                                            has_no_purchase_limit: isNoLimit,
                                            purchase_limit: isNoLimit ? null : (p.purchase_limit || 1),
                                          };
                                        }
                                        return p;
                                      });
                                      setSelectedProducts(newSelectedProducts);
                                      setFormData(prev => ({
                                        ...prev,
                                        applicable_products: newSelectedProducts.map(p => ({
                                          product_id: p.id,
                                          discounted_price: p.discounted_price,
                                          stock_limit: p.stock_limit,
                                          purchase_limit: p.purchase_limit,
                                        })),
                                      }));
                                    }}
                                    sx={{ flex: 1 }}
                                    indicator={<FiChevronDown />}
                                  >
                                    <Option value="no_limit">No Limit</Option>
                                    <Option value="set_limit">Set Limit</Option>
                                  </Select>
                                  {!product.has_no_purchase_limit && (
                                    <Input
                                      size="sm"
                                      type="number"
                                      value={product.purchase_limit || ""}
                                      onChange={(e) => updateProductDiscount(product.id, 'purchase_limit', e.target.value ? parseInt(e.target.value) : null)}
                                      placeholder="Qty"
                                      slotProps={{ input: { min: 1 } }}
                                      sx={{ width: 70 }}
                                    />
                                  )}
                                </Box>
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
                    No products selected. Add products above to set discounted prices and limits.
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
