/**
 * API Base URL Configuration
 *
 * Supports both legacy /api and new /api/v1 routes.
 * The new backend uses versioned API routes.
 */

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Smart Dev Override:
// If we are on localhost, force the API to be localhost to ensure cookies work (SameSite policy).
// This fixes the issue where VITE_API_URL is set to an IP (for mobile) but we are testing on desktop localhost.
const getApiUrl = (base: string): string => {
  if (
    typeof window !== "undefined" &&
    window.location.hostname === "localhost" &&
    base.includes("://") &&
    !base.includes("localhost")
  ) {
    try {
      const url = new URL(base);
      // Keep the port and path, just swap hostname to localhost
      const localUrl = `${url.protocol}//localhost:${url.port}${url.pathname}`;
      console.debug(
        "[API] Switched to localhost for cookie compatibility:",
        localUrl
      );
      return localUrl;
    } catch {
      // Invalid URL, ignore
    }
  }
  return base;
};

// Base API URL (for legacy routes and auth refresh)
const api = getApiUrl(baseUrl);

// API v1 URL (for new backend routes)
export const apiV1 = api.endsWith("/api")
  ? `${api}/v1`
  : api.includes("/api/v1")
  ? api
  : `${api}/v1`;

export default api;
