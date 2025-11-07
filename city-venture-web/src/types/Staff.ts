
export type Staff = {
    id?: string | "";
    first_name: string;
    middle_name?: string | "";
    last_name: string;
    user_id?: string | "";
    business_id?: string | "";
};

export type StaffDetails = {
    id?: string | "";
    first_name: string;
    middle_name?: string | "";
    last_name: string;
    user_id?: string | "";
    business_id?: string | "";
    email?: string | "";
    phone_number?: string | "";
    password?: string | "";
    role?: string | "";
    is_active?: boolean;
    user_profile?: string | "";
};
