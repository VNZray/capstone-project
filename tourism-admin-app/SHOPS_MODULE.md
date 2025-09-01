# Tourism Admin App – Shops Module Documentation

Status: Draft (MVP Planning)
Last Updated: 2025-09-01

## 1. Purpose
The Shops module ("Services > Shop") enables the Tourism admin to:
1. View all registered shops (businesses of type Shop / category Shop-related)
2. Filter, search, paginate, and inspect details
3. Create (register) new shops on behalf of applicants (or via an approval queue)
4. Edit existing shop records (with optional approval workflow if moving to moderated edits)
5. Manage status lifecycle: Pending → Active / Inactive / Maintenance
6. View related offers (placeholder `Offer.tsx`), and (future) amenities, location, pricing range, media
7. Provide auditability for changes (optional future: versioning / approvals similar to tourist spots)

## 2. Current Implementation Snapshot
| Area | State |
|------|-------|
| Route | `/services/shop` mapped to `features/services/shop/Shop.tsx` (placeholder) |
| Component Files | `Shop.tsx`, `Offer.tsx` – both just render a title |
| Shared Patterns | Tourist Spot feature has fully built list + filtering + details + form + approval flows – this is the reference pattern to reuse |
| API Layer | Low-level `apiService` supports tourist spots & approval; no typed service for shops/businesses yet |
| Types | No `Business` / `Shop` types defined in `types/` directory |
| Auth | Implemented globally via `AuthContext` + `AuthService` (JWT token stored in localStorage) |
| UI Toolkit | Custom components (`Text`, `Container`, etc.) & base CSS; MUI Joy present but not yet leveraged in current feature code |

## 3. Backend Mapping (Business / Shop)
Primary backend controller: `naga-venture-backend/controller/businessController.js`

### Exposed Routes (via `routes/business.js` → mounted under `/api/business`):
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/business` | List all businesses |
| POST | `/api/business` | Insert a business (expects many optional fields) |
| GET | `/api/business/:id` | Get business by ID |
| PUT | `/api/business/:id` | Partial update (only provided fields) |
| GET | `/api/business/owner/:id` | Get businesses by owner ID |
| DELETE | `/api/business/:id` | Delete business |

### Data Model Discrepancy
The SQL dump `tourism_db(1.1).sql` shows a `business` table with a *different* schema:
```
business(id, business_name, description, email, contact_number,
  business_category_id, business_type_id, province_id, municipality_id,
  barangay_id, owner_id, status, created_at)
```

The controller, however, expects additional columns (e.g. `phone_number`, `address`, `instagram_url`, `x_url`, `website_url`, `latitude`, `longitude`, `min_price`, `max_price`, `business_image`, `hasBooking`). These columns are **not** present in the dump.

Action: Align DB schema & migrations with controller expectations OR trim controller fields. Decide early to avoid persistent runtime errors (INSERT failures). For MVP, either:
1. Update DB (preferred if extended data needed), or
2. Refactor controller to only use existing columns (fast patch), and document planned schema evolution.

### Category / Type Clarification
`category` and `type` tables appear oriented toward Tourist Spots & Events (e.g. Museum, Concert, Resort). For Shops, we likely need either:
* Add new `category` rows (e.g., Souvenir, Food, Gear) & associate with a `type` representing Shop class, or
* Split business taxonomy into its own tables if semantics differ.

## 4. Target Frontend Data Types (Proposed)
Create `types/Business.ts`:
```ts
export interface Business {
  id: string;
  business_name: string;
  description?: string | null;
  email: string;
  contact_number: string; // or phone_number if schema unified
  business_category_id: number;
  business_type_id: number;
  province_id: number;
  municipality_id: number;
  barangay_id: number;
  owner_id: string;
  status: 'Pending' | 'Active' | 'Inactive' | 'Maintenance';
  created_at?: string;
  // Extended (conditional, depending on schema sync)
  address?: string | null;
  instagram_url?: string | null;
  x_url?: string | null;
  website_url?: string | null;
  facebook_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  min_price?: number | null;
  max_price?: number | null;
  business_image?: string | null;
  hasBooking?: boolean;
}
```

Add supporting types for enriched list views:
```ts
export interface BusinessListItem extends Business {
  category?: string; // joined
  type?: string;     // joined
  province?: string;
  municipality?: string;
  barangay?: string;
}
```

## 5. Functional Requirements (MVP Shops)
1. List & Pagination: Display paginated list of shops with columns (Name, Category/Type, Status, Location, Actions)
2. Search: Case-insensitive search on business name (client-side after fetch or server-side with query parameter `?q=`)
3. Filters: By status, category/type (dropdown chips similar to Tourist Spot `CategoryFilter`)
4. View Details: Rich panel or route showing full metadata & location map (reuse map input if lat/lng present)
5. Create Shop: Modal or full-page form (multi-step optional) with validation
6. Edit Shop: Pre-populate form, support partial update
7. Status Management: Toggle Active / Inactive / Maintenance (confirm dialogs)
8. Delete (Soft vs Hard): Backend currently performs hard delete; recommend soft delete (add `deleted_at`) – document decision
9. Offers (Roadmap): `Offer.tsx` placeholder – attach promotional items; backend support TBD
10. Approval Flow (Optional Phase 2): Mirror tourist spot edit approval using a `business_edits` table

## 6. UX / UI Patterns (Reuse Tourist Spot Module)
Borrow from `Spot.tsx`:
* Layout container with filter bar + search + add button
* Table component pattern (create `BusinessTable.tsx` similar to `TouristSpotTable.tsx`)
* Modal forms using shared `Input`, `Button`, `Loading` components
* Pagination reused (`components/touristSpot/Pagination.tsx`) – consider relocating to a generic `components/common/` folder

### Suggested Component Tree
```
features/services/shop/
  Shop.tsx              // orchestrator: state, fetch, filter
  components/
    BusinessTable.tsx
    BusinessForm.tsx
    BusinessDetails.tsx
    BusinessFilters.tsx (status + category/type)
  hooks/
    useBusinesses.ts    // data fetching (abstract API)
