/**
 * Emergency Facility Bottom Sheet Component
 * Displays emergency facility details when marker is tapped
 */

import React from 'react';
import { View, Image, StyleSheet, Linking, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import BottomSheet from '@/components/ui/BottomSheetModal';
import Button from '@/components/Button';
import { colors } from '@/constants/color';
import type {
  EmergencyFacility,
  FacilityType,
} from '@/types/EmergencyFacility';

interface EmergencyFacilityBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  facility: EmergencyFacility | null;
}

const FACILITY_COLORS: Record<FacilityType, string> = {
  police_station: '#1976D2',
  hospital: '#D32F2F',
  fire_station: '#F57C00',
  evacuation_center: '#388E3C',
};

const FACILITY_ICONS: Record<FacilityType, string> = {
  police_station: 'shield',
  hospital: 'hospital-box',
  fire_station: 'fire-truck',
  evacuation_center: 'home-group',
};

const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  police_station: 'Police Station',
  hospital: 'Hospital',
  fire_station: 'Fire Station',
  evacuation_center: 'Evacuation Center',
};

const EmergencyFacilityBottomSheet: React.FC<
  EmergencyFacilityBottomSheetProps
> = ({ isOpen, onClose, facility }) => {
  if (!facility) return null;

  const color = FACILITY_COLORS[facility.facility_type];
  const iconName = FACILITY_ICONS[facility.facility_type];
  const typeLabel = FACILITY_TYPE_LABELS[facility.facility_type];

  const address =
    [facility.address, facility.barangay_name, facility.municipality_name]
      .filter(Boolean)
      .join(', ') || 'No address available';

  const handleCall = (number: string) => {
    const phoneUrl =
      Platform.OS === 'ios' ? `telprompt:${number}` : `tel:${number}`;
    Linking.canOpenURL(phoneUrl).then((supported) => {
      if (supported) {
        Linking.openURL(phoneUrl);
      }
    });
  };

  const handleDirections = () => {
    if (facility.latitude && facility.longitude) {
      const scheme = Platform.select({
        ios: 'maps://0,0?q=',
        android: 'geo:0,0?q=',
      });
      const latLng = `${facility.latitude},${facility.longitude}`;
      const label = encodeURIComponent(facility.name);
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`,
      });
      if (url) Linking.openURL(url);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      headerTitle={facility.name}
      snapPoints={['65%']}
      enablePanDownToClose
      closeButton
      content={
        <View style={styles.container}>
          {/* Facility Image */}
          <View style={styles.imageContainer}>
            {facility.facility_image ? (
              <Image
                source={{ uri: facility.facility_image }}
                style={styles.image}
              />
            ) : (
              <View
                style={[
                  styles.placeholderImage,
                  { backgroundColor: `${color}20` },
                ]}
              >
                <MaterialCommunityIcons
                  name={iconName as any}
                  size={60}
                  color={color}
                />
              </View>
            )}
            {/* Type Badge overlay on image */}
            <View style={[styles.imageBadge, { backgroundColor: color }]}>
              <MaterialCommunityIcons
                name={iconName as any}
                size={14}
                color="#fff"
              />
              <ThemedText
                type="body-small"
                weight="semi-bold"
                style={styles.typeText}
              >
                {typeLabel}
              </ThemedText>
            </View>
          </View>

          {/* Status Badge */}
          {facility.status !== 'active' && (
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    facility.status === 'inactive' ? '#9E9E9E' : '#FF9800',
                },
              ]}
            >
              <ThemedText type="body-small" style={styles.statusText}>
                {facility.status === 'inactive'
                  ? 'Currently Closed'
                  : 'Under Maintenance'}
              </ThemedText>
            </View>
          )}

          {/* Address */}
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color={colors.primary}
            />
            <ThemedText
              type="body-medium"
              style={[styles.infoText, { flex: 1 }]}
            >
              {address}
            </ThemedText>
          </View>

          {/* Emergency Hotline */}
          {facility.emergency_hotline && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="phone-alert"
                size={20}
                color="#D32F2F"
              />
              <ThemedText
                type="body-medium"
                weight="semi-bold"
                style={styles.infoText}
              >
                Emergency: {facility.emergency_hotline}
              </ThemedText>
            </View>
          )}

          {/* Contact Phone */}
          {facility.contact_phone && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="phone"
                size={20}
                color={colors.primary}
              />
              <ThemedText type="body-medium" style={styles.infoText}>
                {facility.contact_phone}
              </ThemedText>
            </View>
          )}

          {/* Operating Hours */}
          {facility.operating_hours && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color={colors.primary}
              />
              <ThemedText type="body-medium" style={styles.infoText}>
                {facility.operating_hours}
              </ThemedText>
            </View>
          )}

          {/* Capacity for evacuation centers */}
          {facility.facility_type === 'evacuation_center' &&
            facility.capacity && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={20}
                  color={colors.primary}
                />
                <ThemedText type="body-medium" style={styles.infoText}>
                  Capacity: {facility.capacity} persons
                </ThemedText>
              </View>
            )}

          {/* Description */}
          {facility.description && (
            <View style={styles.descriptionSection}>
              <ThemedText type="body-medium" style={styles.description}>
                {facility.description}
              </ThemedText>
            </View>
          )}
        </View>
      }
      bottomActionButton={
        <View style={styles.buttonRow}>
          {(facility.emergency_hotline || facility.contact_phone) && (
            <Button
              label="Call"
              onPress={() =>
                handleCall(
                  facility.emergency_hotline || facility.contact_phone || ''
                )
              }
              variant="solid"
              color="error"
              startIcon="phone"
              style={styles.actionButton}
            />
          )}
          <Button
            label="Directions"
            onPress={handleDirections}
            variant="solid"
            color="primary"
            startIcon="directions"
            style={styles.actionButton}
          />
        </View>
      }
    />
  );
};

export default EmergencyFacilityBottomSheet;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  imageContainer: {
    position: 'relative',
    height: 160,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
  },
  typeText: {
    color: '#fff',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  statusText: {
    color: '#fff',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    color: '#666',
  },
  descriptionSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  description: {
    color: '#666',
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
  },
});
