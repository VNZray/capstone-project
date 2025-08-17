// src/hooks/useAddress.ts
import { useEffect, useState } from "react";
import { fetchAddressById, fetchAllAddress } from "@/src/services/AddressService";

interface Address {
    province_name: string;
    province_id: string;
    municipality_name: string;
    barangay_id: string;
    municipality_id: string;
    barangay_name: string;
}

export function useAddress(barangay_id?: string) {
    const [address, setAddress] = useState<Address | null>(null);
    const [allAddress, setAllAddress] = useState<Address[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                if (barangay_id) {
                    const data = await fetchAddressById(barangay_id);
                    setAddress(data[0]);
                } else {
                    const data = await fetchAllAddress();
                    // flatten provinces → municipalities → barangays
                    const flat: Address[] = [];
                    data.forEach((p: any) => {
                        p.municipalities?.forEach((m: any) => {
                            m.barangays?.forEach((b: any) => {
                                flat.push({
                                    province_id: p.province_id,
                                    province_name: p.province_name,
                                    municipality_id: m.municipality_id,
                                    municipality_name: m.municipality_name,
                                    barangay_id: b.barangay_id,
                                    barangay_name: b.barangay_name,
                                });
                            });
                        });
                    });
                    setAllAddress(flat);
                }
            } catch (err) {
                console.error("Failed to fetch address data", err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [barangay_id]);

    return { address, allAddress, loading };
}
