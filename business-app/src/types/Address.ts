export type Address = {
    province_name?: string;
    province_id?: number;
    municipality_name?: string;
    barangay_id?: number;
    municipality_id?: number;
    barangay_name?: string;
}

export type Province = {
    id: number;
    province: string;
}

export type Municipality = {
    id: number;
    municipality: string;
    province_id: number;
}

export type Barangay = {
    id: number;
    barangay: string;
    municipality_id: number;
}