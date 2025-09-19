import PageContainer from '@/components/PageContainer';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import Container from '@/components/Container';
import DateInput from '@/components/DateInput';
import Dropdown, { DropdownItem } from '@/components/Dropdown';
import RoomCard from '@/components/RoomCard';
import { useRoom } from '@/context/RoomContext';
const provinces: DropdownItem[] = [
  { id: 1, label: '1' },
  { id: 2, label: '2' },
  { id: 3, label: '3' },
];

const Rooms = () => {
  const { rooms, loading } = useRoom();
  const [cardView, setCardView] = useState('card');
  const [provinceId, setProvinceId] = React.useState<number | null>(null);
  const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  return (
    <PageContainer style={{ paddingTop: 0 }}>
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
          style={{ width: 100 }}
          placeholder="Floor"
          items={provinces}
          value={provinceId}
          onSelect={(item) => {
            // item.id gives you the selected ID
            setProvinceId(item.id as number);
            console.log('Selected province id:', item.id, 'label:', item.label);
          }}
          variant="solid"
          color="primary"
        />

        <DateInput
          style={{ flex: 1 }}
          mode="range"
          dateStatuses={{
            '2025-09-20': 'reserved',
            '2025-09-21': 'occupied',
            '2025-09-22': 'unavailable',
          }}
          bookedRoomsByDate={{
            '2025-09-21': [
              { id: 1, name: 'Room 101', status: 'occupied' },
              { id: 2, name: 'Room 102', status: 'occupied' },
            ],
            '2025-09-20': [{ id: 3, name: 'Room 205', status: 'reserved' }],
          }}
          showStatusLegend
          showBookedRooms
          selectionVariant="outline"
          variant="solid"
          disablePast
          disablePastNavigation
          requireConfirmation
        />
        <Button
          elevation={2}
          color="white"
          startIcon={cardView === 'card' ? 'list' : 'th-large'}
          icon
          onPress={() => setCardView(cardView === 'card' ? 'list' : 'card')}
        />
      </Container>
      {loading ? (
        <View style={styles.center}>
          <Text>Loading rooms…</Text>
        </View>
      ) : rooms && rooms.length > 0 ? (
        <View style={styles.list}>
          {rooms.map((room) => (
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
                console.log('Room clicked', room.id);
              }}
            />
          ))}
        </View>
      ) : (
        <View style={styles.center}>
          <Text>No rooms available</Text>
        </View>
      )}
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
