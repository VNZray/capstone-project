export * from './TouristSpot';
export * from './Report';
export * from './Order';
export * from './BusinessPolicies';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
