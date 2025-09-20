export type TouristSpot = {
	id: string;
	name: string;
	description: string;
	address_id: number;
	latitude?: string | null;
	longitude?: string | null;
	contact_phone?: string | null;
	contact_email?: string | null;
	website?: string | null;
	entry_fee?: string | null;
	spot_status: string;
	is_featured?: boolean | number;
	type_id: number;
	created_at?: string;
	updated_at?: string;
	province_id?: number;
	municipality_id?: number;
	barangay_id?: number;
	province_name?: string;
	municipality_name?: string;
	barangay_name?: string;
	categories?: TouristSpotCategory[];
	images?: TouristSpotImage[];
};

export type TouristSpotCategory = {
	id: number;
	category: string;
	type_id: number;
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
	province_id: number;
	municipality_id: number;
	barangay_id: number;
	latitude?: string | null;
	longitude?: string | null;
	contact_phone?: string | null;
	contact_email?: string | null;
	website?: string | null;
	entry_fee?: string | null;
	category_ids: number[];
	type_id: number;
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
	provinces: { id: number; province_name: string }[];
	municipalities: { id: number; municipality_name: string; province_id: number }[];
	barangays: { id: number; barangay_name: string; municipality_id: number }[];
};

export type TouristSpotsResponse = TouristSpot[];
