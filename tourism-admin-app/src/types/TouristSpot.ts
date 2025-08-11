export interface TouristSpot {
  id: string;
  name: string;
  description: string;
  opening_hour: string;
  closing_hour: string;
  category: string;
  type: string;
  category_id: number;
  type_id: number;
}

export interface Category {
  id: number;
  category: string;
}

export interface Type {
  id: number;
  type: string;
  category_id: number;
}
