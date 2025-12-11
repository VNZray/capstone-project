import PageContainer from '@/components/PageContainer';
import { ThemedText } from '@/components/themed-text';
import { useAccommodation } from '@/context/AccommodationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fetchBusinessAmenities } from '@/services/AmenityService';
import { fetchBusinessHours } from '@/services/BusinessHoursService';
import type { BusinessSchedule } from '@/types/Business';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import AboutSection from './components/AboutSection';
import AmenitySection from './components/AmenitySection';
import BusinessHoursSection from './components/BusinessHoursSection';
import ContactSection from './components/ContactSection';
import MapSection from './components/MapSection';
import SocialsSection from './components/SocialsSection';

const Details = () => {
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? '#fff' : '#000';
  const { accommodationDetails } = useAccommodation();
  const [amenities, setAmenities] = useState<{ id?: number; name: string }[]>(
    []
  );
  const [loadingAmenities, setLoadingAmenities] = useState(false);
  const [hours, setHours] = useState<BusinessSchedule>([]);
  const [loadingHours, setLoadingHours] = useState(false);
  const [rooms, setRooms] = useState<import('@/types/Business').Room[]>([]);

  // Load amenities for this business
  useEffect(() => {
    if (!accommodationDetails?.id) return;
    let isMounted = true;
    (async () => {
      if (!accommodationDetails?.id) return;
      try {
        setLoadingAmenities(true);
        const data = await fetchBusinessAmenities(accommodationDetails.id);
        if (isMounted) {
          setAmenities(data.map((a) => ({ id: a.id, name: a.name })));
        }
      } catch (e) {
        console.error('[Details] Failed to load amenities:', e);
      } finally {
        if (isMounted) setLoadingAmenities(false);
      }
    })();

    (async () => {
      if (!accommodationDetails?.id) return;
      try {
        setLoadingHours(true);
        const data = await fetchBusinessHours(accommodationDetails.id);
        if (isMounted)
          setHours(
            data.map((h) => ({
              ...h,
              id: h.id !== undefined ? Number(h.id) : undefined,
            }))
          );
      } catch (e) {
        console.error('[Details] Failed to load business hours:', e);
      } finally {
        if (isMounted) setLoadingHours(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [accommodationDetails?.id]);

  return (
    <PageContainer gap={0} style={{ paddingTop: 0, paddingBottom: 100 }}>
      {/* About Section */}
      <AboutSection description={accommodationDetails?.description} />

      {/* Amenities Section */}
      <AmenitySection amenities={amenities} loading={loadingAmenities} />

      {/* Business Hours Section */}
      <BusinessHoursSection hours={hours} loading={loadingHours} />

      {/* Contact Section */}
      <ContactSection
        email={accommodationDetails?.email}
        phone={accommodationDetails?.phone_number}
        website={accommodationDetails?.website_url}
      />

      {/* Socials Section */}
      <SocialsSection
        facebookUrl={accommodationDetails?.facebook_url}
        instagramUrl={accommodationDetails?.instagram_url}
      />

      {/* Map Section */}
      <MapSection
        latitude={accommodationDetails?.latitude}
        longitude={accommodationDetails?.longitude}
        businessName={accommodationDetails?.business_name}
        description={accommodationDetails?.description}
      />
    </PageContainer>
  );
};

export default Details;
