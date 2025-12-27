/**
 * Business Policies and House Rules
 *
 * Represents the policies and house rules for a business,
 * including check-in/check-out times, guest policies, and terms.
 */
export interface BusinessPolicies {
	id?: string;
	business_id: string;

	// House Rules - Time-based rules
	check_in_time: string | null; // Format: 'HH:MM:SS' e.g., '14:00:00'
	check_out_time: string | null; // Format: 'HH:MM:SS' e.g., '11:00:00'
	quiet_hours_start: string | null; // Format: 'HH:MM:SS' e.g., '22:00:00'
	quiet_hours_end: string | null; // Format: 'HH:MM:SS' e.g., '07:00:00'

	// House Rules - Boolean flags
	pets_allowed: boolean;
	smoking_allowed: boolean;
	parties_allowed: boolean;
	children_allowed: boolean;
	visitors_allowed: boolean;

	// House Rules - Limits
	max_guests_per_room: number | null;
	minimum_age_requirement: number | null;

	// Policies - Text-based policies
	cancellation_policy: string | null;
	refund_policy: string | null;
	payment_policy: string | null;
	damage_policy: string | null;
	pet_policy: string | null;
	smoking_policy: string | null;

	// Additional house rules (custom rules)
	additional_rules: string[] | null;

	// Terms and conditions
	terms_and_conditions: string | null;
	privacy_policy: string | null;

	// Metadata
	is_active: boolean;
	version: number;
	created_at?: string;
	updated_at?: string;
}

/**
 * Payload for upserting business policies
 */
export type UpsertBusinessPoliciesPayload = Omit<
	BusinessPolicies,
	"id" | "business_id" | "is_active" | "version" | "created_at" | "updated_at"
>;

/**
 * Payload for updating house rules only
 */
export interface UpdateHouseRulesPayload {
	check_in_time?: string | null;
	check_out_time?: string | null;
	quiet_hours_start?: string | null;
	quiet_hours_end?: string | null;
	pets_allowed?: boolean;
	smoking_allowed?: boolean;
	parties_allowed?: boolean;
	children_allowed?: boolean;
	visitors_allowed?: boolean;
	max_guests_per_room?: number | null;
	minimum_age_requirement?: number | null;
	additional_rules?: string[] | null;
}

/**
 * Payload for updating policy texts only
 */
export interface UpdatePolicyTextsPayload {
	cancellation_policy?: string | null;
	refund_policy?: string | null;
	payment_policy?: string | null;
	damage_policy?: string | null;
	pet_policy?: string | null;
	smoking_policy?: string | null;
}

/**
 * Default business policies for new businesses
 */
export const defaultBusinessPolicies: BusinessPolicies = {
	business_id: "",
	check_in_time: "14:00:00",
	check_out_time: "11:00:00",
	quiet_hours_start: "22:00:00",
	quiet_hours_end: "07:00:00",
	pets_allowed: false,
	smoking_allowed: false,
	parties_allowed: false,
	children_allowed: true,
	visitors_allowed: true,
	max_guests_per_room: null,
	minimum_age_requirement: null,
	cancellation_policy: null,
	refund_policy: null,
	payment_policy: null,
	damage_policy: null,
	pet_policy: null,
	smoking_policy: null,
	additional_rules: null,
	terms_and_conditions: null,
	privacy_policy: null,
	is_active: true,
	version: 1,
};

/**
 * Helper to format time string for display (HH:MM)
 */
export function formatTimeForDisplay(time: string | null): string {
	if (!time) return "";
	// Handle both 'HH:MM:SS' and 'HH:MM' formats
	const parts = time.split(":");
	if (parts.length >= 2) {
		return `${parts[0]}:${parts[1]}`;
	}
	return time;
}

/**
 * Helper to convert 12-hour format to 24-hour format
 */
export function formatTimeFor24Hour(time: string | null): string {
	if (!time) return "";
	// If already in 24-hour format
	if (!time.toLowerCase().includes("am") && !time.toLowerCase().includes("pm")) {
		return time;
	}

	const [timePart, period] = time.split(" ");
	const [hours, minutes] = timePart.split(":");
	let hour = parseInt(hours, 10);

	if (period.toLowerCase() === "pm" && hour !== 12) {
		hour += 12;
	} else if (period.toLowerCase() === "am" && hour === 12) {
		hour = 0;
	}

	return `${hour.toString().padStart(2, "0")}:${minutes}:00`;
}

/**
 * Helper to convert 24-hour format to 12-hour display
 */
export function formatTimeFor12Hour(time: string | null): string {
	if (!time) return "";

	const parts = time.split(":");
	if (parts.length < 2) return time;

	let hour = parseInt(parts[0], 10);
	const minutes = parts[1];
	const period = hour >= 12 ? "PM" : "AM";

	if (hour > 12) hour -= 12;
	if (hour === 0) hour = 12;

	return `${hour}:${minutes} ${period}`;
}
