let api = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Smart Dev Override:
// If we are on localhost, force the API to be localhost to ensure cookies work (SameSite policy).
// This fixes the issue where VITE_API_URL is set to an IP (for mobile) but we are testing on desktop localhost.
if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && api.includes('://') && !api.includes('localhost')) {
    try {
        const url = new URL(api);
        // Keep the port and path, just swap hostname to localhost
        api = `${url.protocol}//localhost:${url.port}${url.pathname}`;
        console.debug('[API] Switched to localhost for cookie compatibility:', api);
    } catch (e) {
        // Invalid URL, ignore
    }
}

export default api;