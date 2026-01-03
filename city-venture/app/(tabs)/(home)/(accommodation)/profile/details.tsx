import PageContainer from '@/components/PageContainer';
import { ThemedText } from '@/components/themed-text';
import { useAccommodation } from '@/context/AccommodationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fetchBusinessAmenities } from '@/services/AmenityService';
import { fetchBusinessHours } from '@/services/BusinessHoursService';
import { fetchBusinessPolicies } from '@/services/BusinessPoliciesService';
import type { BusinessSchedule } from '@/types/Business';
import type { BusinessPolicies } from '@/types/BusinessPolicies';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import AboutSection from './components/AboutSection';
import AmenitySection from './components/AmenitySection';
import BusinessHoursSection from './components/BusinessHoursSection';
import ContactSection from './components/ContactSection';
import MapSection from './components/MapSection';
import PoliciesSection from './components/PoliciesSection';
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
  const [policies, setPolicies] = useState<BusinessPolicies | null>(null);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
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

    // Fetch business policies
    (async () => {
      if (!accommodationDetails?.id) return;
      try {
        setLoadingPolicies(true);
        const data = await fetchBusinessPolicies(accommodationDetails.id);
        if (isMounted) setPolicies(data);
      } catch (e) {
        console.error('[Details] Failed to load policies:', e);
      } finally {
        if (isMounted) setLoadingPolicies(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [accommodationDetails?.id]);

  return (
    <PageContainer gap={0} style={{ paddingTop: 0, paddingBottom: 100 }}>
      {/* About Section - What is this place? */}
      <AboutSection description={accommodationDetails?.description} />

      {/* Policies & House Rules - Critical booking info (check-in/out, cancellation) */}
      <PoliciesSection policies={policies} loading={loadingPolicies} />

      {/* Amenities Section - What facilities are available? */}
      <AmenitySection amenities={amenities} loading={loadingAmenities} />

      {/* Business Hours Section - Operating hours */}
      <BusinessHoursSection hours={hours} loading={loadingHours} />

      {/* Map Section - Where is it located? */}
      <MapSection
        latitude={accommodationDetails?.latitude}
        longitude={accommodationDetails?.longitude}
        businessName={accommodationDetails?.business_name}
        description={accommodationDetails?.description}
      />

      {/* Contact Section - How to reach them */}
      <ContactSection
        email={accommodationDetails?.email}
        phone={accommodationDetails?.phone_number}
        website={accommodationDetails?.website_url}
      />

      {/* Socials Section - Follow on social media */}
      <SocialsSection
        facebookUrl={accommodationDetails?.facebook_url}
        instagramUrl={accommodationDetails?.instagram_url}
      />
    </PageContainer>
  );
};

export default Details;
