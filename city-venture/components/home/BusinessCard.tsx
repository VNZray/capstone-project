import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import type { PartnerBusiness } from '@/services/HomeContentService';

type Props = {
  business: PartnerBusiness;
  onPress?: (business: PartnerBusiness) => void;
};

const BusinessCard: React.FC<Props> = ({ business, onPress }) => (
  <Pressable style={styles.card} onPress={() => onPress?.(business)}>
    <LinearGradient
      colors={['#1c1b2d', '#121026']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
    <View style={styles.logoWrapper}>
      <Image
        source={{ uri: business.image }}
        style={styles.logo}
        resizeMode="cover"
      />
    </View>
    <View style={styles.info}>
      <ThemedText
        type="body-medium"
        weight="bold"
        lightColor="#FFFFFF"
        numberOfLines={2}
      >
        {business.name}
      </ThemedText>
      <View style={styles.badge}>
        <ThemedText type="label-small" lightColor="#FFEEE6">
          {business.category}
        </ThemedText>
      </View>
      {business.isVerified ? (
        <ThemedText type="label-small" lightColor="#8DFFEC">
          Verified Partner
        </ThemedText>
      ) : null}
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    width: 200,
    borderRadius: 18,
    padding: 14,
    marginRight: 16,
    overflow: 'hidden',
  },
  logoWrapper: {
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#27243E',
    marginBottom: 12,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  info: {
    gap: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
});

export default BusinessCard;
