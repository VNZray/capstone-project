# Form Components Guide

This document describes the custom form components added to the project:

- `DateInput` – Modal calendar for single date or range selection with statuses & booked rooms.
- `Dropdown` – Reusable modal list selector (supports search & cascading usage).
- `FormTextInput` – Unified text entry field matching dropdown visual variants.

---
## DateInput

A centered modal calendar supporting `single` or `range` selection modes. It avoids timezone off-by-one errors by using **local date (midday) normalization** instead of `toISOString()`.

### Basic Usage (Single Mode)

```tsx
<DateInput
  mode="single"
  label="Birthdate"
  placeholder="Select date"
  disableFuture
  value={birthdate}
  onChange={setBirthdate}
/> 
```

### Range Selection

```tsx
const [range, setRange] = useState<{ start?: string; end?: string }>({});

<DateInput
  mode="range"
  label="Stay Dates"
  value={range}
  onChange={setRange}
  requireConfirmation
  selectionVariant="outlined"
  showAdjacentMonths
/> 
```

### Key Props

| Prop | Type | Mode | Description |
|------|------|------|-------------|
| `mode` | `"single" \| "range"` | both | Selection behavior. |
| `value` | `string` (single) or `{ start?: string; end?: string }` (range) | both | Controlled selected value(s) in `YYYY-MM-DD`. |
| `onChange` | `(val) => void` | both | Fired when user confirms (if `requireConfirmation`) or selects date. |
| `label` | `string` | both | Floating label / field label. |
| `placeholder` | `string` | both | Text when no selection. |
| `disableFuture` | `boolean` | both | Disallow selecting dates after today. |
| `minDate` / `maxDate` | `string` | both | Clamp selectable window. |
| `selectionVariant` | `"solid" \| "outlined" \| "soft"` | both | Visual style for selected cells. |
| `requireConfirmation` | `boolean` | both | Show footer with Cancel / Done; only commit on Done. |
| `showAdjacentMonths` | `boolean` | both | Render leading/trailing days for calendar grid completion. |
| `showStatusLegend` | `boolean` | range | Display legend for date statuses (auto-hidden in single mode). |
| `dateStatuses` | `Record<string, 'reserved' \| 'unavailable' \| 'occupied'>` | both | Map of date to status (disables blocked dates). |
| `bookedRoomsByDate` | `Record<string, Array<{ roomId: string; name: string }>>` | both | Shows booked rooms list (single) or aggregated (range). |
| `showBookedRooms` | `boolean` | both | Toggle booked rooms section. |
| `initialMonth` | `Date` | both | Month to display initially. |
| `onMonthChange` | `(date: Date) => void` | both | Notifies when visible month changes. |

### Status Behavior

- `reserved` – Orange indicator; not selectable.
- `unavailable` – Red indicator; not selectable.
- `occupied` – Secondary color background/dot; not selectable.
- In `single` mode status legend auto-hidden (can still style blocked dates).

### Navigation Enhancements (Single Mode)

- Tap month name to open month grid picker.
- Tap year to open scrollable descending year list (no future years). Selected/current year is auto-centered.
- Long-press navigation arrows to jump a full year.
- `Today` button quickly returns to current date.

### Timezone Safety

Internally dates are stored by constructing a local date at midday to avoid DST / UTC boundary shifts, then formatted to `YYYY-MM-DD` with a local formatter (not `toISOString`). If you manipulate dates externally, keep them as local date strings in this format.

### Example with Statuses & Bookings

```tsx
<DateInput
  mode="range"
  label="Reservation"
  value={stayDates}
  onChange={setStayDates}
  dateStatuses={statusMap} // e.g. { '2024-05-20': 'reserved', '2024-05-21': 'occupied' }
  bookedRoomsByDate={bookedRooms}
  showBookedRooms
  showAdjacentMonths
  requireConfirmation
/> 
```

---
## Dropdown

A press-to-open modal list. Supports searching, disabling items, and can be chained (e.g., Province → Municipality → Barangay).

### Basic Usage (Text Input)

```tsx
<Dropdown
  label="Province"
  placeholder="Select province"
  items={provinces}          // Array<{ label: string; value: string }>
  value={province}
  onChange={setProvince}
  searchable
/> 
```

### Chained Example (Pseudo)

