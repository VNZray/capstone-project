export interface BusinessSettings {
	id?: string;
	business_id: string;
	minimum_preparation_time_minutes: number;
	order_advance_notice_hours: number;
	accepts_product_orders: boolean;
	accepts_service_bookings: boolean;
	cancellation_deadline_hours: number | null;
	cancellation_penalty_percentage: number;
	cancellation_penalty_fixed: number;
	allow_customer_cancellation: boolean;
	service_booking_advance_notice_hours: number;
	service_default_duration_minutes: number;
	auto_confirm_orders: boolean;
	auto_confirm_bookings: boolean;
	send_notifications: boolean;
	created_at?: string;
	updated_at?: string;
}

export type UpsertBusinessSettingsPayload = Omit<
	BusinessSettings,
	"id" | "business_id" | "created_at" | "updated_at"
>;

export const defaultBusinessSettings: BusinessSettings = {
	business_id: "",
	minimum_preparation_time_minutes: 30,
	order_advance_notice_hours: 0,
	accepts_product_orders: true,
	accepts_service_bookings: true,
	cancellation_deadline_hours: null,
	cancellation_penalty_percentage: 0,
	cancellation_penalty_fixed: 0,
	allow_customer_cancellation: true,
	service_booking_advance_notice_hours: 0,
	service_default_duration_minutes: 60,
	auto_confirm_orders: false,
	auto_confirm_bookings: false,
	send_notifications: true,
};
