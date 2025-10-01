# Discount Management - Quick Reference

## Component Props Reference

### DiscountFormModal
```typescript
interface DiscountFormModalProps {
  open: boolean;                              // Controls modal visibility
  onClose: () => void;                        // Called when modal closes
  onSubmit: (payload: CreateDiscountPayload) => Promise<void>;  // Handle form submission
  discount?: Discount | null;                 // Existing discount for editing (optional)
  products: Product[];                        // Available products list
  businessId: string;                         // Current business ID
}
```

**Usage Example:**
```tsx
<DiscountFormModal
  open={formModalOpen}
  onClose={() => setFormModalOpen(false)}
  onSubmit={handleDiscountSubmit}
  discount={selectedDiscount}
  products={products}
  businessId={businessDetails.id}
/>
```

### DiscountStatsModal
```typescript
interface DiscountStatsModalProps {
  open: boolean;              // Controls modal visibility
  onClose: () => void;        // Called when modal closes
  discountId: string;         // Discount ID to fetch stats for
  discountName: string;       // Discount name for display
}
```

**Usage Example:**
```tsx
<DiscountStatsModal
  open={statsModalOpen}
  onClose={() => setStatsModalOpen(false)}
  discountId={selectedDiscountId}
  discountName="Summer Sale"
/>
```

## Service Functions Reference

### Fetching Discounts
```typescript
// Get all discounts
const discounts = await DiscountService.fetchAllDiscounts();

// Get discounts by business
const discounts = await DiscountService.fetchDiscountsByBusinessId(businessId);

// Get only active discounts
const activeDiscounts = await DiscountService.fetchActiveDiscountsByBusinessId(businessId);

// Get single discount with details
const discount = await DiscountService.fetchDiscountById(discountId);
```

### Creating/Updating Discounts
```typescript
// Create new discount
const payload: CreateDiscountPayload = {
  business_id: "123",
  name: "Summer Sale",
  description: "20% off all items",
  discount_type: "percentage",
  discount_value: 20,
  minimum_order_amount: 50,
  start_datetime: "2025-10-01T00:00",
  end_datetime: "2025-10-31T23:59",
  status: "active",
  applicable_products: ["product-id-1", "product-id-2"]
};

const newDiscount = await DiscountService.createDiscount(payload);

// Update existing discount
const updatePayload: UpdateDiscountPayload = {
  name: "Extended Summer Sale",
  discount_value: 25,
  status: "active"
};

const updated = await DiscountService.updateDiscount(discountId, updatePayload);

// Delete discount
await DiscountService.deleteDiscount(discountId);
```

### Validation & Statistics
```typescript
// Validate discount for an order
const validation = await DiscountService.validateDiscount(discountId, {
  order_total: 100,
  user_id: "user-123",
  product_ids: ["product-1", "product-2"]
});

if (validation.valid) {
  console.log("Discount amount:", validation.discount?.discount_amount);
}

// Update usage count (after order completion)
await DiscountService.updateDiscountUsage(discountId);

// Get statistics
const stats = await DiscountService.fetchDiscountStats(discountId);
console.log("Total orders:", stats.statistics.total_orders);
console.log("Revenue impact:", stats.statistics.total_revenue_impact);
```

## Common Patterns

### Creating a Discount
```typescript
const handleCreateDiscount = async () => {
  try {
    const payload: CreateDiscountPayload = {
      business_id: businessId,
      name: "Black Friday",
      discount_type: "percentage",
      discount_value: 30,
      minimum_order_amount: 100,
      start_datetime: new Date().toISOString(),
      status: "active",
      applicable_products: [] // Empty = all products
    };
    
    await DiscountService.createDiscount(payload);
    console.log("Discount created!");
  } catch (error) {
    console.error("Failed to create discount:", error);
  }
};
```

### Editing a Discount
```typescript
const handleEditDiscount = async (discount: Discount) => {
  try {
    const payload: UpdateDiscountPayload = {
      discount_value: 40, // Increase discount
      status: "active"
    };
    
    await DiscountService.updateDiscount(discount.id, payload);
    console.log("Discount updated!");
  } catch (error) {
    console.error("Failed to update discount:", error);
  }
};
```

### Applying Discount to Order
```typescript
const applyDiscountToOrder = async (
  discountId: string,
  orderTotal: number,
  productIds: string[]
) => {
  try {
    // Validate discount
    const validation = await DiscountService.validateDiscount(discountId, {
      order_total: orderTotal,
      product_ids: productIds
    });
    
    if (!validation.valid) {
      console.error("Discount not valid");
      return null;
    }
    
    // Calculate final amount
    const finalAmount = orderTotal - validation.discount!.discount_amount;
    
    // After successful order, update usage
    await DiscountService.updateDiscountUsage(discountId);
    
    return {
      finalAmount,
      discountAmount: validation.discount!.discount_amount
    };
  } catch (error) {
    console.error("Error applying discount:", error);
    return null;
  }
};
```

