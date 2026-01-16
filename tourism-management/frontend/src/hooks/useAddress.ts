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
) {
    const [address, setAddress] = useState<Address | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (
            barangay_id === undefined
        ) {
            setAddress(null);
            return;
        }

        const load = async () => {
            setLoading(true);
            try {
                const address = await AddressService.fetchFullAddress(barangay_id);

                setAddress({
                    barangay_name: address.barangay_name,
                    barangay_id: address.barangay_id,
                    municipality_name: address.municipality_name,
                    municipality_id: address.municipality_id,
                    province_name: address.province_name,
                    province_id: address.province_id,
                });


            } catch (error) {
                console.error("Failed to load address data", error);
                setAddress(null);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [barangay_id]);

    return { address, loading };
}