```

## 7. API Layer Additions
Extend `src/utils/api.ts` or create domain-specific service `services/BusinessService.ts` (mirroring `TourismService.tsx`).

Proposed minimal functions:
```ts
export const BusinessService = {
  list: (params?: { page?: number; pageSize?: number; q?: string; status?: string }) => {...},
  getById: (id: string) => {...},
  create: (payload: Partial<Business>) => {...},
  update: (id: string, patch: Partial<Business>) => {...},
  remove: (id: string) => {...},
};
```

If backend doesn’t yet support pagination & filtering, *frontend-simulate* then plan backend enhancements:
* Pagination: `SELECT ... LIMIT ? OFFSET ?`
* Search: `WHERE business_name LIKE CONCAT('%', ?, '%')`
* Filtering: Add optional `status`, `category_id`, `type_id` parameters

## 8. Approval & Moderation Strategy (Forward-Looking)
Tourist Spots use an edits shadow table (`tourist_spot_edits`). For Shops, replicate pattern:
1. New table: `business_edits` (fields matching superset of `business`)
2. Submission writes to edits table with status `pending`
3. Approval controller merges → updates canonical row, marks edit as `approved`
4. Rejection sets `approval_status = 'rejected'` with `remarks`
5. Frontend surfaces pending edits in Approval dashboard using shared API shape

## 9. Error Handling & Loading
Adopt consistent states:
```ts
type AsyncState<T> = { data: T; loading: boolean; error: string | null };
```
Show skeleton rows (optional) or existing loading spinner pattern used in Spot.

## 10. Validation Rules (Form)
| Field | Rule |
|-------|------|
| business_name | required, <= 50 chars |
| email | valid email, unique |
| contact_number | numeric + formatting (Philippines format) |
| business_category_id | required |
| business_type_id | required |
| province/municipality/barangay | required (cascading select) |
| status (on edit) | enum constraint |
| min_price/max_price | if provided: min ≤ max |

## 11. Security & Auth
* All Business endpoints should enforce admin (Tourism) role – currently no frontend auth header is added. Add an interceptor or supply `Authorization: Bearer <token>` once backend validates JWT.
* Sanitize all user-entered strings server-side to mitigate injection.

## 12. Performance Considerations
* Lazy load large lists (virtual scrolling) if > 500 entries
* Debounce search input (300ms)
* Memoize filtered list slices
* Consider moving to a data-fetching library (React Query) if complexity grows

## 13. Implementation Roadmap
Phase 0 – Schema Alignment
1. Decide on authoritative `business` schema & apply migration

Phase 1 – Read Only List
2. Add `Business` types
3. Implement `BusinessService.list` & `Shop.tsx` fetch logic
4. Build `BusinessTable` (sorting local, simple pagination)

Phase 2 – Create & Edit
5. Add `BusinessForm` (create) modal
6. Add edit flow & partial update
7. Add status filter & update actions

Phase 3 – Details & UX Polish
8. Add `BusinessDetails` view (panel or route)
9. Integrate location names (join or fetch once & map IDs → names)
10. Add search + debounced input

Phase 4 – Advanced
11. Introduce offers sub-feature scaffold
12. Add approval workflow (if required) – create `business_edits` table
13. File upload for business image (Supabase storage or local)

Phase 5 – Hardening
14. Add unit tests for services + component tests for table & form
15. Add error boundary around Shop module
16. Performance audit (React DevTools Profiler)

## 14. Testing Strategy
* Unit: API service (mock fetch)
* Component: Form validation (happy path + required fields), Table filtering & pagination
* Integration (future): Cypress e2e for create → edit → status toggle

## 15. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Schema drift between controller & DB | Runtime insert failures | Align migration early; add integration test hitting POST /business |
| Missing auth checks backend | Unauthorized modifications | Add JWT middleware on business routes |
| Hard delete irreversible | Data loss | Implement soft delete field `deleted_at` |
| Expanding scope (offers, amenities) delays MVP | Timeline slip | Lock MVP scope (list + CRUD + status) before extras |

## 16. Coding Conventions (Module)
* Filenames: `BusinessTable.tsx`, not `businessTable.tsx`
* Hooks prefix: `useBusinesses`
* Keep network logic out of components (service layer + hooks)
* Favor functional, memoized pure presentational components for rows

## 17. Next Immediate Actions (Concrete)
1. Create `types/Business.ts`
2. Implement `services/BusinessService.ts`
3. Replace placeholder `Shop.tsx` with fetch + table skeleton
4. Add basic list UI (Name | Category | Status | Actions)
5. Capture schema decision

---
Feel free to extend this document as the module evolves. This serves as the baseline blueprint for implementing the Shops feature to parity with (and leveraging patterns from) the existing Tourist Spot module.
