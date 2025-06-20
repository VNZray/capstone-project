import { ShopColors } from '@/constants/ShopColors';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const SpecialOfferDetailSkeleton = () => {
  return (
    <View style={styles.container}>
      <View style={styles.imagePlaceholder} />
      <View style={styles.contentContainer}>
        <View style={styles.titlePlaceholder} />
        <View style={styles.linePlaceholder} />
        <View style={[styles.linePlaceholder, { width: '60%' }]} />
        <View style={[styles.titlePlaceholder, { marginTop: 30 }]} />
        <View style={styles.linePlaceholder} />
        <View style={styles.linePlaceholder} />
        <View style={[styles.linePlaceholder, { width: '80%' }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ShopColors.background,
  },
  imagePlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: ShopColors.border,
    borderRadius: 4,
  },
  contentContainer: {
    padding: 20,
  },
  titlePlaceholder: {
    height: 28,
    width: '70%',
    marginBottom: 16,
    borderRadius: 4,
    backgroundColor: ShopColors.border,
  },
  linePlaceholder: {
    height: 16,
    width: '100%',
    marginBottom: 10,
    borderRadius: 4,
    backgroundColor: ShopColors.border,
  },
});

export default SpecialOfferDetailSkeleton;
