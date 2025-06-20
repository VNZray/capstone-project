import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const RoomDetails = ({ room }: { room: any }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Room Details</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>General Information</Text>
        <Detail label="Room Number" value={room?.room_number} icon="hashtag" />
        <Detail label="Type" value={room?.room_type} icon="bed" />
        <Detail label="Capacity" value={room?.capacity} icon="users" />
        <Detail label="Amenities" value={room?.amenities} icon="wrench" />
        <Detail label="Price" value={`₱${room?.room_price}`} icon="money" />
        <Detail label="Status" value={room?.status} icon="info-circle" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Additional Info</Text>
        <Detail
          label="Description"
          value={room?.description}
          icon="align-left"
        />
        <Detail label="Business ID" value={room?.business_id} icon="id-badge" />
      </View>
    </ScrollView>
  );
};

const Detail = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: any;
}) => {
  if (!value) return null;

  return (
    <View style={styles.detailRow}>
      <FontAwesome name={icon} size={18} color="#0A1B47" style={styles.icon} />
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <Text style={styles.label}>
          {label}
          {': '}
        </Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    backgroundColor: '#F4F6FA',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0A1B47',
    textAlign: 'center',
    marginVertical: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#0A1B47',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E6F2',
    paddingBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  icon: {
    marginRight: 10,
    marginTop: 3,
    width: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A1B47',
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
});

export default RoomDetails;
