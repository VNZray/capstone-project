import RoomCard from '@/components/RoomCard';
import { ThemedText } from '@/components/ThemedText';
import { useBusiness } from '@/context/BusinessContext';
import { Business, Room } from '@/types/Business';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { supabase } from '@/utils/supabase';
import { Calendar } from 'react-native-calendars';
import PressableButton from '@/components/PressableButton';
import { useAuth } from '@/context/AuthContext';
import { Booking } from '@/types/Bookings';
import { colors } from '@/utils/Colors';

const screenWidth = Dimensions.get('window').width;

type RoomsProps = {
  business: Business;
};

const Rooms = ({ business }: RoomsProps) => {
  const { user } = useAuth();
  const { fetchRoomsByBusinessId } = useBusiness();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<'priceLowHigh' | 'priceHighLow' | ''>(
    ''
  );
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [tempFromDate, setTempFromDate] = useState<Date | null>(null);
  const [tempToDate, setTempToDate] = useState<Date | null>(null);
  const [tempMarkedDates, setTempMarkedDates] = useState<Record<string, any>>(
    {}
  );
  const [roomRatings, setRoomRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    loadRooms();
  }, [business]);

  async function loadRooms() {
    setLoading(true);
    let data = await fetchRoomsByBusinessId(business.id);

    if (fromDate && toDate) {
      const { data: booked } = await supabase
        .from('booking')
        .select('room_id')
        .eq('status', 'confirmed')
        .or(
          `and(check_in_date.lt.${toDate.toISOString()},check_out_date.gt.${fromDate.toISOString()})`
        );

      const bookedRoomIds = booked?.map((b) => b.room_id) ?? [];
      data = data.filter((room) => !bookedRoomIds.includes(room.id));
      console.log('Available rooms after filtering:', data);
    }

    if (sortBy === 'priceLowHigh')
      data.sort((a, b) => a.room_price - b.room_price);
    if (sortBy === 'priceHighLow')
      data.sort((a, b) => b.room_price - a.room_price);

    setRooms(data);
    await fetchRoomRatings(data); // Fetch average ratings after rooms are set
    setLoading(false);
  }

  const fetchRoomRatings = async (rooms: Room[]) => {
    try {
      const roomIds = rooms.map((room) => room.id);

      const { data, error } = await supabase
        .from('review_and_rating')
        .select('reviewable_id, rating')
        .eq('reviewable_type', 'room')
        .in('reviewable_id', roomIds);

      if (error) {
        console.error('Error fetching room reviews:', error.message);
        return;
      }

      const ratingMap: Record<string, { total: number; count: number }> = {};

      data?.forEach((review) => {
        const id = review.reviewable_id;
        if (!ratingMap[id]) ratingMap[id] = { total: 0, count: 0 };
        ratingMap[id].total += review.rating;
        ratingMap[id].count += 1;
      });

      const avgRatings: Record<string, number> = {};
      Object.entries(ratingMap).forEach(([id, { total, count }]) => {
        avgRatings[id] = parseFloat((total / count).toFixed(1));
      });

      setRoomRatings(avgRatings);
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  useEffect(() => {
    const loadBookedDates = async () => {
      const bookedMarks = await fetchMarkedBookings();
      setMarkedDates(bookedMarks);
      setTempMarkedDates(bookedMarks); // Also initialize temp
    };

    loadBookedDates();
  }, []);

  const handleTempDateSelect = (day: any) => {
    const selected = new Date(day.dateString);

    // If selecting the same date again (toggle off)
    if (
      tempFromDate &&
      !tempToDate &&
      selected.toDateString() === tempFromDate.toDateString()
    ) {
      setTempFromDate(null);
      setTempToDate(null);
      setTempMarkedDates({ ...markedDates }); // revert to only booked dates
      return;
    }

    if (!tempFromDate || (tempFromDate && tempToDate)) {
      setTempFromDate(selected);
      setTempToDate(null);
      setTempMarkedDates((prev) => ({
        ...markedDates,
        [day.dateString]: {
          ...prev[day.dateString],
          startingDay: true,
          color: '#0A1B47',
          textColor: 'white',
        },
      }));
    } else if (selected > tempFromDate) {
      const range: any = { ...markedDates };
      const current = new Date(tempFromDate);

      while (current <= selected) {
        const dateStr = current.toISOString().split('T')[0];
        range[dateStr] = {
          ...range[dateStr],
          color: '#0A1B47',
          textColor: 'white',
          ...(dateStr === tempFromDate.toISOString().split('T')[0] && {
            startingDay: true,
          }),
          ...(dateStr === selected.toISOString().split('T')[0] && {
            endingDay: true,
          }),
        };
        current.setDate(current.getDate() + 1);
      }

      setTempToDate(selected);
      setTempMarkedDates(range);
    }
  };

  const fetchMarkedBookings = async () => {
    const { data: bookings, error } = await supabase
      .from('booking')
      .select('check_in_date, check_out_date')
      .eq('business_id', business.id)
      .neq('booking_status', 'Checked-out');

    if (error) {
      console.error('Error fetching bookings:', error);
      return {};
    }

    console.log('Bookings:', bookings);

    const bookedMarks: Record<string, any> = {};

    bookings?.forEach((booking) => {
      const start = new Date(booking.check_in_date);
      const end = new Date(booking.check_out_date);
      const current = new Date(start);

      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        bookedMarks[dateStr] = {
          ...(bookedMarks[dateStr] || {}),
          disabled: true,
          disableTouchEvent: true,
          color: 'orange', // Booked date color
          textColor: 'white',
          startingDay: current.getTime() === start.getTime(),
          endingDay: current.getTime() === end.getTime(),
        };
        current.setDate(current.getDate() + 1);
      }
    });

    return bookedMarks;
  };

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
      <View style={{ padding: 16, paddingTop: 0 }}>
        <PressableButton
          type="primary"
          TextSize={14}
          color="#fff"
          Icon="calendar"
          onPress={() => {
            setTempFromDate(fromDate);
            setTempToDate(toDate);
            setTempMarkedDates(markedDates);
            setCalendarVisible(true);
          }}
          Title="Select Dates"
        />

        {calendarVisible && (
          <Modal
            visible={calendarVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setCalendarVisible(false)}
          >
            <View style={styles.calendarModalOverlay}>
              <View style={styles.calendarModal}>
                <Text style={styles.modalTitle}>Select Date Range</Text>
                <View style={styles.separator} />
                <Text style={styles.noticeText}>
                  🔒 Orange-marked dates are already booked or occupied.
                </Text>
                <Calendar
                  style={{ borderRadius: 8 }}
                  markingType="period"
                  markedDates={tempMarkedDates}
                  onDayPress={handleTempDateSelect}
                  enableSwipeMonths
                  minDate={new Date().toISOString().split('T')[0]} // Disallow selecting past dates
                />
                <View style={styles.calendarButtons}>
                  <PressableButton
                    type="tertiary"
                    Title="Cancel"
                    color="#000"
                    TextSize={12}
                    style={{ flex: 1 }}
                    onPress={() => setCalendarVisible(false)}
                  />
                  <PressableButton
                    type="primary"
                    Title="Confirm"
                    color="#fff"
                    style={{ flex: 1 }}
                    TextSize={12}
                    onPress={() => {
                      if (tempFromDate && tempToDate) {
                        setFromDate(tempFromDate);
                        setToDate(tempToDate);
                        setMarkedDates(tempMarkedDates);
                      }
                      setCalendarVisible(false);
                      loadRooms();
                    }}
                  />
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>

<View style={styles.grid}>
  {rooms
    .slice() // optional: avoid mutating original array
    .sort((a, b) => {
      const roomA = parseInt(a.room_number) ? a.room_number : parseInt(a.room_number);
      const roomB = parseInt(b.room_number) ? b.room_number : parseInt(b.room_number);
      return roomA > roomB ? 1 : roomA < roomB ? -1 : 0;
    })
    .map((room) => (
      <Link
        href={{
          pathname: '/(tabs)/(home)/(accommodations)/room/[id]',
          params: {
            id: room.id,
            fromDate: fromDate?.toISOString().split('T')[0] || '',
            toDate: toDate?.toISOString().split('T')[0] || '',
          },
        }}
        key={room.id}
      >
        <RoomCard
          roomNumber={room.room_number}
          status={room.status}
          capacity={room.capacity}
          roomPrice={room.room_price}
          ratings={roomRatings[room.id] || 0}
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
  dateInputButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  dateInputText: {
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  filterButton: {
    backgroundColor: '#0A1B47',
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  calendarModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  calendarModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    elevation: 5,
  },
  calendarButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 16,
  },
  cancelText: {
    fontSize: 16,
    color: '#999',
  },
  confirmText: {
    fontSize: 16,
    color: '#0A1B47',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#DDD',
    marginBottom: 12,
  },

  cancelButton: {
    backgroundColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },

  confirmButton: {
    backgroundColor: '#0A1B47',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  noticeText: {
    fontSize: 14,
    color: '#D97706',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default Rooms;
