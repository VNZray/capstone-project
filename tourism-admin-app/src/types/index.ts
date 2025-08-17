export * from './TouristSpot';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
