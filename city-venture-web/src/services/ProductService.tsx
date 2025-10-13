import axios from 'axios';
import api from '@/src/services/api';
import type {
  Product,
  ProductCategory,
  ProductStock,
  StockHistory,
  CreateProductPayload,
  UpdateProductPayload,
  UpdateStockPayload,
  CreateCategoryPayload,
} from '@/src/types/Product';

function normalizeArrayResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    if (payload.length === 2 && Array.isArray(payload[0]) && typeof payload[1] === 'object') {
      return normalizeArrayResponse<T>(payload[0]);
    }
    return payload as T[];
  }

  if (payload && typeof payload === 'object') {
    const dataField = (payload as { data?: unknown }).data;
    if (Array.isArray(dataField)) {
      return normalizeArrayResponse<T>(dataField);
    }
    if (dataField && typeof dataField === 'object') {
      const rows = (dataField as { rows?: unknown }).rows;
      if (Array.isArray(rows)) {
        return normalizeArrayResponse<T>(rows);
      }
    }
  }

  return [] as T[];
}

// ==================== PRODUCT CATEGORIES ====================

/** Get all product categories */
export const fetchAllProductCategories = async (): Promise<ProductCategory[]> => {
  const { data } = await axios.get<ProductCategory[]>(`${api}/products/categories`);
  return normalizeArrayResponse<ProductCategory>(data);
};

/** Get product categories by business ID */
export const fetchProductCategoriesByBusinessId = async (
  businessId: string
): Promise<ProductCategory[]> => {
  const { data } = await axios.get<ProductCategory[]>(
    `${api}/products/categories/business/${businessId}`
  );
  return normalizeArrayResponse<ProductCategory>(data);
};

/** Get product category by ID */
export const fetchProductCategoryById = async (
  categoryId: string
): Promise<ProductCategory> => {
  const { data } = await axios.get<ProductCategory>(
    `${api}/products/categories/${categoryId}`
  );
  return (data as { data?: ProductCategory }).data ?? data;
};

/** Create product category */
export const createProductCategory = async (
  payload: CreateCategoryPayload
): Promise<ProductCategory> => {
  const { data } = await axios.post<{ message: string; data: ProductCategory }>(
    `${api}/products/categories`,
    payload
  );
  return data.data;
};

/** Update product category */
export const updateProductCategory = async (
  categoryId: string,
  payload: Partial<CreateCategoryPayload>
): Promise<ProductCategory> => {
  const { data } = await axios.put<{ message: string; data: ProductCategory }>(
    `${api}/products/categories/${categoryId}`,
    payload
  );
  return data.data;
};

/** Delete product category */
export const deleteProductCategory = async (categoryId: string): Promise<void> => {
  await axios.delete(`${api}/products/categories/${categoryId}`);
};

// ==================== PRODUCTS ====================

/** Get all products */
export const fetchAllProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get<Product[]>(`${api}/products`);
  return normalizeArrayResponse<Product>(data);
};

/** Get products by business ID */
export const fetchProductsByBusinessId = async (
  businessId: string
): Promise<Product[]> => {
  const { data } = await axios.get<Product[]>(`${api}/products/business/${businessId}`);
  return normalizeArrayResponse<Product>(data);
};

/** Get products by category ID */
export const fetchProductsByCategoryId = async (
  categoryId: string
): Promise<Product[]> => {
  const { data } = await axios.get<Product[]>(`${api}/products/category/${categoryId}`);
  return normalizeArrayResponse<Product>(data);
};

/** Get product by ID */
export const fetchProductById = async (productId: string): Promise<Product> => {
  const { data } = await axios.get<Product>(`${api}/products/${productId}`);
  return (data as { data?: Product }).data ?? data;
};

/** Create product */
export const createProduct = async (
  payload: CreateProductPayload
): Promise<Product> => {
  const { data } = await axios.post<{ message: string; data: Product }>(
    `${api}/products`,
    payload
  );
  return data.data;
};

/** Update product */
export const updateProduct = async (
  productId: string,
  payload: UpdateProductPayload
): Promise<Product> => {
  const { data } = await axios.put<{ message: string; data: Product }>(
    `${api}/products/${productId}`,
    payload
  );
  return data.data;
};

/** Delete product */
export const deleteProduct = async (productId: string): Promise<void> => {
  await axios.delete(`${api}/products/${productId}`);
};

// ==================== STOCK MANAGEMENT ====================

/** Get product stock */
export const fetchProductStock = async (
  productId: string
): Promise<ProductStock> => {
  const { data } = await axios.get<ProductStock>(`${api}/products/${productId}/stock`);
  return data;
};

/** Update product stock */
export const updateProductStock = async (
  productId: string,
  payload: UpdateStockPayload
): Promise<ProductStock> => {
  const { data } = await axios.put<{ message: string; data: ProductStock }>(
    `${api}/products/${productId}/stock`,
    payload
  );
  return data.data;
};

/** Get stock history */
export const fetchProductStockHistory = async (
  productId: string
): Promise<StockHistory[]> => {
  const { data } = await axios.get<StockHistory[]>(
    `${api}/products/${productId}/stock/history`
  );
  return data;
};
