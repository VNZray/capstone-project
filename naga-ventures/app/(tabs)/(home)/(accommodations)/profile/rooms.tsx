import RoomCard from '@/components/RoomCard';
import { ThemedText } from '@/components/ThemedText';
import { useBusiness } from '@/context/BusinessContext';
import { Business, Room } from '@/types/Business';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

type RoomsProps = {
  business: Business;
};

const screenWidth = Dimensions.get('window').width;

const Rooms = ({ business }: RoomsProps) => {
  const { fetchRoomsByBusinessId } = useBusiness();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadRooms = async () => {
      setLoading(true);
      const data = await fetchRoomsByBusinessId(business.id);
      setRooms(data);
      setLoading(false);
    };

    loadRooms();
  }, [business]);

  if (!business) {
    return (
      <View style={styles.emptyState}>
        <ThemedText type="subtitle">Accommodation not found.</ThemedText>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.emptyState}>
        <ThemedText type="subtitle">Loading rooms...</ThemedText>
      </View>
    );
  }

  if (rooms.length === 0) {
    return (
      <View style={styles.emptyState}>
        <ThemedText type="subtitle">
          No rooms available for this accommodation.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {rooms.map((room) => (
          <Link
            href={`/(tabs)/(home)/(accommodations)/room/${room.id}`}
            key={room.id}
          >
            <RoomCard
              key={room.id}
              roomNumber={room.room_number}
              status={room.status}
              capacity={room.capacity}
              roomPrice={room.room_price}
              ratings={4.5} // static for now, or replace with room.ratings if available
              elevation={3}
              background="#fff"
              imageUri={room.room_image}
            />
          </Link>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'visible',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 0,
    padding: 16,
    gap: 16,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
});

export default Rooms;
