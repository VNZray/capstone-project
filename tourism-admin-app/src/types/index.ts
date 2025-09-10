export * from './TouristSpot';
export * from './Report';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
