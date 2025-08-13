# TouristSpotForm Component & Generalized Approval System

A generalized form component for managing tourist spots that can handle both adding new spots and editing existing ones, with a comprehensive approval workflow that supports all content types.

## Features

- **Dual Mode**: Supports both 'add' and 'edit' modes
- **Form Validation**: Built-in validation for required fields
- **Location Hierarchy**: Dynamic province/municipality/barangay selection
- **Responsive Design**: Works on both desktop and mobile devices
- **Type Safety**: Full TypeScript support
- **Generalized Approval Workflow**: All content types require admin approval before going live

## Supported Content Types

The approval system now handles:
- **Tourist Spots** (📍) - Primary focus with edit request support
- **Businesses** (🏢) - Business listings and updates
- **Events** (📅) - Event submissions and modifications
- **Accommodations** (🛏️) - Accommodation listings and changes

## Approval Workflow

### New Content Submissions
1. User submits new content via form
2. Content is created with status = 'pending'
3. Admin reviews in approval dashboard
4. Admin approves → status = 'active'

### Edit Requests (Tourist Spots Only)
1. User submits edit request via form
2. Edit data is stored in `tourist_spot_edits` table with `approval_status = 'pending'`
3. Admin reviews edit request in approval dashboard
4. Admin approves → Applied to main table
5. Admin rejects → Marked as rejected (kept for audit)

## Props

```typescript
interface TouristSpotFormProps {
  isVisible: boolean;           // Controls modal visibility
  onClose: () => void;         // Callback when modal is closed
  onSpotAdded?: () => void;    // Callback when spot is successfully added
  onSpotUpdated?: () => void;  // Callback when edit request is submitted
  mode: 'add' | 'edit';        // Form mode - 'add' for new spots, 'edit' for existing
  initialData?: TouristSpot;    // Required for edit mode - the spot data to edit
}
```

## Usage Examples

### Adding a New Tourist Spot

```tsx
import TouristSpotForm from '../components/touristSpot/TouristSpotForm';

const AddSpotExample = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSpotAdded = () => {
    // Refresh your data or show success message
    console.log('Spot added successfully!');
  };

  return (
    <div>
      <button onClick={() => setIsModalVisible(true)}>
        Add New Spot
      </button>

      <TouristSpotForm
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSpotAdded={handleSpotAdded}
        mode="add"
      />
    </div>
  );
};
```

### Editing an Existing Tourist Spot

```tsx
import TouristSpotForm from '../components/touristSpot/TouristSpotForm';
import type { TouristSpot } from '../types/TouristSpot';

const EditSpotExample = ({ spot }: { spot: TouristSpot }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSpotUpdated = () => {
    // Refresh your data or show success message
    console.log('Edit request submitted successfully!');
  };

  return (
    <div>
      <button onClick={() => setIsModalVisible(true)}>
        Edit {spot.name}
      </button>

      <TouristSpotForm
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSpotUpdated={handleSpotUpdated}
        mode="edit"
        initialData={spot}
      />
    </div>
  );
};
```

## Generalized Approval Dashboard

The `ApprovalDashboard` component provides admins with a comprehensive interface to manage all pending approvals across all content types:

```tsx
import ApprovalDashboard from '../components/touristSpot/ApprovalDashboard';

const AdminPanel = () => {
  return (
    <div>
      <h1>Admin Panel</h1>
      <ApprovalDashboard />
    </div>
  );
};
```

### Dashboard Features
- **Overview Tab**: Quick view of all pending items across all content types
- **Content Type Tabs**: Dedicated tabs for each content type (spots, businesses, events, accommodations)
- **Edit Requests Tab**: Manage tourist spot edit requests
- **Statistics Overview**: Shows counts of pending items for each content type
- **Quick Actions**: Approve/reject buttons for each item
- **Real-time Updates**: Automatically refreshes data after actions

### Dashboard Tabs
1. **Overview** - Bird's eye view of all pending content
2. **Tourist Spots** - Manage pending tourist spot submissions
3. **Businesses** - Manage pending business submissions
4. **Events** - Manage pending event submissions
5. **Accommodations** - Manage pending accommodation submissions
6. **Edit Requests** - Manage tourist spot edit requests

