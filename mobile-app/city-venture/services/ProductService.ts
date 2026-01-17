import businessApiClient from '@/services/api/businessApiClient';
import type { Product, ProductCategory } from '@/types/Product';

/** Fetch Products by Business ID */
export const fetchProductsByBusinessId = async (
  businessId: string
): Promise<Product[]> => {
  const { data } = await businessApiClient.get<Product[]>(`/products/business/${businessId}`);
  return data;
};

/** Fetch Product Categories by Business ID */
export const fetchProductCategoriesByBusinessId = async (
  businessId: string
): Promise<ProductCategory[]> => {
  const { data } = await businessApiClient.get<ProductCategory[]>(
    `/product-categories/business/${businessId}`
  );
  return data;
};

/** Fetch Single Product */
export const fetchProductById = async (productId: string): Promise<Product> => {
  const { data } = await businessApiClient.get<Product>(`/products/${productId}`);
  return data;
};
