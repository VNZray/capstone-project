# Business App

A modern business management platform built with React, MUI/Joy UI, and TypeScript.

## Project Structure

This project is organized into the following main folders:

### `src/components`
Reusable UI components such as headers, cards, buttons, and form elements used throughout the app.

### `src/context`
React Context providers for global state management (e.g., authentication, theme, notifications).

### `src/features`
Business logic and UI for core features (e.g., listing, reviews, bookings, profile management). Each feature is modular and self-contained.

### `src/hooks`
Custom React hooks for data fetching, form handling, and other reusable logic (e.g., `useAddress`, `useAuth`).

### `src/layout`
Layout components that define the overall page structure (e.g., navigation bars, sidebars, containers).

### `src/lib`
Third-party libraries, API clients, and utility wrappers.

### `src/pages`
Top-level pages mapped to routes.

### `src/routes`
Route definitions and navigation logic for the app.

### `src/services`
API service modules for interacting with backend endpoints (e.g., `AddressService`, `BusinessService`).

### `src/types`
TypeScript type definitions and interfaces for data models used across the app.

### `src/utils`
Utility functions for formatting, validation, and other helper logic.

---

## Getting Started

1. **Install dependencies:**  
   `npm install`

2. **Run the app:**  
   `npm start dev`


## Hans Login Updates
---

## Authentication

- Unified login page is available at `/login` with role selection for:
  - Tourist
  - Business Owner
  - Admin (Tourism)

- Business-specific login remains available at `/business/login`.

### How it works

1. All roles authenticate via `POST /api/users/login` (backend).
2. The app decodes the JWT to find the associated entity id (`tourist_id`, `owner_id`, or `tourism_id`).
3. It fetches profile details from the corresponding endpoint:
   - Tourist: `GET /api/tourist/:id`
   - Owner: `GET /api/owner/:id`
   - Tourism (Admin): `GET /api/tourism/:id`
4. The token and user profile are persisted in `localStorage`.

### Redirects after login

- Tourist → `/`
- Business Owner → `/business`
- Admin (Tourism) → `/tourism`