## Form Fields

The form includes the following fields:

### Required Fields
- **Name**: Tourist spot name
- **Description**: Detailed description
- **Province**: Location province
- **Municipality**: Location municipality (filtered by province)
- **Barangay**: Location barangay (filtered by municipality)
- **Contact Phone**: Contact phone number
- **Type**: Tourist spot type/category

### Optional Fields
- **Latitude**: GPS latitude coordinate
- **Longitude**: GPS longitude coordinate
- **Contact Email**: Contact email address
- **Website**: Website URL
- **Entry Fee**: Entry fee amount in Philippine Peso (₱)

## Backend Integration

The component integrates with the following API endpoints:

### Tourist Spots
- **GET** `/api/tourist-spots/categories-types` - Fetch categories and types
- **GET** `/api/tourist-spots/location-data` - Fetch location data (provinces, municipalities, barangays)
- **POST** `/api/tourist-spots` - Create new tourist spot
- **PUT** `/api/tourist-spots/:id` - Submit edit request

### Generalized Approval System
- **GET** `/api/approval/stats` - Get approval statistics for all content types
- **GET** `/api/approval/pending/:contentType` - Get pending items for specific content type
- **PUT** `/api/approval/approve/:contentType/:id` - Approve item for specific content type

### Tourist Spot Specific Endpoints
- **GET** `/api/approval/pending-edits` - Get pending edit requests
- **PUT** `/api/approval/approve-edit/:id` - Approve edit request
- **PUT** `/api/approval/reject-edit/:id` - Reject edit request

### Backward Compatibility Endpoints
- **GET** `/api/approval/pending-spots` - Get pending tourist spots
- **PUT** `/api/approval/approve-spot/:id` - Approve tourist spot

## Database Schema

### Main Tables
- **`tourist_spots`** - Stores approved and active tourist spots
- **`business`** - Stores approved and active businesses
- **`event`** - Stores approved and active events
- **`accommodation`** - Stores approved and active accommodations

### Edit Table
- **`tourist_spot_edits`** - Stores all edit requests for tourist spots
- **`approval_status`** can be 'pending', 'approved', or 'rejected'
- **Approved edits** are applied to main table and marked as approved

### Status Fields
Each content type has its own status field:
- Tourist Spots: `spot_status`
- Businesses: `business_status`
- Events: `event_status`
- Accommodations: `accommodation_status`

## Styling

The component uses CSS classes that can be customized:

- `.modal-overlay` - Modal background overlay
- `.modal-content` - Modal content container
- `.form` - Form styling
- `.form-group` - Individual form field groups
- `.form-input`, `.form-select`, `.form-textarea` - Input field styles
- `.submit-button`, `.cancel-button` - Button styles

### Approval Dashboard Styles
- `.approval-dashboard` - Main dashboard container
- `.stats-container` - Statistics cards layout
- `.overview-grid` - Overview cards grid layout
- `.overview-card` - Individual overview cards
- `.tab-navigation` - Tab switching interface
- `.item-row`, `.edit-item` - Individual approval items
- `.approve-button`, `.reject-button` - Action buttons

## Error Handling

The component includes built-in error handling:

- Form validation for required fields
- API error handling with user-friendly messages
- Loading states during form submission
- Success/error alerts
- Duplicate edit request prevention
- UUID validation and handling

## Dependencies

- React 18+
- TypeScript
- React Icons (IoClose)
- Custom Text component
- API service for backend communication

## Security Features

- All changes require admin approval
- Edit requests are stored separately from main data
- Prevents duplicate pending edit requests
- Maintains complete audit trail
- UUID-based security for all operations
- No direct updates to live data

## UUID Handling

The system properly handles UUIDs for all operations:
- All database IDs use UUID format
- API endpoints properly validate UUID parameters
- Frontend components handle UUID strings correctly
- Database queries use proper UUID parameter binding