```tsx
<Dropdown
  label="Province"
  items={provinces}
  value={province}
  onChange={(val) => { setProvince(val); setMunicipality(undefined); setBarangay(undefined); }}
/> 
<Dropdown
  label="Municipality"
  items={municipalitiesByProvince[province] || []}
  value={municipality}
  disabled={!province}
  onChange={(val) => { setMunicipality(val); setBarangay(undefined); }}
/> 
<Dropdown
  label="Barangay"
  items={barangaysByMunicipality[municipality] || []}
  value={barangay}
  disabled={!municipality}
  onChange={setBarangay}
/> 
```

### Notable Props (summarized)

| Prop | Type | Description |
|------|------|-------------|
| `items` | `Array<{ label: string; value: string }>` | Data list. |
| `value` | `string \| string[] \| undefined` | Current selection (single or multi). |
| `onChange` | `(val) => void` | Called with selected value(s). |
| `label` | `string` | Field label. |
| `placeholder` | `string` | Shown when empty. |
| `searchable` | `boolean` | Enable search input inside modal. |
| `multi` | `boolean` | Allow multiple selection (value becomes string[]). |
| `disabled` | `boolean` | Disable trigger. |
| `variant` | `"solid" \| "outlined" \| "soft"` | Visual style (matches TextInput). |

---
## FormTextInput

Styled text input consistent with `Dropdown` & `DateInput` variants.

### Basic Usage

```tsx
<FormTextInput
  label="First Name"
  placeholder="Enter first name"
  value={firstName}
  onChangeText={setFirstName}
/> 
```

### With Helper & Error

```tsx
<FormTextInput
  label="Password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
  helperText="Minimum 8 characters"
  error={passwordTooShort}
  errorText="Password too short"
/> 
```

### Key Props (Text Input)

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Field label. |
| `value` | `string` | Controlled value. |
| `defaultValue` | `string` | Uncontrolled initial value. |
| `onChangeText` | `(text: string) => void` | Text change handler. |
| `placeholder` | `string` | Placeholder text. |
| `variant` | `"solid" \| "outlined" \| "soft"` | Visual style. |
| `size` | `"sm" \| "md" \| "lg"` | Field height & text sizing. |
| `helperText` | `string` | Subtle guidance text. |
| `error` | `boolean` | Switches to error colors. |
| `errorText` | `string` | Displays error message (overrides helper color). |
| `left` / `right` | `ReactNode` | Inline adornments (icons). |
| `clearable` | `boolean` | Shows clear (X) icon when not empty. |
| `onClear` | `() => void` | Called before internal clear to allow side-effects. |
| `style` | `StyleProp<ViewStyle>` | Container override. |
| `inputStyle` | `StyleProp<TextStyle>` | Text input override. |

### Clear Behavior

If `clearable` is true, a small clear icon appears when there is content. Pressing it:

1. Calls `onClear` (if provided).
2. Empties the internal text (if controlled you must clear via `value`).

### Variants & Elevation

- `solid`: Filled background, subtle elevation.
- `outlined`: Transparent background, border emphasis.
- `soft`: Very light background with border.

### Layout Tips

When placing multiple inputs in a row, wrap them in a flex container with `flexWrap: 'wrap'` and give each a flex value to allow wrapping (as done for first/middle/last names in `Register`).

---
 
## Design Consistency Notes

- All three components share variant names (`solid`, `outlined`, `soft`) for visual cohesion.
- Spacing & border radii should remain aligned; avoid introducing ad-hoc styles externally—prefer extending component props first.
- Keep date strings as `YYYY-MM-DD` (local) for predictable comparisons.

## Future Enhancements (Optional Ideas)

- Add form-level validation summary.
- Integrate a reusable `FormField` wrapper to standardize label + error layout.
- Add keyboard navigation & accessibility improvements for calendar.
- Expose a `renderDay` prop for custom day cell rendering.

---

## Changelog (Excerpt)

- Added modal-only `DateInput` with range + statuses + booked rooms.
- Added descending scroll year picker (no future years) & quick nav (Today, long-press year jump).
- Implemented timezone-safe local date formatting.
- Replaced legacy location pickers with `Dropdown`.
- Added `FormTextInput` and standardized form input styling.
- Fixed name input row layout (wrap & flex adjustments).

## Questions / Maintenance

If you extend these components, update this guide to reflect new props or behavior to keep onboarding smooth.
