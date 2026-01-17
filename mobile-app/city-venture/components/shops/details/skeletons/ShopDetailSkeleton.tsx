import { ShopColors } from '@/constants/color';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const PlaceholderBlock = ({ height }: { height: number }) => (
  <View style={[styles.placeholder, { height }]} />
);

const ShopDetailSkeleton: React.FC = () => (
  <View style={styles.container}>
    <View style={styles.hero} />
    <View style={styles.section}>
      <View style={styles.blockSpacing}>
        <PlaceholderBlock height={24} />
      </View>
      <View style={styles.blockSpacing}>
        <PlaceholderBlock height={16} />
      </View>
    </View>
    <View style={styles.section}>
      <View style={styles.blockSpacing}>
        <PlaceholderBlock height={200} />
      </View>
      <View style={styles.blockSpacing}>
        <PlaceholderBlock height={200} />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ShopColors.background,
    padding: 16,
  },
  hero: {
    height: 220,
    borderRadius: 20,
    backgroundColor: ShopColors.border,
    marginBottom: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  placeholder: {
    borderRadius: 12,
    backgroundColor: ShopColors.border,
  },
  blockSpacing: {
    marginBottom: 12,
  },
});

export default ShopDetailSkeleton;
