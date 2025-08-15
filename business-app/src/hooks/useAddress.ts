import { useEffect, useState } from "react";
import axios from "axios";

interface Province {
    id: number;
    province: string;
}
interface Municipality {
    id: number;
    municipality: string;
}
interface Barangay {
    id: number;
    barangay: string;
}

export function useAddress(
    API_URL: string,
    provinceId?: string | number,
    municipalityId?: string | number,
    barangayId?: string | number
) {
    const [province, setProvince] = useState<Province | null>(null);
    const [municipality, setMunicipality] = useState<Municipality | null>(null);
    const [barangay, setBarangay] = useState<Barangay | null>(null);

    // Province
    useEffect(() => {
        if (!provinceId) return;
        axios
            .get<Province[]>(`${API_URL}/address/province/${provinceId}`)
            .then((res) => {
                if (Array.isArray(res.data) && res.data.length > 0) {
                    setProvince(res.data[0]);
                }
            })
            .catch((err) => console.error("Error fetching province:", err));
    }, [provinceId, API_URL]);

    // Municipality
    useEffect(() => {
        if (!municipalityId) return;
        axios
            .get<Municipality[]>(`${API_URL}/address/municipality/${municipalityId}`)
            .then((res) => {
                if (Array.isArray(res.data) && res.data.length > 0) {
                    setMunicipality(res.data[0]);
                }
            })
            .catch((err) => console.error("Error fetching municipality:", err));
    }, [municipalityId, API_URL]);

    // Barangay
    useEffect(() => {
        if (!barangayId) return;
        axios
            .get<Barangay[]>(`${API_URL}/address/barangay/${barangayId}`)
            .then((res) => {
                if (Array.isArray(res.data) && res.data.length > 0) {
                    setBarangay(res.data[0]);
                }
            })
            .catch((err) => console.error("Error fetching barangay:", err));
    }, [barangayId, API_URL]);

    const fullAddress = [barangay?.barangay, municipality?.municipality, province?.province]
        .filter(Boolean)
        .join(", ");

    return { province, municipality, barangay, fullAddress };
}
