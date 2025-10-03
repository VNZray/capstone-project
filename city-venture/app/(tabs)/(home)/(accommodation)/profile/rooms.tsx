import PageContainer from '@/components/PageContainer';
import React, { useCallback, useRef, useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

import Button from '@/components/Button';
import Container from '@/components/Container';
import DateInput from '@/components/DateInput';
import Dropdown, { DropdownItem } from '@/components/Dropdown';
import RoomCard from '@/components/accommodation/RoomCard';
import { useRoom } from '@/context/RoomContext';
import { navigateToRoomProfile } from '@/routes/accommodationRoutes';
// NOTE: We derive floor options dynamically from the room list.
// Fallback options will only be used if no rooms are loaded yet.
const fallbackFloors: DropdownItem[] = [
  { id: '1', label: '1' },
  { id: '2', label: '2' },
  { id: '3', label: '3' },
];

const Rooms = () => {
  const { rooms, loading, setRoomId, refreshRooms } = useRoom();
  const [cardView, setCardView] = useState('card');
  // Selected floor (null = all)
  const [selectedFloor, setSelectedFloor] = React.useState<number | null>(null);
  const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  const [refreshing, setRefreshing] = useState(false);
  const lastOffset = useRef(0);
  const atTopRef = useRef(true);
  const wasScrollingUpRef = useRef(false);

  const onRefresh = useCallback(
    async (force?: boolean) => {
      setRefreshing(true);
      try {
        await refreshRooms({ force });
      } finally {
        setRefreshing(false);
      }
    },
    [refreshRooms]
  );

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const prev = lastOffset.current;
      wasScrollingUpRef.current = y < prev;
      atTopRef.current = y <= 0;
      lastOffset.current = y;
    },
    []
  );

  const handleScrollEndDrag = useCallback(() => {
    if (atTopRef.current && !refreshing && !loading) {
      onRefresh(true); // force no-cache reload
    }
  }, [loading, onRefresh, refreshing]);

  // Derive floors: priority to explicit room.floor / room.floor_number; fallback to first digit of room_number.
  const floorItems: DropdownItem[] = useMemo(() => {
    if (!rooms || rooms.length === 0) return fallbackFloors;
    const floorSet = new Set<number>();
    rooms.forEach((r) => {
      // Try known properties
      // @ts-ignore (allow flexible access if backend naming differs)
      const direct = r.floor ?? r.floor_number ?? r.level;
      let floor: number | null = null;
      if (typeof direct === 'number') floor = direct;
      else if (typeof direct === 'string' && /^\d+$/.test(direct)) floor = parseInt(direct, 10);
      else if (!direct && r.room_number) {
        // Derive from room_number (e.g., 302 -> 3)
        const match = String(r.room_number).match(/^(\d)/);
        if (match) floor = parseInt(match[1], 10);
      }
      if (floor != null && !Number.isNaN(floor)) floorSet.add(floor);
    });
    const sorted = Array.from(floorSet).sort((a, b) => a - b);
    return sorted.map((f) => ({ id: f, label: String(f) }));
  }, [rooms]);

  // Filter rooms by selected floor
  const filteredRooms = useMemo(() => {
    if (!rooms) return [];
    if (selectedFloor == null) return rooms;
    return rooms.filter((r) => {
      // @ts-ignore allow flexible field names
      const direct = r.floor ?? r.floor_number ?? r.level;
      let floor: number | null = null;
      if (typeof direct === 'number') floor = direct;
      else if (typeof direct === 'string' && /^\d+$/.test(direct)) floor = parseInt(direct, 10);
      else if (!direct && r.room_number) {
        const match = String(r.room_number).match(/^(\d)/);
        if (match) floor = parseInt(match[1], 10);
      }
      return floor === selectedFloor;
    });
  }, [rooms, selectedFloor]);

  return (
    <PageContainer style={{ paddingTop: 0, paddingBottom: 100 }}>
      <Container
        style={{ overflow: 'visible' }}
        backgroundColor="transparent"
        gap={16}
        paddingBottom={0}
        padding={0}
        direction="row"
      >
        <Dropdown
          withSearch={false}
          style={{ width: 120 }}
          placeholder="Floor"
          items={[{ id: 'all', label: 'All' }, ...floorItems]}
          value={selectedFloor === null ? 'all' : selectedFloor}
          onSelect={(item) => {
            if (item.id === 'all') {
              setSelectedFloor(null);
            } else {
              const v = typeof item.id === 'string' ? parseInt(item.id, 10) : (item.id as number);
              setSelectedFloor(Number.isNaN(v) ? null : v);
            }
          }}
          variant="solid"
          color="primary"
        />

        <DateInput
          style={{ flex: 1 }}
          size="medium"
          mode="range"
          selectionVariant="filled"
          variant="solid"
          disablePast
          disablePastNavigation
          requireConfirmation
          showStatusLegend={false}
        />
        <Button
          elevation={2}
          color="white"
          startIcon={cardView === 'card' ? 'list' : 'th-large'}
          icon
          onPress={() => setCardView(cardView === 'card' ? 'list' : 'card')}
        />
      </Container>
      <View>
        {loading ? (
          <View style={styles.center}>
            <Text>Loading rooms…</Text>
          </View>
        ) : filteredRooms && filteredRooms.length > 0 ? (
          <View style={styles.list}>
            {filteredRooms.map((room) => (
              <RoomCard
                elevation={6}
                key={room.id}
                image={room.room_image ? { uri: room.room_image } : undefined}
                title={room.room_number || 'Room'}
                subtitle={room.description || room.room_type || ''}
                capacity={room.capacity || undefined}
                price={room.room_price || undefined}
                rating={4.5}
                comments={12}
                status={
                  room.status === 'available'
                    ? 'Available'
                    : room.status === 'maintenance'
                    ? 'Maintenance'
                    : room.status === 'booked'
                    ? 'Booked'
                    : undefined
                }
                view={cardView}
                variant="solid"
                size="large"
                onClick={() => {
                  if (room.id) {
                    setRoomId(room.id);
                    navigateToRoomProfile();
                  }
                }}
              />
            ))}
          </View>
        ) : (
          <View style={styles.center}>
            <Text>No rooms available</Text>
          </View>
        )}
      </View>
    </PageContainer>
  );
};

export default Rooms;

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  center: {
    paddingVertical: 24,
    alignItems: 'center',
  },
});
