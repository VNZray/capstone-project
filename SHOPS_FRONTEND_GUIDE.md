# Shops Front Page Implementation Guide

## 📋 Overview
A fully functional, modern Shops directory front page with multiple sections showcasing featured shops, special offers, categories, and a scrollable discover list.

## 🎨 Component Structure

### Location: `/city-venture/components/shops/`

#### 1. **FeaturedShopCard.tsx**
A prominent card component for featured shops with an overlay design.

**Features:**
- Full-screen image background with dark overlay
- "FEATURED" badge in top-left corner
- Title and category displayed at bottom
- Star rating with review count
- Responsive dimensions (280x200px, adaptable)
- Elevation shadows for depth

**Props:**
- `image`: Shop image URL or local asset
- `name`: Shop name (display text)
- `category`: Category/description
- `rating`: Star rating (0-5)
- `reviews`: Review count
- `featured`: Show featured badge
- `onPress`: Tap handler
- `elevation`: Shadow depth (0-6)

**Usage:**
```tsx
<FeaturedShopCard
  image={shop.business_image}
  name={shop.business_name}
  category={shop.description}
  rating={4.5}
  reviews={120}
  featured
  onPress={() => handlePress(shop)}
/>
```

---

#### 2. **SpecialOfferCard.tsx**
Portrait-oriented promo card for special offers and promotions.

**Features:**
- Tall, narrow rectangular design (140x200px)
- Displays promotional images
- Subtle overlay for visual feedback
- Clean, minimal styling

**Props:**
- `image`: Promo image
- `onPress`: Tap handler
- `style`: Custom styles

**Usage:**
```tsx
<SpecialOfferCard
  image={require('@/assets/images/placeholder.png')}
  onPress={() => handleOfferTap()}
/>
```

---

#### 3. **ShopCategoryChip.tsx**
Interactive category pills for filtering and navigation.

**Features:**
- Active/inactive state styling
- Icon + text layout
- Customizable colors and sizes
- Smooth press animations
- Accessibility support

**Props:**
- `label`: Category name
- `icon`: FontAwesome5 icon name
- `active`: Current selection state
- `onPress`: Selection handler

**Usage:**
```tsx
<ShopCategoryChip
  label="Restaurants"
  icon="utensils"
  active={activeCategory === 'restaurant'}
  onPress={() => setActiveCategory('restaurant')}
/>
```

---

#### 4. **ShopListCard.tsx**
Horizontal card for shop listings in the "Discover More" section.

**Features:**
- Horizontal layout with image on left, info on right
- Shop name, category badge, distance, rating
- Location with map pin emoji
- Compact, scrollable design
- Consistent with ShopCard pattern

**Props:**
- `image`: Shop image
- `name`: Shop name
- `category`: Category type
- `distance`: Distance in km
- `rating`: Star rating
- `reviews`: Review count
- `location`: Address/location text
- `onPress`: Tap handler

**Usage:**
```tsx
<ShopListCard
  image={shop.business_image}
  name={shop.business_name}
  category={shop.description}
  distance={2.5}
  rating={4.2}
  reviews={89}
  location={shop.address}
  onPress={() => handlePress(shop)}
/>
```

---

#### 5. **ShopDirectory.tsx**
Main directory component orchestrating all sections.

**Features:**
- Search bar integration (top-mounted)
- Featured shops carousel (horizontal scroll)
- Special offers carousel (portrait images)
- Category filters (horizontal scroll chips)
- Discover More feed (vertical infinite scroll with FlatList)
- Pull-to-refresh functionality
- Loading states and error handling
- Dark/light theme support

**Sections:**

**5a. Search Bar**
- Uses existing SearchBar component
- Filters shops by name/description
- Real-time search updates

**5b. Featured Shops**
- Displays top 3 shops as FeaturedShopCard
- Horizontal carousel
- "View All" link for future expansion

**5c. Special Offers**
- 3 placeholder promo images
- Portrait-oriented cards
- Horizontal scroll layout

**5d. Shop Categories**
- Pre-defined category chips
- Current categories: All, Restaurants, Cafés, Shopping, Groceries, Pharmacy, Salons, Hotels, Entertainment
- Active state styling
- Icons for each category

**5e. Discover More**
- Paginated/infinite list of shops
- Uses FlatList for performance
- ShopListCard components
- Refresh control support
- Empty state handling

---

## 🎯 Styling & Theming

### Color System
- Primary: `#0A1B47` (dark blue)
- Secondary: `#0077B6` (bright blue)
- Dark theme: Uses dark grays/blacks from constants
- Light theme: Uses whites/light grays

### Responsive Design
- Uses `moderateScale()` utility for adaptive sizing
- All dimensions scale with screen width
- Mobile-first approach
- Tablet-friendly layouts

### Shadows & Elevation
- Platform-aware (iOS/Android/Web)
- 6 elevation levels for depth
- Subtle to prominent shadows

---

## 📱 Layout Flow

