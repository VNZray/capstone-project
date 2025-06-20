export type Barangay = string;

export type City = {
  name: string;
  barangays: Barangay[];
  postal_code: number;
};

export type Province = {
  name: string;
  cities: City[];
};
