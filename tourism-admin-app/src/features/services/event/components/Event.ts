export interface Event {
  id?: string;
  name: string;
  date: string;
  categories?: { category: string }[];
  description?: string;
}