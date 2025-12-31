import apiClient from "./apiClient";
import type {
  Product,
  ProductStock,
  StockHistory,
  CreateProductPayload,
  UpdateProductPayload,
  UpdateStockPayload,
} from "@/src/types/Product";

function normalizeArrayResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    if (
      payload.length === 2 &&
      Array.isArray(payload[0]) &&
      typeof payload[1] === "object"
    ) {
      return normalizeArrayResponse<T>(payload[0]);
    }
    return payload as T[];
  }

  if (payload && typeof payload === "object") {
    const dataField = (payload as { data?: unknown }).data;
    if (Array.isArray(dataField)) {
      return normalizeArrayResponse<T>(dataField);
    }
    if (dataField && typeof dataField === "object") {
      const rows = (dataField as { rows?: unknown }).rows;
      if (Array.isArray(rows)) {
        return normalizeArrayResponse<T>(rows);
      }
    }
  }

  return [] as T[];
}

// ==================== PRODUCTS ====================

/** Get all products */
export const fetchAllProducts = async (): Promise<Product[]> => {
  const { data } = await apiClient.get<Product[]>(`/products`);
  return normalizeArrayResponse<Product>(data);
};

/** Get products by business ID */
export const fetchProductsByBusinessId = async (
  businessId: string
): Promise<Product[]> => {
  const { data } = await apiClient.get<Product[]>(
    `/products/business/${businessId}`
  );
  return normalizeArrayResponse<Product>(data);
};

/** Get products by category ID */
export const fetchProductsByCategoryId = async (
  categoryId: string
): Promise<Product[]> => {
  const { data } = await apiClient.get<Product[]>(
    `/products/category/${categoryId}`
  );
  return normalizeArrayResponse<Product>(data);
};

/** Get product by ID */
export const fetchProductById = async (productId: string): Promise<Product> => {
  const { data } = await apiClient.get<Product>(`/products/${productId}`);
  return (data as { data?: Product }).data ?? data;
};

/** Create product */
export const createProduct = async (
  payload: CreateProductPayload
): Promise<Product> => {
  const { data } = await apiClient.post<{ message: string; data: Product }>(
    `/products`,
    payload
  );
  return data.data;
};

/** Update product */
export const updateProduct = async (
  productId: string,
  payload: UpdateProductPayload
): Promise<Product> => {
  const { data } = await apiClient.patch<{ message: string; data: Product }>(
    `/products/${productId}`,
    payload
  );
  return data.data ?? (data as unknown as Product);
};

/** Delete product */
export const deleteProduct = async (productId: string): Promise<void> => {
  await apiClient.delete(`/products/${productId}`);
};

// ==================== STOCK MANAGEMENT ====================

/** Get product stock */
export const fetchProductStock = async (
  productId: string
): Promise<ProductStock> => {
  const { data } = await apiClient.get<ProductStock>(
    `/products/${productId}/stock`
  );
  return data;
};

/** Update product stock */
export const updateProductStock = async (
  productId: string,
  payload: UpdateStockPayload
): Promise<ProductStock> => {
  const { data } = await apiClient.patch<{
    message: string;
    data: ProductStock;
  }>(`/products/${productId}/stock`, payload);
  return data.data ?? (data as unknown as ProductStock);
};

/** Get stock history */
export const fetchProductStockHistory = async (
  productId: string
): Promise<StockHistory[]> => {
  const { data } = await apiClient.get<StockHistory[]>(
    `/products/${productId}/stock/history`
  );
  return data;
};
