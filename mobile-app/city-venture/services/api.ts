const api = process.env.EXPO_PUBLIC_API_URL;

// Debug: Log the API URL to help troubleshoot
if (__DEV__) {
  console.log('[API] Using API URL:', api);
}

export default api;
