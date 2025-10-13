export * from './TouristSpot';
export * from './Report';
export * from './Order';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
