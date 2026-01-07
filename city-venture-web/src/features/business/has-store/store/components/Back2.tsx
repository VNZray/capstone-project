// import React, { useState, useEffect } from "react";
// import {
//   Modal,
//   ModalDialog,
//   ModalClose,
//   Typography,
//   FormControl,
//   FormLabel,
//   Input,
//   Textarea,
//   Button,
//   Stack,
//   Select,
//   Option,
//   Radio,
//   RadioGroup,
//   Box,
//   Chip,
//   ChipDelete,
//   Divider,
//   Alert,
// } from "@mui/joy";
// import { FiAlertCircle } from "react-icons/fi";
// import type { Discount, CreateDiscountPayload } from "@/src/types/Discount";
// import type { Product } from "@/src/types/Product";

// interface DiscountFormModalProps {
//   open: boolean;
//   onClose: () => void;
//   onSubmit: (payload: CreateDiscountPayload) => Promise<void>;
//   discount?: Discount | null;
//   products: Product[];
//   businessId: string;
// }

// export default function DiscountFormModal({
//   open,
//   onClose,
//   onSubmit,
//   discount,
//   products,
//   businessId,
// }: DiscountFormModalProps): React.ReactElement {
//   const [formData, setFormData] = useState<CreateDiscountPayload>({
//     business_id: businessId,
//     name: "",
//     description: "",
//     discount_type: "percentage",
//     discount_value: 0,
//     minimum_order_amount: 0,
//     maximum_discount_amount: undefined,
//     start_datetime: new Date().toISOString().slice(0, 16),
//     end_datetime: "",
//     usage_limit: undefined,
//     usage_limit_per_customer: undefined,
//     status: "active",
//     applicable_products: [],
//   });

//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

//   useEffect(() => {
//     if (discount) {
//       setFormData({
//         business_id: discount.business_id,
//         name: discount.name,
//         description: discount.description || "",
//         discount_type: discount.discount_type,
//         discount_value: discount.discount_value,
//         minimum_order_amount: discount.minimum_order_amount,
//         maximum_discount_amount: discount.maximum_discount_amount || undefined,
//         start_datetime: new Date(discount.start_datetime).toISOString().slice(0, 16),
//         end_datetime: discount.end_datetime 
//           ? new Date(discount.end_datetime).toISOString().slice(0, 16) 
//           : "",
//         usage_limit: discount.usage_limit || undefined,
//         usage_limit_per_customer: discount.usage_limit_per_customer || undefined,
//         status: discount.status,
//         applicable_products: discount.applicable_products?.map(p => p.product_id) || [],
//       });

//       // Set selected products
//       if (discount.applicable_products && discount.applicable_products.length > 0) {
//         const selected = products.filter(p => 
//           discount.applicable_products!.some(ap => ap.product_id === p.id)
//         );
//         setSelectedProducts(selected);
//       }
//     } else {
//       setFormData({
//         business_id: businessId,
//         name: "",
//         description: "",
//         discount_type: "percentage",
//         discount_value: 0,
//         minimum_order_amount: 0,
//         maximum_discount_amount: undefined,
//         start_datetime: new Date().toISOString().slice(0, 16),
//         end_datetime: "",
//         usage_limit: undefined,
//         usage_limit_per_customer: undefined,
//         status: "active",
//         applicable_products: [],
//       });
//       setSelectedProducts([]);
//     }
//     setErrors({});
//   }, [discount, businessId, products, open]);

//   const validate = (): boolean => {
//     const newErrors: Record<string, string> = {};

//     if (!formData.name.trim()) {
//       newErrors.name = "Discount name is required";
//     }

//     if (formData.discount_value <= 0) {
//       newErrors.discount_value = "Discount value must be greater than 0";
//     }

//     if (formData.discount_type === "percentage" && formData.discount_value > 100) {
//       newErrors.discount_value = "Percentage discount cannot exceed 100%";
//     }

//     if (!formData.start_datetime) {
//       newErrors.start_datetime = "Start date is required";
//     }

//     if (formData.end_datetime && new Date(formData.end_datetime) <= new Date(formData.start_datetime)) {
//       newErrors.end_datetime = "End date must be after start date";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validate()) {
//       return;
//     }

//     setLoading(true);
//     try {
//       await onSubmit(formData);
//       onClose();
//     } catch (error) {
//       console.error("Error submitting discount:", error);
//       setErrors({ submit: "Failed to save discount. Please try again." });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleProductSelect = (productId: string | null) => {
//     if (!productId) return;

//     const product = products.find(p => p.id === productId);
//     if (!product) return;

//     // Check if already selected
//     if (selectedProducts.some(p => p.id === productId)) {
//       return;
//     }

