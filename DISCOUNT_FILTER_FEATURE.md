# Discount Filter Feature Documentation

## Overview
The Discount Management page now includes a powerful filtering system that allows you to view discounts by their current state. This helps you quickly find and manage discounts based on their status and timing.

## Filter Categories

### 1. **All Discounts** 📋
- **Icon**: List icon (FiList)
- **Color**: Primary (Blue)
- **Shows**: Every discount in the system
- **Use Case**: Get a complete overview of all discounts

### 2. **Ongoing Discounts** ✅
- **Icon**: Check Circle (FiCheckCircle)
- **Color**: Success (Green)
- **Shows**: Discounts that are:
  - Status = "active"
  - Start date ≤ Current date
  - End date ≥ Current date (or no end date)
- **Use Case**: See which discounts are currently available to customers

### 3. **Scheduled Discounts** 📅
- **Icon**: Calendar (FiCalendar)
- **Color**: Primary (Blue)
- **Shows**: Discounts that are:
  - Status = "active"
  - Start date > Current date
- **Use Case**: View upcoming discounts that haven't started yet

### 4. **Expired Discounts** ⚠️
- **Icon**: Alert Circle (FiAlertCircle)
- **Color**: Danger (Red)
- **Shows**: Discounts that are:
  - Status = "expired" OR
  - End date < Current date (and status ≠ "inactive")
- **Use Case**: Review past discounts and their performance

### 5. **Inactive Discounts** ⏸️
- **Icon**: Pause (FiPause)
- **Color**: Warning (Orange)
- **Shows**: Discounts with status:
  - "inactive" OR
  - "paused"
- **Use Case**: Manage disabled or temporarily paused discounts

## UI Implementation

### Filter Chips
```tsx
<Chip
  variant={activeFilter === "ongoing" ? "solid" : "outlined"}
  color={activeFilter === "ongoing" ? "success" : "neutral"}
  onClick={() => setActiveFilter("ongoing")}
  startDecorator={<FiCheckCircle />}
  sx={{ cursor: "pointer" }}
>
  Ongoing ({getFilterCount("ongoing")})
</Chip>
```

### Features
- **Visual Feedback**: Active filter is shown with solid background
- **Count Badge**: Each chip displays the number of matching discounts
- **Interactive**: Click any chip to switch filters
- **Responsive**: Wraps nicely on smaller screens

## Filter Logic

### State Management
```typescript
type DiscountFilter = "all" | "ongoing" | "scheduled" | "expired" | "inactive";

const [activeFilter, setActiveFilter] = useState<DiscountFilter>("all");
```

### Filtering Function
```typescript
const filteredDiscounts = useMemo(() => {
  const now = new Date();

  return discounts.filter((discount) => {
    const startDate = new Date(discount.start_datetime);
    const endDate = discount.end_datetime ? new Date(discount.end_datetime) : null;

    switch (activeFilter) {
      case "all":
        return true;

      case "ongoing":
        return (
          discount.status === "active" &&
          startDate <= now &&
          (!endDate || endDate >= now)
        );

      case "scheduled":
        return discount.status === "active" && startDate > now;

      case "expired":
        return (
          discount.status === "expired" ||
          (endDate && endDate < now && discount.status !== "inactive")
        );

      case "inactive":
        return discount.status === "inactive" || discount.status === "paused";

      default:
        return true;
    }
  });
}, [discounts, activeFilter]);
```

### Count Function
```typescript
const getFilterCount = (filter: DiscountFilter): number => {
  // Similar logic to filteredDiscounts but returns count
  // Used to show badge numbers on filter chips
};
```

## User Experience Flow

### Initial Load
1. Page loads with "All Discounts" filter active
2. All filter chips show their respective counts
3. All discounts are displayed in the table

### Selecting a Filter
1. User clicks on a filter chip (e.g., "Ongoing")
2. Chip becomes solid with appropriate color
3. Table updates to show only matching discounts
4. If no matches, shows helpful empty state with:
   - Descriptive message
   - "View All Discounts" button to reset filter

### Empty States

#### No Discounts at All
```
Icon: FiPercent
Title: "No Discounts Yet"
Message: "Create your first discount to attract more customers and boost sales"
Action: "Create Your First Discount" button
```

#### Filter Returns No Results
```
Title: "No [Filter Type] Discounts"
Message: Context-specific message based on filter
Action: "View All Discounts" button
```

## Use Cases & Examples

### Scenario 1: Daily Operations
**Task**: Check which discounts are active right now
**Action**: Click "Ongoing" filter
**Result**: See all currently running discounts

### Scenario 2: Planning Ahead
**Task**: Review upcoming promotional campaigns
**Action**: Click "Scheduled" filter
**Result**: See all discounts set to start in the future

