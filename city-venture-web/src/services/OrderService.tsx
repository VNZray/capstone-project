import axios from "axios";
import api from "@/src/services/api";
import type { Order, OrderDetails, OrderStats, OrderStatus, PaymentStatus } from "@/src/types/Order";

// Configure axios to include Authorization header
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

interface OrderResponse<T = Order | null> {
  message?: string;
  data?: T | T[] | null;
}

function normalizeArrayResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    if (payload.length === 2 && Array.isArray(payload[0]) && typeof payload[1] === "object") {
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

function unwrapOrder(payload: unknown): Order | null {
  if (!payload) return null;

  if (Array.isArray(payload)) {
    for (const entry of payload) {
      const maybeOrder = unwrapOrder(entry);
      if (maybeOrder) return maybeOrder;
    }
    return null;
  }

  if (typeof payload === "object") {
    if ("id" in payload && "order_number" in payload) {
      return payload as Order;
    }

    const dataField = (payload as { data?: unknown }).data;
    if (dataField !== undefined) {
      return unwrapOrder(dataField);
    }
  }

  return null;
}

function unwrapOrderDetails(payload: unknown): OrderDetails | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const dataField = (payload as { data?: unknown }).data;
  if (dataField && typeof dataField === "object" && "items" in dataField) {
    const details = dataField as { items?: unknown };
    if (Array.isArray(details.items)) {
      return dataField as OrderDetails;
    }
  }

  if (Array.isArray(payload)) {
    for (const entry of payload) {
      const maybeDetails = unwrapOrderDetails(entry);
      if (maybeDetails) return maybeDetails;
    }
  }

  return null;
}

function isNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

// ==================== Fetchers ====================

export const fetchOrdersByBusinessId = async (businessId: string): Promise<Order[]> => {
  try {
    const { data } = await axios.get<Order[]>(`${api}/orders/business/${businessId}`);
    return normalizeArrayResponse<Order>(data);
  } catch (error) {
    if (isNotFound(error)) {
      return [];
    }
    throw error;
  }
};

export const fetchOrderById = async (orderId: string): Promise<OrderDetails | null> => {
  try {
    const { data } = await axios.get<OrderDetails>(`${api}/orders/${orderId}`);
    if (data && typeof data === "object" && "items" in data) {
      return data as OrderDetails;
    }
    return unwrapOrderDetails(data);
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }
    throw error;
  }
};

export const fetchOrderStatsByBusiness = async (
  businessId: string,
  periodInDays = 30
): Promise<OrderStats | null> => {
  try {
    const { data } = await axios.get<OrderStats>(
      `${api}/orders/business/${businessId}/stats`,
      {
        params: { period: periodInDays.toString() },
      }
    );

    if (data && typeof data === "object" && "overview" in data) {
      return data as OrderStats;
    }

    if (Array.isArray(data)) {
      const [overviewRows, dailyRows, productRows] = data as unknown[];
      const overview = Array.isArray(overviewRows) && overviewRows.length > 0
        ? (overviewRows[0] as OrderStats["overview"])
        : undefined;
      const daily_stats = Array.isArray(dailyRows)
        ? (dailyRows as OrderStats["daily_stats"])
        : [];
      const popular_products = Array.isArray(productRows)
        ? (productRows as OrderStats["popular_products"])
        : [];

      if (overview) {
        return {
          overview,
          daily_stats,
          popular_products,
        } as OrderStats;
      }
    }

    return null;
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }
    throw error;
  }
};

// ==================== Mutations ====================

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<Order | null> => {
  const { data } = await axios.patch<OrderResponse>(`${api}/orders/${orderId}/status`, {
    status,
  });
  return unwrapOrder(data);
};

export const updatePaymentStatus = async (
  orderId: string,
  payment_status: PaymentStatus
): Promise<Order | null> => {
  const { data } = await axios.patch<OrderResponse>(`${api}/orders/${orderId}/payment-status`, {
    payment_status,
  });
  return unwrapOrder(data);
};

export const cancelOrder = async (
  orderId: string,
  cancellation_reason?: string
): Promise<Order | null> => {
  const { data } = await axios.post<OrderResponse>(`${api}/orders/${orderId}/cancel`, {
    cancellation_reason,
  });
  return unwrapOrder(data);
};

export const markOrderAsReady = async (orderId: string): Promise<Order | null> => {
  const { data } = await axios.post<OrderResponse>(`${api}/orders/${orderId}/mark-ready`, {});
  return unwrapOrder(data);
};

export const markOrderAsPickedUp = async (orderId: string): Promise<Order | null> => {
  const { data } = await axios.post<OrderResponse>(`${api}/orders/${orderId}/mark-picked-up`, {});
  return unwrapOrder(data);
};

export const verifyArrivalCode = async (
  businessId: string,
  arrival_code: string
): Promise<Order | null> => {
  try {
    const { data } = await axios.post<OrderResponse>(
      `${api}/orders/business/${businessId}/verify-arrival`,
      { arrival_code }
    );
    return unwrapOrder(data);
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }
    throw error;
  }
};
