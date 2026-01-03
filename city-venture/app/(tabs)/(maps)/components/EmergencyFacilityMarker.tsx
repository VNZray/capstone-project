/**
 * Emergency Facility Marker Component
 * Custom marker for displaying emergency facilities on the map
 */

import React from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type {
  EmergencyFacility,
  FacilityType,
} from '@/types/EmergencyFacility';

const { width } = Dimensions.get('window');
const MARKER_SIZE = width * 0.1;
const ICON_SIZE = MARKER_SIZE * 0.55;
const ARROW_SIZE = MARKER_SIZE * 0.2;

interface EmergencyFacilityMarkerProps {
  facility: EmergencyFacility;
  onPress: () => void;
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

const EmergencyFacilityMarker: React.FC<EmergencyFacilityMarkerProps> = ({
  facility,
  onPress,
}) => {
  const latitude = Number(facility.latitude) || 0;
  const longitude = Number(facility.longitude) || 0;
  const color = FACILITY_COLORS[facility.facility_type];
  const iconName = FACILITY_ICONS[facility.facility_type] as any;

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      onPress={onPress}
      style={{ alignItems: 'center', justifyContent: 'center' }}
    >
      <View style={styles.markerContainer}>
        <View style={[styles.markerCircle, { backgroundColor: color }]}>
          <MaterialCommunityIcons
            name={iconName}
            size={ICON_SIZE}
            color="#FFFFFF"
          />
        </View>
        <View style={[styles.markerArrow, { borderTopColor: color }]} />
      </View>
    </Marker>
  );
};

export default EmergencyFacilityMarker;

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerCircle: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: ARROW_SIZE,
    borderRightWidth: ARROW_SIZE,
    borderTopWidth: ARROW_SIZE * 1.5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
});