//     const newSelectedProducts = [...selectedProducts, product];
//     setSelectedProducts(newSelectedProducts);
//     setFormData(prev => ({
//       ...prev,
//       applicable_products: newSelectedProducts.map(p => p.id),
//     }));
//   };

//   const handleRemoveProduct = (productId: string) => {
//     const newSelectedProducts = selectedProducts.filter(p => p.id !== productId);
//     setSelectedProducts(newSelectedProducts);
//     setFormData(prev => ({
//       ...prev,
//       applicable_products: newSelectedProducts.map(p => p.id),
//     }));
//   };

//   return (
//     <Modal open={open} onClose={onClose}>
//       <ModalDialog size="lg" sx={{ maxWidth: 700, maxHeight: "90vh", overflow: "auto" }}>
//         <ModalClose />
//         <Typography level="h4" fontWeight="bold">
//           {discount ? "Edit Discount" : "Create New Discount"}
//         </Typography>

//         <form onSubmit={handleSubmit}>
//           <Stack spacing={2.5} sx={{ mt: 2 }}>
//             {/* Basic Information */}
//             <Typography level="title-md" fontWeight="bold">
//               Basic Information
//             </Typography>

//             <FormControl error={!!errors.name}>
//               <FormLabel>Discount Name *</FormLabel>
//               <Input
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 placeholder="e.g., Summer Sale, Buy One Get One"
//               />
//               {errors.name && (
//                 <Typography level="body-xs" color="danger">
//                   {errors.name}
//                 </Typography>
//               )}
//             </FormControl>

//             <FormControl>
//               <FormLabel>Description</FormLabel>
//               <Textarea
//                 value={formData.description}
//                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                 placeholder="Describe the discount offer"
//                 minRows={2}
//               />
//             </FormControl>

//             <Divider />

//             {/* Discount Configuration */}
//             <Typography level="title-md" fontWeight="bold">
//               Discount Configuration
//             </Typography>

//             <FormControl>
//               <FormLabel>Discount Type *</FormLabel>
//               <RadioGroup
//                 value={formData.discount_type}
//                 onChange={(e) => setFormData({ 
//                   ...formData, 
//                   discount_type: e.target.value as "percentage" | "fixed_amount" 
//                 })}
//               >
//                 <Stack direction="row" spacing={2}>
//                   <Radio value="percentage" label="Percentage (%)" />
//                   <Radio value="fixed_amount" label="Fixed Amount ($)" />
//                 </Stack>
//               </RadioGroup>
//             </FormControl>

//             <Stack direction="row" spacing={2}>
//               <FormControl error={!!errors.discount_value} sx={{ flex: 1 }}>
//                 <FormLabel>
//                   Discount Value * {formData.discount_type === "percentage" ? "(%)" : "($)"}
//                 </FormLabel>
//                 <Input
//                   type="number"
//                   value={formData.discount_value}
//                   onChange={(e) => setFormData({ 
//                     ...formData, 
//                     discount_value: parseFloat(e.target.value) || 0 
//                   })}
//                   slotProps={{
//                     input: {
//                       min: 0,
//                       max: formData.discount_type === "percentage" ? 100 : undefined,
//                       step: formData.discount_type === "percentage" ? 1 : 0.01,
//                     }
//                   }}
//                 />
//                 {errors.discount_value && (
//                   <Typography level="body-xs" color="danger">
//                     {errors.discount_value}
//                   </Typography>
//                 )}
//               </FormControl>

//               <FormControl sx={{ flex: 1 }}>
//                 <FormLabel>Minimum Order Amount ($)</FormLabel>
//                 <Input
//                   type="number"
//                   value={formData.minimum_order_amount}
//                   onChange={(e) => setFormData({ 
//                     ...formData, 
//                     minimum_order_amount: parseFloat(e.target.value) || 0 
//                   })}
//                   slotProps={{
//                     input: {
//                       min: 0,
//                       step: 0.01,
//                     }
//                   }}
//                 />
//               </FormControl>
//             </Stack>

//             {formData.discount_type === "percentage" && (
//               <FormControl>
//                 <FormLabel>Maximum Discount Amount ($)</FormLabel>
//                 <Input
//                   type="number"
//                   value={formData.maximum_discount_amount || ""}
//                   onChange={(e) => setFormData({ 
//                     ...formData, 
//                     maximum_discount_amount: e.target.value ? parseFloat(e.target.value) : undefined 
//                   })}
//                   placeholder="Optional cap on discount"
//                   slotProps={{
//                     input: {
//                       min: 0,
//                       step: 0.01,
//                     }
//                   }}
//                 />
//               </FormControl>
//             )}

//             <Divider />

//             {/* Date and Time */}
//             <Typography level="title-md" fontWeight="bold">
//               Validity Period
//             </Typography>