### Scenario 3: Performance Review
**Task**: Analyze past discount performance
**Action**: Click "Expired" filter
**Result**: See all completed discounts, ready for stats review

### Scenario 4: Housekeeping
**Task**: Clean up or reactivate old discounts
**Action**: Click "Inactive" filter
**Result**: See all paused or disabled discounts

### Scenario 5: Quick Overview
**Task**: Get the big picture
**Action**: Click "All Discounts" filter (or page default)
**Result**: See every discount regardless of status

## Filter Count Examples

```typescript
// Example discount data
const exampleDiscounts = [
  {
    name: "Summer Sale",
    status: "active",
    start_datetime: "2025-06-01T00:00:00Z",
    end_datetime: "2025-08-31T23:59:59Z"
  }, // Ongoing (if current date is July 2025)
  
  {
    name: "Black Friday",
    status: "active",
    start_datetime: "2025-11-29T00:00:00Z",
    end_datetime: "2025-11-29T23:59:59Z"
  }, // Scheduled (if current date is October 2025)
  
  {
    name: "Spring Sale",
    status: "expired",
    start_datetime: "2025-03-01T00:00:00Z",
    end_datetime: "2025-05-31T23:59:59Z"
  }, // Expired
  
  {
    name: "Old Promo",
    status: "inactive",
    start_datetime: "2024-01-01T00:00:00Z",
    end_datetime: "2024-12-31T23:59:59Z"
  }, // Inactive
];

// Filter counts on October 1, 2025:
// All: 4
// Ongoing: 1 (Summer Sale - still running)
// Scheduled: 1 (Black Friday - coming up)
// Expired: 1 (Spring Sale - already ended)
// Inactive: 1 (Old Promo - manually disabled)
```

## Performance Optimization

### useMemo Hook
- Filtered discounts are memoized
- Only recalculates when `discounts` or `activeFilter` changes
- Prevents unnecessary re-renders

### Filter Count Caching
- Consider adding memoization if you have many discounts
- Currently recalculates on each render (acceptable for < 100 discounts)

## Accessibility

- **Keyboard Navigation**: Chips are focusable and clickable
- **Visual States**: Clear active/inactive states
- **Screen Readers**: Meaningful labels with counts

## Styling Details

### Active Chip
```css
variant: "solid"
color: [filter-specific-color]
```

### Inactive Chip
```css
variant: "outlined"
color: "neutral"
```

### Layout
```css
direction: "row"
spacing: 1
flexWrap: "wrap"
useFlexGap: true
```

## Future Enhancements

### Potential Additions
1. **Multi-select Filters**: Allow combining filters (e.g., Ongoing + Scheduled)
2. **Search Bar**: Text search within filtered results
3. **Sort Options**: Sort by name, date, usage, etc.
4. **Save Filter Preference**: Remember user's last selected filter
5. **URL Parameters**: Allow bookmarking specific filter views
6. **Date Range Filter**: Custom date range selection
7. **Quick Actions**: Bulk operations on filtered results
8. **Export**: Export filtered list to CSV/PDF

### Advanced Filters
- By discount type (percentage vs fixed)
- By discount value range
- By minimum order amount
- By product association
- By usage rate (high/low performers)

## Integration with Other Features

### With Statistics
- Filter to Ongoing → View Stats → Analyze current performance
- Filter to Expired → View Stats → Review past campaign success

### With Editing
- Filter to Scheduled → Edit → Adjust timing before launch
- Filter to Inactive → Edit → Reactivate old campaigns

### With Creation
- View filters to understand gaps
- Create new discounts to fill scheduling gaps

## Testing Checklist

- [ ] All filter shows correct count
- [ ] Ongoing filter shows only active discounts in date range
- [ ] Scheduled filter shows only future discounts
- [ ] Expired filter shows past and expired discounts
- [ ] Inactive filter shows paused and inactive discounts
- [ ] Clicking filters updates table correctly
- [ ] Empty states show appropriate messages
- [ ] Filter counts update after CRUD operations
- [ ] Visual feedback (solid/outlined) works
- [ ] Works with no discounts (shows create prompt)
- [ ] Works with filtered empty result
- [ ] Date logic handles edge cases (no end date, etc.)

## Code Location

**File**: `city-venture-web/src/features/business/shop/store/Discount.tsx`

**Key Sections**:
- Line ~45: Type definition and state
- Line ~93: `filteredDiscounts` useMemo
- Line ~134: `getFilterCount` function
- Line ~271: Filter chips UI
- Line ~330: Filtered empty state
- Line ~350: Table using filtered data

---

**Filter Feature Complete!** ✅

Users can now easily navigate and manage discounts based on their current state, making discount management more efficient and organized.
