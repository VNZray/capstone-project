import { FontAwesome } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const BusinessDetailsTab = ({ business }: { business: any }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Business Details</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>General Information</Text>
        <Detail label="Name" value={business?.business_name} icon="building" />
        <Detail label="Type" value={business?.business_type} icon="briefcase" />
        <Detail label="Category" value={business?.category} icon="list" />
        <Detail label="Status" value={business?.status} icon="info-circle" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contact Information</Text>
        <Detail label="Phone" value={business?.phone_number} icon="phone" />
        <Detail
          label="Email"
          value={business?.business_email}
          icon="envelope"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Location</Text>
        <Detail
          label="Address"
          value={`${business?.barangay}, ${business?.city}, ${business?.province}, ${business?.postal_code}`}
          icon="map-marker"
        />
        <Detail
          label="Coordinates"
          value={`${business?.latitude}, ${business?.longitude}`}
          icon="globe"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pricing</Text>
        <Detail
          label="Price Range"
          value={
            business?.min_price && business?.max_price
              ? `₱${business.min_price} - ₱${business.max_price}`
              : 'Not specified'
          }
          icon="money"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Social Links</Text>
        <Detail
          label="Facebook"
          value={business?.facebook_url}
          icon="facebook"
        />
        <Detail
          label="Instagram"
          value={business?.instagram_url}
          icon="instagram"
        />
        <Detail label="Twitter" value={business?.twitter_url} icon="twitter" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Description</Text>
        <Text style={styles.text}>
          {business?.description || 'No description available.'}
        </Text>
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

  function isValidUrl(value: string) {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  return (
    <View style={styles.detailRow}>
      <FontAwesome name={icon} size={18} color="#0A1B47" style={styles.icon} />
      <Text style={styles.detailText}>
        {isValidUrl(value) ? (
          <Link href={value as any} style={styles.label}>
            {label}:{' '}
          </Link>
        ) : (
          <Text style={styles.label}>{label}: </Text>
        )}
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#DEE3F2', padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A1B47',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#0A1B47',
  },
  label: {
    fontWeight: 'bold',
    color: '#0A1B47',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    marginRight: 8,
    width: 24,
  },
  detailText: {
    color: '#333',
    fontSize: 16,
    flexShrink: 1,
  },
  text: {
    fontSize: 16,
    color: '#333',
    lineHeight: 20,
  },
});

export default BusinessDetailsTab;
