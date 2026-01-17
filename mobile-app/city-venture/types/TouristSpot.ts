import type { EntityCategory } from './Category';

export type TouristSpot = {
	id: string;
	name: string;
	description: string;
	// Address computed directly from barangay joins
	barangay_id?: number | null;
	municipality_id?: number | null;
	province_id?: number | null;
	barangay?: string | null;
	municipality?: string | null;
	province?: string | null;
	address_details?: TouristSpotAddressDetails | null;
	latitude?: string | null;
	longitude?: string | null;
	contact_phone?: string | null;
	contact_email?: string | null;
	website?: string | null;
	entry_fee?: string | null;
	spot_status: string;
	is_featured?: boolean | number;
	created_at?: string;
	updated_at?: string;
	categories?: EntityCategory[];
	images?: TouristSpotImage[];
};

export type TouristSpotAddressDetails = {
	province_id?: number | null;
	municipality_id?: number | null;
	barangay_id?: number | null;
	province?: string | null;
	municipality?: string | null;
	barangay?: string | null;
};

export type TouristSpotCategory = {
	id: number;
	title: string;
	alias: string;
	parent_category?: number | null;
	tourist_spot_id?: string;
};

export type TouristSpotImage = {
	id: string;
	tourist_spot_id: string;
	file_url: string;
	file_format: string;
	file_size?: number | null;
	is_primary?: boolean | number;
	alt_text?: string | null;
	uploaded_at?: string;
	updated_at?: string;
};

export type TouristSpotSchedule = {
	id?: string;
	tourist_spot_id?: string;
	day_of_week: number; // 0-6
	open_time?: string | null;
	close_time?: string | null;
	is_closed?: boolean | number;
	created_at?: string;
	updated_at?: string;
};

export type TouristSpotType = {
	id: number;
	type: string;
};

export type TouristSpotCoreCreate = {
	name: string;
	description: string;
	barangay_id: number;
	latitude?: string | null;
	longitude?: string | null;
	contact_phone?: string | null;
	contact_email?: string | null;
	website?: string | null;
	entry_fee?: string | null;
	category_ids: number[];
	schedules?: TouristSpotSchedule[];
};

export type TouristSpotEditRequest = Partial<Omit<TouristSpotCoreCreate, 'category_ids'>> & {
	id: string;
	category_ids?: number[];
	spot_status?: string;
	is_featured?: boolean;
};

export type TouristSpotCategoriesAndTypes = {
	types: TouristSpotType[];
	categories: TouristSpotCategory[];
};

export type TouristSpotLocationData = {
	provinces: { id: number; province: string }[];
	municipalities: { id: number; municipality: string; province_id: number }[];
	barangays: { id: number; barangay: string; municipality_id: number }[];
};

export type TouristSpotsResponse = TouristSpot[];
