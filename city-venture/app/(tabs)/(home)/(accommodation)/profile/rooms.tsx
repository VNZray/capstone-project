import AccommodationCard from '@/components/AccommodationCard'
import PageContainer from '@/components/PageContainer'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { useRoom } from '@/context/RoomContext'

const Rooms = () => {
  const { rooms, loading } = useRoom()
  return (
    <PageContainer style={{ paddingTop: 0 }}>
      {loading ? (
        <View style={styles.center}> 
          <Text>Loading rooms…</Text>
        </View>
      ) : rooms && rooms.length > 0 ? (
        <View style={styles.list}>
          {rooms.map((room) => (
            <AccommodationCard
              key={room.id}
              elevation={3}
              image={room.room_image ? { uri: room.room_image } : require('@/assets/images/gcash.png')}
              title={room.room_number?.toString() || 'Room'}
              subTitle={room.description || ''}
              pricing={room?.room_price ? `₱${room.room_price}` : undefined}
            />
          ))}
        </View>
      ) : (
        <View style={styles.center}>
          <Text>No rooms available</Text>
        </View>
      )}
    </PageContainer>
  )
}

export default Rooms

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  center: {
    paddingVertical: 24,
    alignItems: 'center',
  },
})