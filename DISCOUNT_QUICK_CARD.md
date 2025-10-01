# Discount Management - Quick Reference Card

## 🎯 Three-Tier Filtering System

### 1️⃣ TAB NAVIGATION (Status Filter)
```
[All] [Ongoing] [Scheduled] [Expired] [Inactive]
```
- **All** - Every discount
- **Ongoing** - Active & running now
- **Scheduled** - Starts in future
- **Expired** - Past end date
- **Inactive** - Paused/disabled

### 2️⃣ SEARCH BAR (Text Search)
```
🔍 Search by discount name or description...
```
- Real-time filtering
- Case-insensitive
- Searches name + description

### 3️⃣ TYPE FILTER (Discount Type)
```
📁 [Discount Type ▼]
```
- All Types
- Percentage (20% off)
- Fixed Amount ($10 off)

---

## ⚡ Quick Actions

| Action | Steps |
|--------|-------|
| **Create Discount** | Click "Create Discount" button → Fill form → Submit |
| **Edit Discount** | Find discount → Click ✏️ icon → Modify → Save |
| **Delete Discount** | Find discount → Click 🗑️ icon → Confirm |
| **View Stats** | Find discount → Click 📊 icon → See analytics |

---

## 🔍 Common Filter Combinations

### Find Active Sales
```
Tab: Ongoing
Search: "sale"
Type: All Types
```

### Review Past Fixed Discounts
```
Tab: Expired
Search: ""
Type: Fixed Amount
```

### Check Future Percentage Deals
```
Tab: Scheduled
Search: ""
Type: Percentage
```

### Find Specific Inactive Discount
```
Tab: Inactive
Search: "discount name"
Type: All Types
```

---

## 📊 Status Definitions

| Status | Meaning | Icon |
|--------|---------|------|
| **Ongoing** | Active + start ≤ now + (no end OR end ≥ now) | ✅ |
| **Scheduled** | Active + start > now | 📅 |
| **Expired** | Status = expired OR end < now | ⚠️ |
| **Inactive** | Status = inactive OR paused | ⏸️ |
| **All** | Every discount regardless of status | 📋 |

---

## 🎨 UI Layout

```
┌─────────────────────────────────────────────────────┐
│ Discount Management            [Create Discount]    │
├─────────────────────────────────────────────────────┤
│ [All] [Ongoing] [Scheduled] [Expired] [Inactive]   │← Tabs
├─────────────────────────────────────────────────────┤
│ [🔍 Search...........] [📁 Type ▼]                 │← Filters
├─────────────────────────────────────────────────────┤
│ Name    Type  Value  Period  Usage  Status  Actions│← Table
│ ────────────────────────────────────────────────────│
│ Summer  %     20%    Jun-Aug 45/100 Active  📊✏️🗑️│
└─────────────────────────────────────────────────────┘
```

---

## 💡 Pro Tips

1. **Use tabs** for broad categorization
2. **Use search** to find specific discounts
3. **Use type filter** for analysis by discount kind
4. **Combine all three** for precise filtering
5. **Watch the counts** in tabs for quick insights

---

## 🧪 Quick Test

### Test Filter Combination
1. ✅ Click "Ongoing" tab
2. ✅ Type "summer" in search
3. ✅ Select "Percentage" in type filter
4. ✅ Should show: Active summer percentage discounts

### Test Search
1. ✅ Clear all filters (click "All" tab)
2. ✅ Type discount name
3. ✅ Should see instant results

### Test Type Filter
1. ✅ Keep on "All" tab
2. ✅ Select "Fixed Amount"
3. ✅ Should show only $ discounts

---

## 📝 Discount Form Fields

### Required
- Name
- Discount Type (Percentage/Fixed)
- Discount Value
- Start Date

### Optional
- Description
- Min Order Amount
- Max Discount Amount (for %)
- End Date
- Usage Limit
- Per Customer Limit
- Applicable Products
- Status

---

## 🔗 Related Docs

- `DISCOUNT_MANAGEMENT_GUIDE.md` - Full guide
- `DISCOUNT_QUICK_REFERENCE.md` - API reference
- `DISCOUNT_TAB_NAVIGATION_GUIDE.md` - Tab navigation details
- `DISCOUNT_FINAL_SUMMARY.md` - Complete summary

---

## 🚀 Start Here

```bash
# Navigate to page
URL: /business/shop/store/discount

# First time?
1. Click "Create Discount"
2. Fill form
3. Submit
4. Try filters!
```

---

**Print this card and keep it handy!** 📄✨
