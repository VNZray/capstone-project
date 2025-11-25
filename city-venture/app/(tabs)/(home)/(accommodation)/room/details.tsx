import PageContainer from '@/components/PageContainer';
import { useRoom } from '@/context/RoomContext';
import { fetchRoomAmenities } from '@/services/AmenityService';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import AboutSection from './components/AboutSection';
import AmenitySection from './components/AmenitySection';

const Details = () => {
  const { roomDetails } = useRoom();
  const [amenities, setAmenities] = useState<{ id?: number; name: string }[]>(
    []
  );
  const [loadingAmenities, setLoadingAmenities] = useState(false);
  // Load amenities for this business
  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!roomDetails?.id) return;
      try {
        setLoadingAmenities(true);
        const data = await fetchRoomAmenities(roomDetails.id);
        if (isMounted) {
          setAmenities(data.map((a) => ({ id: a.id, name: a.name })));
        }
      } catch (e) {
        console.error('[Details] Failed to load amenities:', e);
      } finally {
        if (isMounted) setLoadingAmenities(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [roomDetails?.id]);

  return (
    <PageContainer gap={0} style={{ paddingTop: 0 }}>
      <AboutSection description={roomDetails?.description} />

      <AmenitySection amenities={amenities} loading={loadingAmenities} />

    </PageContainer>
  );
};

export default Details;

const styles = StyleSheet.create({});
