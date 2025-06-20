import { ShopColors } from '@/constants/ShopColors';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

const ShopDetailSkeleton = () => {
  return (
    <View style={styles.container}>
      <View style={styles.heroPlaceholder} />
      <View style={styles.actionsPlaceholder} />
      <View style={styles.tabsPlaceholder} />
      <View style={styles.contentPlaceholder}>
        <ActivityIndicator size="large" color={ShopColors.accent} />
        <Text style={styles.loadingText}>Loading shop details...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ShopColors.background,
  },
  heroPlaceholder: {
    height: 280,
    backgroundColor: ShopColors.border,
  },
  actionsPlaceholder: {
    height: 60,
    backgroundColor: ShopColors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: ShopColors.border,
    marginVertical: 10,
  },
  tabsPlaceholder: {
    height: 50,
    backgroundColor: ShopColors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: ShopColors.border,
  },
  contentPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
});

export default ShopDetailSkeleton;
