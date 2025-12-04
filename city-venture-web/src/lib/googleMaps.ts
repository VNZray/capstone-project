// Shared Google Maps configuration to prevent multiple loader instances
// This ensures the same options are used everywhere

export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

export const googleMapsLoaderOptions = {
  id: "google-maps-script",
  googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  libraries: ["places"] as ("places")[],
};
