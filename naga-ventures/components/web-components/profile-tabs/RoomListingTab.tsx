import ErrorModal from '@/components/web-components/modals/ErrorModal';
import SuccessModal from '@/components/web-components/modals/SuccessModal';
import WarningModal from '@/components/web-components/modals/WarningModal';
import { supabase } from '@/utils/supabase';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const RoomListingTab = ({ rooms: initialRooms }: { rooms: any[] }) => {
  const [rooms, setRooms] = useState(initialRooms);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  // Modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const toggleMenu = (index: number) => {
    setActiveMenu(activeMenu === index ? null : index);
    deleteRoom(index);
  };

  const deleteRoom = (roomId: any) => {
    const roomExists = rooms.some((room) => room.id === roomId);

    if (!roomExists) {
      setShowWarningModal(true);
      return;
    }

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this room?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleRoomDelete(roomId),
        },
      ]
    );
  };

  const handleRoomDelete = async (roomId: string) => {
    try {
      const { error } = await supabase.from('Room').delete().eq('id', roomId);

      if (error) {
        console.error('Supabase deletion error:', error);
        setShowErrorModal(true);
        return;
      }

      // Update local state only if deletion succeeded
      const updatedRooms = rooms.filter((room) => room.id !== roomId);
      setRooms(updatedRooms);
      setActiveMenu(null);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Deletion error:', err);
      setShowErrorModal(true);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'available':
        return styles.statusAvailable;
      case 'occupied':
        return styles.statusOccupied;
      case 'maintenance':
        return styles.statusMaintenance;
      default:
        return styles.statusUnknown;
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Listed Rooms</Text>
      <View style={styles.roomGrid}>
        {rooms.map((room, index) => (
          <View key={room.id || index} style={styles.roomCard}>
            <Link key={room.id} href={`/BusinessApp/(admin)/(room)/${room.id}`}>
              {/* Menu Button */}
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => toggleMenu(room.id)}
              >
                <Text style={styles.menuIcon}>⋮</Text>
              </TouchableOpacity>

              {/* Dropdown Menu */}
              {activeMenu === index && (
                <View style={styles.menuDropdown}>
                  <Pressable onPress={() => console.log('Edit', room)}>
                    <Text style={styles.menuItem}>✏️ Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => handleRoomDelete(room.id)}>
                    <Text style={styles.menuItem}>🗑️ Delete</Text>
                  </Pressable>
                </View>
              )}

              <Image
                source={{
                  uri: room.room_image || 'https://via.placeholder.com/300',
                }}
                style={styles.roomImage}
              />
              <View style={styles.roomInfo}>
                <Text style={styles.roomTitle}>Room {room.room_number}</Text>
                <Text style={styles.roomText}>
                  👥 Capacity: {room.capacity}
                </Text>
                <Text style={[styles.roomStatus, getStatusStyle(room.status)]}>
                  {room.status}
                </Text>
                <Text style={styles.roomPrice}>₱ {room.room_price}</Text>
              </View>
            </Link>
          </View>
        ))}
      </View>

      {/* ✅ Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Room Deleted"
        message="The room has been successfully removed."
        onClose={() => setShowSuccessModal(false)}
      />

      {/* ❌ Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        message="Something went wrong while deleting the room. Please try again."
        onClose={() => setShowErrorModal(false)}
      />

      {/* ⚠️ Warning Modal */}
      <WarningModal
        visible={showWarningModal}
        message="This room no longer exists or has already been deleted."
        onClose={() => setShowWarningModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0A1B47',
    marginBottom: 16,
    textAlign: 'center',
  },
  roomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 19.7,
  },
  roomCard: {
    width: '19%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    overflow: 'hidden',
    paddingBottom: 12,
    shadowColor: '#0A1B47',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16,
    position: 'relative',
  },
  roomImage: {
    width: '100%',
    height: 250,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  roomInfo: {
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1B47',
    marginBottom: 4,
  },
  roomText: {
    fontSize: 13,
    color: '#444',
    marginBottom: 2,
  },
  roomPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0A1B47',
    marginTop: 8,
  },
  roomStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusAvailable: {
    backgroundColor: '#DFFFE0',
    color: '#1A7F37',
  },
  statusOccupied: {
    backgroundColor: '#FFE0E0',
    color: '#B00020',
  },
  statusMaintenance: {
    backgroundColor: '#FFF2CC',
    color: '#FF8C00',
  },
  statusUnknown: {
    backgroundColor: '#E0E0E0',
    color: '#555',
  },
  menuButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
  },
  menuIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuDropdown: {
    position: 'absolute',
    top: 30,
    right: 8,
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 20,
  },
  menuItem: {
    fontSize: 14,
    paddingVertical: 4,
    color: '#0A1B47',
  },
});

export default RoomListingTab;
