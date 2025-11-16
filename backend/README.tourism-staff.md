# Tourism Staff Management API

Admin-only APIs to manage Tourism Office staff accounts (distinct from business owner staff).

Base path: /api/tourism-staff

Auth: Bearer JWT required. Permission: manage_users or manage_tourism_staff.

Endpoints:
- GET /             List tourism staff (joins tourism + user + role)
- GET /:id          Get a tourism staff by tourism_id
- POST /            Create user + tourism profile in a transaction
- PUT /:id          Update user and tourism profile
- PATCH /:id/status Update account status (is_active / is_verified)
- POST /:id/reset-password  Generate a temporary password (returned in response)

Payloads:
- POST /
  {
    email: string, phone_number: string,
    first_name: string, middle_name?: string, last_name: string, position?: string,
    user_role_id?: number, role_name?: string,
    is_verified?: boolean, is_active?: boolean, barangay_id?: number,
    password?: string // optional; if omitted a 12-char temporary password is generated
  }

Notes:
- Uses stored procedures InsertUser/UpdateUser and InsertTourism/UpdateTourism.
- Temporary passwords are returned in the response to be delivered out-of-band.
- Seeds add permission `manage_tourism_staff` and assign it to Admin/Tourism Officer.

Seeding (one-time, from backend folder):
- Ensure permissions and role permissions seeds have run:
  - 07_permission.cjs
  - 08_role_permissions.cjs