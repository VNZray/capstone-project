/**
 * API Base URL Configuration
 * Uses EXPO_PUBLIC_API_URL from environment, with localhost fallback for development.
 * Run update-ip.ps1 to update the .env file with your local IP address.
 */
const api = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export default api;
