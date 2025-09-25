import Chip from '@/components/Chip';
import Container from '@/components/Container';
import PageContainer from '@/components/PageContainer';
import { ThemedText } from '@/components/themed-text';
import { useRoom } from '@/context/RoomContext';
import { fetchRoomAmenities } from '@/services/AmenityService';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

const Details = () => {
  const { roomDetails } = useRoom();
  const [aboutExpanded, setAboutExpanded] = useState(false);
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
    <PageContainer style={{ paddingTop: 0 }}>
      <Container elevation={2}>
        <ThemedText type="card-title-small" weight="medium">
          About
        </ThemedText>
        <ThemedText type="body-small">
          {(() => {
            if (!roomDetails) return 'No description provided.';
            const raw = roomDetails.description
              ? roomDetails.description.replace(/^"|"$/g, '').trim()
              : '';
            if (!raw) return 'No description provided.';
            if (aboutExpanded || raw.length <= 160) return raw;
            return `${raw.slice(0, 160)}…`;
          })()}
        </ThemedText>
        {roomDetails &&
        roomDetails.description &&
        roomDetails.description.length > 160 ? (
          <Pressable onPress={() => setAboutExpanded((s) => !s)}>
            <ThemedText type="link-medium" style={{ marginTop: 6 }}>
              {aboutExpanded ? 'Show less' : 'Read more'}
            </ThemedText>
          </Pressable>
        ) : null}
      </Container>

      <View>
        <ThemedText type="card-title-small" weight="medium">
          Amenities
        </ThemedText>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            paddingTop: 8,
          }}
        >
          {loadingAmenities ? (
            <ThemedText type="body-small">Loading amenities…</ThemedText>
          ) : amenities.length > 0 ? (
            amenities.map((a, idx) => (
              <Chip
                color="secondary"
                elevation={2}
                label={a.name}
                key={a.id != null ? String(a.id) : `${a.name}-${idx}`}
                variant="soft"
                size="medium"
              />
            ))
          ) : (
            <ThemedText type="body-small" style={{ color: '#6A768E' }}>
              No amenities listed.
            </ThemedText>
          )}
        </View>
      </View>
    </PageContainer>
  );
};

export default Details;

const styles = StyleSheet.create({});