//             <Stack direction="row" spacing={2}>
//               <FormControl error={!!errors.start_datetime} sx={{ flex: 1 }}>
//                 <FormLabel>Start Date & Time *</FormLabel>
//                 <Input
//                   type="datetime-local"
//                   value={formData.start_datetime}
//                   onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
//                 />
//                 {errors.start_datetime && (
//                   <Typography level="body-xs" color="danger">
//                     {errors.start_datetime}
//                   </Typography>
//                 )}
//               </FormControl>

//               <FormControl error={!!errors.end_datetime} sx={{ flex: 1 }}>
//                 <FormLabel>End Date & Time</FormLabel>
//                 <Input
//                   type="datetime-local"
//                   value={formData.end_datetime}
//                   onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
//                   placeholder="Optional"
//                 />
//                 {errors.end_datetime && (
//                   <Typography level="body-xs" color="danger">
//                     {errors.end_datetime}
//                   </Typography>
//                 )}
//               </FormControl>
//             </Stack>

//             <Divider />

//             {/* Usage Limits */}
//             <Typography level="title-md" fontWeight="bold">
//               Usage Limits
//             </Typography>

//             <Stack direction="row" spacing={2}>
//               <FormControl sx={{ flex: 1 }}>
//                 <FormLabel>Total Usage Limit</FormLabel>
//                 <Input
//                   type="number"
//                   value={formData.usage_limit || ""}
//                   onChange={(e) => setFormData({ 
//                     ...formData, 
//                     usage_limit: e.target.value ? parseInt(e.target.value) : undefined 
//                   })}
//                   placeholder="Unlimited"
//                   slotProps={{
//                     input: {
//                       min: 1,
//                     }
//                   }}
//                 />
//               </FormControl>

//               <FormControl sx={{ flex: 1 }}>
//                 <FormLabel>Usage Per Customer</FormLabel>
//                 <Input
//                   type="number"
//                   value={formData.usage_limit_per_customer || ""}
//                   onChange={(e) => setFormData({ 
//                     ...formData, 
//                     usage_limit_per_customer: e.target.value ? parseInt(e.target.value) : undefined 
//                   })}
//                   placeholder="Unlimited"
//                   slotProps={{
//                     input: {
//                       min: 1,
//                     }
//                   }}
//                 />
//               </FormControl>
//             </Stack>

//             <Divider />

//             {/* Applicable Products */}
//             <Typography level="title-md" fontWeight="bold">
//               Applicable Products
//             </Typography>

//             <Alert color="neutral" variant="soft" startDecorator={<FiAlertCircle />}>
//               <Typography level="body-sm">
//                 Leave empty to apply discount to all products, or select specific products
//               </Typography>
//             </Alert>

//             <FormControl>
//               <FormLabel>Select Products</FormLabel>
//               <Select
//                 placeholder="Choose products..."
//                 onChange={(_, value) => handleProductSelect(value as string | null)}
//                 value={null}
//               >
//                 {products
//                   .filter(p => !selectedProducts.some(sp => sp.id === p.id))
//                   .map((product) => (
//                     <Option key={product.id} value={product.id}>
//                       {product.name} - ${product.price}
//                     </Option>
//                   ))}
//               </Select>
//             </FormControl>

//             {selectedProducts.length > 0 && (
//               <Box>
//                 <Typography level="body-sm" sx={{ mb: 1 }}>
//                   Selected Products:
//                 </Typography>
//                 <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
//                   {selectedProducts.map((product) => (
//                     <Chip
//                       key={product.id}
//                       variant="soft"
//                       color="primary"
//                       endDecorator={
//                         <ChipDelete onDelete={() => handleRemoveProduct(product.id)} />
//                       }
//                     >
//                       {product.name}
//                     </Chip>
//                   ))}
//                 </Stack>
//               </Box>
//             )}

//             <Divider />

//             {/* Status */}
//             <FormControl>
//               <FormLabel>Status</FormLabel>
//               <Select
//                 value={formData.status}
//                 onChange={(_, value) => setFormData({ 
//                   ...formData, 
//                   status: value as "active" | "inactive" | "expired" | "paused" 
//                 })}
//               >
//                 <Option value="active">Active</Option>
//                 <Option value="inactive">Inactive</Option>
//                 <Option value="paused">Paused</Option>
//               </Select>
//             </FormControl>

//             {errors.submit && (
//               <Alert color="danger" variant="soft">
//                 {errors.submit}
//               </Alert>
//             )}

//             {/* Action Buttons */}
//             <Stack direction="row" spacing={2} justifyContent="flex-end">
//               <Button variant="outlined" color="neutral" onClick={onClose} disabled={loading}>
//                 Cancel
//               </Button>
//               <Button type="submit" loading={loading}>
//                 {discount ? "Update Discount" : "Create Discount"}
//               </Button>
//             </Stack>
//           </Stack>
//         </form>
//       </ModalDialog>
//     </Modal>
//   );
// }
