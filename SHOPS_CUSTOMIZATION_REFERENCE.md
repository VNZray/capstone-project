# Shops Component Customization Reference

## 🎨 Quick Styling Guide

### Color Customization

All components respect the app's theme system. Modify colors in `/constants/color.ts`:

```typescript
export const colors = {
  primary: '#0A1B47',      // Main brand color (featured badges)
  secondary: '#0077B6',    // Accent color (category chips, section headers)
  tertiary: '#DEE3F2',     // Tertiary background
  error: '#dc3545',        // Error states
  success: '#198754',      // Success states
  warning: '#ffc107',      // Warnings
  info: '#0dcaf0',         // Info messages
};
```

**To customize:**
1. Update color values in `colors` object
2. All shop components automatically use updated colors
3. No need to modify individual components

### Theme Support

Components automatically support dark/light modes:

```tsx
const scheme = useColorScheme();
const isDark = scheme === 'dark';

// Dark mode colors
const darkBg = '#0D1B2A';     // Very dark blue
const darkText = '#ECEDEE';   // Almost white

// Light mode colors
const lightBg = '#F8F9FA';    // Almost white
const lightText = '#0D1B2A';  // Dark blue
```

---

## 📐 Sizing & Responsive Design

All components use `moderateScale()` for adaptive sizing:

```typescript
// The moderateScale formula:
// moderateScale(base, scaleFactor, screenWidth)

// Example: Featured shop card width
const CARD_WIDTH = moderateScale(280, 0.55, width);
//                                     ↑ Scale factor
//                                        - 0.4 = conservative (less scaling)
//                                        - 0.55 = balanced (medium)
//                                        - 0.7 = aggressive (high scaling)
```

**Typical Sizes:**
- Small screens (< 375px): ~20% reduction
- Medium screens (375-600px): ~10% reduction
- Large screens (> 600px): Base size maintained

### Component Dimensions

```tsx
// FeaturedShopCard
WIDTH: moderateScale(280, 0.55, width)   // 280px base
HEIGHT: moderateScale(200, 0.55, width)  // 200px base
RADIUS: moderateScale(16, 0.55, width)   // 16px corner radius

// SpecialOfferCard
WIDTH: moderateScale(140, 0.55, width)   // 140px base
HEIGHT: moderateScale(200, 0.55, width)  // 200px base
RADIUS: moderateScale(14, 0.55, width)   // 14px corner radius

// ShopListCard
IMAGE_SIZE: moderateScale(100, 0.55, width)  // 100px square
RADIUS: moderateScale(14, 0.55, width)       // 14px

// ShopCategoryChip
PADDING_H: moderateScale(14, 0.55, width)
PADDING_V: moderateScale(10, 0.55, width)
RADIUS: moderateScale(20, 0.55, width)
```

---

## 🎯 Component Configuration

### FeaturedShopCard Options

```tsx
<FeaturedShopCard
  image={imageUrl}
  name="Shop Name"
  category="Category"
  rating={4.5}              // 0-5 scale
  reviews={120}             // Number count
  featured={true}           // Show "FEATURED" badge
  elevation={2}             // Shadow depth: 1-6
  onPress={handlePress}
  style={{}}                // Custom styles
  nameStyle={{}}            // Custom name text style
/>
```

### ShopCategoryChip Configuration

```tsx
<ShopCategoryChip
  label="Restaurants"
  icon="utensils"           // FontAwesome5 icon name
  active={isActive}         // Boolean
  onPress={handleSelect}
  style={{}}
/>
```

**Available Icons** (FontAwesome5):
```
Common:
- utensils      (Restaurants)
- coffee        (Cafés)
- shopping-bag  (Shopping)
- shopping-basket (Groceries)
- pills         (Pharmacy)
- cut           (Salons/Barbers)
- hotel         (Hotels)
- gamepad       (Entertainment)
- th-large      (All/Grid view)
- map-pin       (Maps)
- star          (Ratings)
```

### ShopListCard Props

```tsx
<ShopListCard
  image={imageUrl}
  name="Shop Name"
  category="Category Type"
  distance={2.5}            // km
  rating={4.2}              // 0-5
  reviews={89}              // count
  location="Street Address"
  elevation={1}             // 1-6
  onPress={handlePress}
/>
```

---

## 🔧 Advanced Configuration

### Modifying Search Functionality

In `ShopDirectory.tsx`:

```tsx
// Current: Searches by business name and description
const filteredShops = useMemo(() => {
  if (!Array.isArray(businesses)) return [];
  let filtered = businesses;

  if (search.trim()) {
    const term = search.toLowerCase();
    filtered = filtered.filter((b) =>
      b.business_name?.toLowerCase().includes(term) ||
      b.description?.toLowerCase().includes(term)
      // Add more fields:
      // || b.address?.toLowerCase().includes(term)
      // || b.owner_name?.toLowerCase().includes(term)
    );
  }

  return filtered;
}, [businesses, search]);
```

### Changing Featured Shop Count

```tsx
// Change from 3 to 5 featured shops:
const featuredShops = useMemo(
  () => filteredShops.slice(0, 5),  // ← Change number here
  [filteredShops]
);
```

### Custom Category Filtering

```tsx
// Current: Placeholder (no actual filtering by category)
const handleCategoryChange = (categoryKey: string) => {
  setActiveCategory(categoryKey);
  // TODO: Implement actual filtering logic
  
  // Example implementation:
  // const filtered = businesses.filter(b => {
  //   return b.business_category === getCategoryIdFromKey(categoryKey);
  // });
};
```

