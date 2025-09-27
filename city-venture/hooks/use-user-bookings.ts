import { useAuth } from '@/context/AuthContext';
import { fetchBookings } from '@/services/AccommodationService';
import { Bookings } from '@/types/Booking';
import { useCallback, useEffect, useState } from 'react';

interface UseUserBookingsResult {
    bookings: Bookings[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Fetch bookings for the currently authenticated user (tourist) by user?.id.
 * Provides loading, error, and a refetch function.
 */
export const useUserBookings = (): UseUserBookingsResult => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Bookings[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        setError(null);
        try {
            const data = await fetchBookings(user.id);
            setBookings(data);
        } catch (err: any) {
            setError(err?.message || 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        load();
    }, [load]);

    return { bookings, loading, error, refetch: load };
};

export default useUserBookings;
