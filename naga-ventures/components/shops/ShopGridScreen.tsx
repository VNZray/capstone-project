import ShopCard from '@/components/shops/ShopCard';
import { ShopColors } from '@/constants/ShopColors';
import type { ShopData } from '@/types/shop';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const NUM_COLUMNS = 2;
const CARD_WIDTH = (width - CARD_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

interface ShopGridScreenProps {
  title: string;
  shops: ShopData[];
  isLoading: boolean;
  isError: boolean;
  onRefresh: () => void;
  emptyMessage: string;
  isRefreshing?: boolean;
}

const ShopGridScreen: React.FC<ShopGridScreenProps> = ({
  title,
  shops,
  isLoading,
  isError,
  onRefresh,
  emptyMessage,
  isRefreshing = false,
}) => {
  const handleShopPress = (shopId: string) => {
    router.push(`/TouristApp/(tabs)/(home)/(shops)/(details)/${shopId}`);
  };

  const renderShopItem = ({ item }: { item: ShopData }) => (
    <View style={styles.cardWrapper}>
      <ShopCard
        shop={item}
        onPress={handleShopPress}
        showRating={true}
        showCategory={true}
        width={CARD_WIDTH}
      />
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ShopColors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: ShopColors.cardBackground,
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: 'Poppins-SemiBold',
      color: ShopColors.textPrimary,
      flex: 1,
    },
    listContentContainer: {
      paddingHorizontal: CARD_MARGIN,
      paddingVertical: 16,
    },
    cardWrapper: {
      margin: CARD_MARGIN / 2,
      width: CARD_WIDTH,
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: 'Poppins-Regular',
      color: ShopColors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    loadingText: {
      marginTop: 10,
      fontFamily: 'Poppins-Regular',
      color: ShopColors.textSecondary,
    },
    errorText: {
      fontSize: 16,
      fontFamily: 'Poppins-Regular',
      color: ShopColors.error,
      textAlign: 'center',
      marginTop: 8,
    },
    retryButton: {
      marginTop: 16,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: ShopColors.accent,
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#FFFFFF',
      fontFamily: 'Poppins-SemiBold',
      fontSize: 14,
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={ShopColors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        <View style={styles.centeredView}>
          <ActivityIndicator size="large" color={ShopColors.accent} />
          <Text style={styles.loadingText}>Loading {title}...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={ShopColors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        <View style={styles.centeredView}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={ShopColors.error}
            style={styles.emptyIcon}
          />
          <Text style={styles.headerTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>
            Failed to load {title.toLowerCase()}. Please try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={ShopColors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      {shops.length > 0 ? (
        <FlatList
          data={shops}
          renderItem={renderShopItem}
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[ShopColors.accent]}
              tintColor={ShopColors.accent}
            />
          }
        />
      ) : (
        <View style={styles.centeredView}>
          <Ionicons
            name="star-outline"
            size={48}
            color={ShopColors.textSecondary}
            style={styles.emptyIcon}
          />
          <Text style={styles.headerTitle}>No {title}</Text>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ShopGridScreen;
