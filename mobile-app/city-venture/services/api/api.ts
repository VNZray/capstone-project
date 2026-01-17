/**
 * API Configuration for City Venture Mobile App
 *
 * The mobile app uses 3 backend services:
 * 1. Mobile Backend (port 5000) - Booking, orders, payments, auth, notifications
 * 2. Business Backend (port 4000) - Accommodation, rooms, products, business data
 * 3. Tourism Backend (port 3000) - Events, tourist spots, emergency facilities
 */

// Get the base URL from environment (e.g., http://192.168.1.6)
const BASE_HOST = process.env.EXPO_PUBLIC_API_HOST || 'http://localhost';

// Individual backend URLs
export const MOBILE_API_URL = process.env.EXPO_PUBLIC_MOBILE_API_URL || `${BASE_HOST}:5000/api`;
export const BUSINESS_API_URL = process.env.EXPO_PUBLIC_BUSINESS_API_URL || `${BASE_HOST}:4000/api`;
export const TOURISM_API_URL = process.env.EXPO_PUBLIC_TOURISM_API_URL || `${BASE_HOST}:3000/api`;

// Legacy: Default API URL points to mobile backend for backward compatibility
const api = MOBILE_API_URL;

if (__DEV__) {
  console.log('[API Config]');
  console.log('  Mobile API:', MOBILE_API_URL);
  console.log('  Business API:', BUSINESS_API_URL);
  console.log('  Tourism API:', TOURISM_API_URL);
}

export default api;