## Type Reference

### Discount Type
```typescript
interface Discount {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount_amount: number | null;
  start_datetime: string;
  end_datetime: string | null;
  usage_limit: number | null;
  usage_limit_per_customer: number | null;
  current_usage_count: number;
  status: 'active' | 'inactive' | 'expired' | 'paused';
  created_at: string;
  updated_at: string;
  applicable_products?: ApplicableProduct[];
}
```

### Create/Update Payloads
```typescript
interface CreateDiscountPayload {
  business_id: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  minimum_order_amount?: number;
  maximum_discount_amount?: number;
  start_datetime: string;
  end_datetime?: string;
  usage_limit?: number;
  usage_limit_per_customer?: number;
  status?: 'active' | 'inactive' | 'expired' | 'paused';
  applicable_products?: string[];
}

interface UpdateDiscountPayload {
  // All fields optional - only send what you want to update
  name?: string;
  description?: string;
  discount_type?: 'percentage' | 'fixed_amount';
  discount_value?: number;
  // ... etc
}
```

## Validation Rules

### Form Validation
- ✅ Name is required
- ✅ Discount value must be > 0
- ✅ Percentage discounts cannot exceed 100%
- ✅ Start date is required
- ✅ End date must be after start date
- ✅ Minimum order amount must be >= 0

### Backend Validation
- ✅ Discount must be active
- ✅ Current date within validity period
- ✅ Usage limit not exceeded
- ✅ Per-customer limit not exceeded (if user_id provided)
- ✅ Order total meets minimum requirement
- ✅ Products in order match applicable products (if specified)

## Status Flow

```
┌─────────┐     activate     ┌────────┐     expire      ┌─────────┐
│ Inactive├─────────────────►│ Active ├────────────────►│ Expired │
└─────────┘                  └───┬────┘                 └─────────┘
                                 │
                              pause │
                                 │
                                 ▼
                            ┌────────┐
                            │ Paused │
                            └────────┘
```

## Common Use Cases

### 1. Site-wide Sale
```typescript
{
  name: "Site-wide Sale",
  discount_type: "percentage",
  discount_value: 20,
  applicable_products: [], // Empty = all products
  minimum_order_amount: 0,
  status: "active"
}
```

### 2. Minimum Purchase Discount
```typescript
{
  name: "Spend $100, Save $20",
  discount_type: "fixed_amount",
  discount_value: 20,
  minimum_order_amount: 100,
  status: "active"
}
```

### 3. Limited Time Offer
```typescript
{
  name: "Flash Sale",
  discount_type: "percentage",
  discount_value: 50,
  start_datetime: "2025-10-15T00:00",
  end_datetime: "2025-10-15T23:59",
  usage_limit: 100, // Only 100 uses
  status: "active"
}
```

### 4. Product-Specific Discount
```typescript
{
  name: "Electronics Sale",
  discount_type: "percentage",
  discount_value: 15,
  applicable_products: ["laptop-id", "phone-id", "tablet-id"],
  status: "active"
}
```

### 5. Customer Loyalty Discount
```typescript
{
  name: "Loyalty Reward",
  discount_type: "fixed_amount",
  discount_value: 10,
  usage_limit_per_customer: 1, // One-time use per customer
  status: "active"
}
```

## Error Handling

### Common Errors
```typescript
try {
  await DiscountService.createDiscount(payload);
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 400) {
      // Validation error
      console.error("Invalid discount data");
    } else if (error.response?.status === 404) {
      // Business not found
      console.error("Business not found");
    } else if (error.response?.status === 500) {
      // Server error
      console.error("Server error");
    }
  }
}
```

## Tips & Best Practices

1. **Always validate on frontend and backend** - User experience + security
2. **Use appropriate discount types** - Percentage for flexible amounts, fixed for simplicity
3. **Set maximum caps on percentage discounts** - Prevent abuse
4. **Monitor usage statistics** - Understand discount effectiveness
5. **Archive expired discounts** - Keep data clean
6. **Test discount logic thoroughly** - Edge cases matter
7. **Clear naming conventions** - Make discounts easy to identify
8. **Document discount rules** - For customer support

---

This quick reference should help you integrate and use the discount management system effectively!