### Adding Pagination

```tsx
// Replace the simple slice() approach:
const discoverMoreShops = useMemo(
  () => {
    const itemsPerPage = 10;
    const startIndex = (page - 1) * itemsPerPage;
    return filteredShops.slice(startIndex, startIndex + itemsPerPage);
  },
  [filteredShops, page]
);

// Handle pagination:
const handleLoadMore = () => {
  setPage(prev => prev + 1);
};

// Use in FlatList:
<FlatList
  onEndReached={handleLoadMore}
  onEndReachedThreshold={0.5}  // Trigger at 50% from bottom
  // ... other props
/>
```

---

## 🌈 Theme Customization Examples

### Custom Dark Mode

```typescript
// In /constants/color.ts
export const colors = {
  // Add custom dark theme
  darkBg: '#0A0E27',        // Deeper dark
  darkText: '#E8EAED',      // Warmer white
  darkCard: '#16213E',      // Card background
};
```

### Custom Light Mode

```typescript
export const colors = {
  // Add custom light theme
  lightBg: '#FAFBFC',       // Slightly warmer white
  lightText: '#1A1A1A',     // Darker black
  lightCard: '#FFFFFF',     // Pure white cards
};
```

### Custom Accent Colors

```typescript
// Modify secondary colors for different brand
export const colors = {
  primary: '#FF6B35',       // Orange
  secondary: '#F7931E',     // Lighter orange
  tertiary: '#FBE9E7',      // Pale orange
};
```

---

## 📊 Elevation (Shadow) Levels

All components support 6 elevation levels:

```
Level 1: Subtle shadow for emphasis
Level 2: Standard card shadow (most common)
Level 3: Elevated card shadow
Level 4: Strong elevation
Level 5: Very prominent shadow
Level 6: Maximum elevation (floating action)

// Shadow implementation (iOS):
Level 1: opacity 0.08, radius 2px, offset 1px
Level 2: opacity 0.10, radius 3px, offset 2px
Level 3: opacity 0.12, radius 4px, offset 3px
Level 4: opacity 0.14, radius 5px, offset 4px
Level 5: opacity 0.16, radius 6px, offset 5px
Level 6: opacity 0.18, radius 7px, offset 6px
```

**Usage:**
```tsx
<FeaturedShopCard
  // ... props
  elevation={2}  // Standard card shadow
/>

<ShopListCard
  // ... props
  elevation={1}  // Subtle shadow
/>
```

---

## 🎬 State Management

All state is managed locally in `ShopDirectory.tsx`:

```tsx
// Search state
const [search, setSearch] = useState('');

// Category filtering
const [activeCategory, setActiveCategory] = useState('all');

// Loading states
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [error, setError] = useState<string | null>(null);

// Business data
const [businesses, setBusinesses] = useState<Business[]>([]);
```

**Future Enhancement**: Consider moving to Context API or Redux if other screens need this data.

---

## 🔌 API Integration

### Current Flow

1. **Fetch**: `fetchAllBusinessDetails()` from `BusinessService`
2. **Filter**: By status (Active/Approved) and search term
3. **Display**: Groups into featured and discover sections
4. **Navigate**: Passes business ID to details screen

### Expected Business Data Structure

```typescript
interface Business {
  id: string;
  business_name: string;
  business_image?: string;
  description?: string;
  address?: string;
  barangay_id?: number;
  status: 'Active' | 'Approved' | 'Pending' | 'Rejected';
  business_type_id?: number;
  business_category_id?: number;
  min_price?: number;
  max_price?: number;
  // ... other fields from your Business type
}
```

### Adding More Data Fields

To display additional data in cards:

```tsx
// In ShopListCard component, add new prop:
type ShopListCardProps = {
  // ... existing props
  openingHours?: string;
  isOpen?: boolean;
  deliveryTime?: string;
};

// In ShopDirectory, pass new data:
<ShopListCard
  // ... existing props
  openingHours={shop.opening_hours}
  isOpen={shop.is_open}
  deliveryTime={shop.delivery_time}
/>
```

---

## 🐛 Debugging Tips

### Console Logging

```tsx
// In ShopDirectory.tsx, data loading is already logged:
console.log('📊 Businesses fetched:', data.length);
console.log('✅ Active businesses:', activeBusinesses.length);

// Add more logging:
console.log('🔍 Search term:', search);
console.log('📂 Filtered shops:', filteredShops.length);
console.log('⭐ Featured shops:', featuredShops.length);
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Cards not showing | Check if `fetchAllBusinessDetails()` returns data |
| Images broken | Verify image URLs are accessible |
| Styling off | Check screen width with `useWindowDimensions()` |
| Navigation failing | Ensure `business.id` exists in data |
| Refresh not working | Verify `RefreshControl` is properly placed |
| Search not filtering | Check search term is lowercased before comparing |

---

## 📚 Additional Resources

- **React Native Docs**: https://reactnative.dev/
- **Expo Docs**: https://docs.expo.dev/
- **FontAwesome Icons**: https://fontawesome.com/icons
- **Color Theory**: https://www.interaction-design.org/literature/article/color-theory-for-digital-displays

---

**Last Updated**: November 2025
**Status**: Production Ready ✅
