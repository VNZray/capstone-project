import { useEffect, useState } from "react";
import { AddressService } from "@/src/services/AddressService";

interface Address {
    province_name: string;
    province_id: number;
    municipality_name: string;
    barangay_id: number;
    municipality_id: number;
    barangay_name: string;
}

export function useAddress(
    barangay_id?: number,
    municipality_id?: number,
    province_id?: number
) {
    const [address, setAddress] = useState<Address | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Only fetch if all IDs are provided
        if (
            barangay_id === undefined ||
            municipality_id === undefined ||
            province_id === undefined
        ) {
            setAddress(null);
            return;
        }

        const load = async () => {
            setLoading(true);
            try {
                const barangayResponse = await AddressService.getBarangayById(barangay_id);
                const municipalityResponse = await AddressService.getMunicipalityById(municipality_id);
                const provinceResponse = await AddressService.getProvinceById(province_id);

                setAddress({
                    province_name: provinceResponse.province,
                    province_id: provinceResponse.id,
                    municipality_name: municipalityResponse.municipality,
                    municipality_id: municipalityResponse.id,
                    barangay_name: barangayResponse.barangay,
                    barangay_id: barangayResponse.id,
                });


            } catch (error) {
                console.error("Failed to load address data", error);
                setAddress(null);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [barangay_id, municipality_id, province_id]);

    return { address, loading };
}