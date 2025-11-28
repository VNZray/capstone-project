import apiClient from "./apiClient";
import type {
	BusinessSettings,
	UpsertBusinessSettingsPayload,
} from "@/src/types/BusinessSettings";
import { defaultBusinessSettings } from "@/src/types/BusinessSettings";

type UnknownRecord = Record<string, unknown>;

function looksLikeBusinessSettings(payload: unknown): payload is BusinessSettings {
	if (!payload || typeof payload !== "object") {
		return false;
	}

	const record = payload as UnknownRecord;
	return (
		"minimum_preparation_time_minutes" in record &&
		"order_advance_notice_hours" in record &&
		"accepts_product_orders" in record &&
		"accepts_service_bookings" in record
	);
}

function normalizeBusinessSettingsResponse(data: unknown): BusinessSettings | null {
	if (!data) return null;

	if (Array.isArray(data)) {
		if (data.length === 0) return null;
		for (const item of data) {
			const normalized = normalizeBusinessSettingsResponse(item);
			if (normalized) return normalized;
		}
		return null;
	}

	if (typeof data === "object") {
		const record = data as UnknownRecord;
		if (looksLikeBusinessSettings(record)) {
			return record as BusinessSettings;
		}
		if ("data" in record) {
			return normalizeBusinessSettingsResponse(record.data);
		}
		if ("rows" in record) {
			return normalizeBusinessSettingsResponse(record.rows);
		}
	}

	return null;
}

function mergeWithDefaults(
	businessId: string,
	settings: BusinessSettings | null
): BusinessSettings {
	return {
		...defaultBusinessSettings,
		business_id: businessId,
		...(settings ?? {}),
	};
}

export const fetchBusinessSettings = async (
	businessId: string
): Promise<BusinessSettings> => {
	const { data } = await apiClient.get(`/business-settings/${businessId}`);
	const normalized = normalizeBusinessSettingsResponse(data);
	return mergeWithDefaults(businessId, normalized);
};

export const upsertBusinessSettings = async (
	businessId: string,
	payload: UpsertBusinessSettingsPayload
): Promise<BusinessSettings> => {
	const { data } = await apiClient.put(`/business-settings/${businessId}`, payload);
	const responsePayload =
		typeof data === "object" && data !== null && "data" in (data as UnknownRecord)
			? (data as UnknownRecord).data
			: data;

	const normalized = normalizeBusinessSettingsResponse(responsePayload);
	return mergeWithDefaults(businessId, normalized);
};