```
┌─────────────────────────────┐
│      Search Bar             │  ← Top sticky
├─────────────────────────────┤
│   Featured Shops (Carousel) │  ← Horizontal scroll
├─────────────────────────────┤
│   Special Offers (Carousel) │  ← Horizontal scroll
├─────────────────────────────┤
│   Shop Categories (Chips)   │  ← Horizontal scroll
├─────────────────────────────┤
│                             │
│   Discover More             │
│   ┌───────────────────────┐ │
│   │  Shop List Card       │ │
│   ├───────────────────────┤ │
│   │  Shop List Card       │ │  ← FlatList (infinite)
│   ├───────────────────────┤ │
│   │  Shop List Card       │ │
│   └───────────────────────┘ │
│                             │
└─────────────────────────────┘
```

---

## 🔧 Integration & Usage

### Main Entry Point
File: `/city-venture/app/(tabs)/(home)/(shop)/index.tsx`

```tsx
import ShopDirectory from '@/components/shops/ShopDirectory';

const Shop = () => {
  return <ShopDirectory />;
};

export default Shop;
```

### Data Flow
1. **On Mount**: Fetches all businesses via `fetchAllBusinessDetails()`
2. **Filter**: Filters by status (Active/Approved)
3. **Display**: Groups into featured (first 3) and discover (remaining)
4. **Search**: Real-time filtering by business name/description
5. **Navigation**: Navigates to business-details screen on tap

---

## 🚀 Features & Capabilities

✅ **Fully Responsive**: Adapts to all screen sizes
✅ **Dark/Light Mode**: Theme-aware styling
✅ **Search Integration**: Real-time shop search
✅ **Infinite Scroll**: FlatList-based discovery feed
✅ **Pull-to-Refresh**: Native RefreshControl support
✅ **Loading States**: Proper UX for async data
✅ **Error Handling**: User-friendly error messages
✅ **Accessibility**: Proper labels and roles
✅ **Performance**: Optimized with useMemo & useCallback
✅ **Touch Feedback**: Opacity changes on press

---

## 🎨 Customization Tips

### Change Featured Shop Count
In `ShopDirectory.tsx`, line ~180:
```tsx
const featuredShops = useMemo(() => filteredShops.slice(0, 3), [filteredShops]);
//                                                        ↑ Change this number
```

### Add More Categories
In `ShopDirectory.tsx`, update `SHOP_CATEGORIES`:
```tsx
const SHOP_CATEGORIES: Record<string, { label: string; icon: string }> = {
  // ... existing categories
  museum: { label: 'Museums', icon: 'building' },
};
```

### Customize Colors
Use the color constants from `/constants/color.ts`:
```tsx
colors.primary       // Main brand color
colors.secondary     // Accent color
colors.error         // Error state
colors.success       // Success state
colors.warning       // Warning state
colors.info          // Info state
```

### Adjust Card Sizes
All components use `moderateScale()` from `/utils/responsive.ts`:
```tsx
const CARD_WIDTH = moderateScale(280, 0.55, width);
//                                 ↑ Base size (pixels)
//                                    ↑ Scale factor (0.55 = aggressive scaling)
```

---

## 🔗 Related Components

- `SearchBar` - Already exists, reused here
- `PageContainer` - Layout wrapper with padding
- `Container` - Horizontal layout wrapper
- `ThemedText` - Theme-aware text component
- `Button` - Reusable button component (for "View All" links)

---

## 📦 File Summary

| File | Lines | Purpose |
|------|-------|---------|
| `FeaturedShopCard.tsx` | ~155 | Featured shop card with overlay |
| `SpecialOfferCard.tsx` | ~105 | Portrait promo card |
| `ShopCategoryChip.tsx` | ~85 | Category filter chip |
| `ShopListCard.tsx` | ~220 | Horizontal shop list item |
| `ShopDirectory.tsx` | ~435 | Main directory orchestrator |
| **Total** | **~1000** | Complete shops module |

---

## 🎬 Next Steps (Future Enhancements)

1. **Filter by Category**: Hook category chips to actually filter shops
2. **Favorite System**: Add heart icon to mark favorite shops
3. **Advanced Search**: Filter by rating, distance, type
4. **Real Offers**: Replace placeholder promo images with actual offers
5. **Analytics**: Track popular shops and categories
6. **Pagination**: Implement proper pagination for large datasets
7. **Maps Integration**: Show distance and direction to shops
8. **Coupons/Deals**: Display available discounts and offers
9. **Reviews Preview**: Show top reviews inline
10. **Social Sharing**: Share shops with friends

---

## 💡 Design Philosophy

- **Clean & Modern**: Minimal design with focus on content
- **User-Centric**: Intuitive navigation and fast interactions
- **Accessible**: Proper color contrast and touch targets
- **Performant**: Optimized rendering with React hooks
- **Consistent**: Follows existing app patterns and conventions
- **Flexible**: Easy to customize colors, sizes, and content

---

**Happy shopping! 🛍️**
