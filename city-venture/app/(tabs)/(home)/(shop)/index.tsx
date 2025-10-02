import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import ShopCard from '@/components/ShopCard';
import PageContainer from '@/components/PageContainer';
import { fetchAllBusinessDetails } from '@/services/BusinessService';
import type { Business } from '@/types/Business';

const Shop = () => {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const type = useTypography();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const palette = {
    bg: isDark ? '#0D1B2A' : '#F8F9FA',
    card: isDark ? '#1C2833' : '#FFFFFF',
    text: isDark ? '#ECEDEE' : '#0D1B2A',
    subText: isDark ? '#9BA1A6' : '#6B7280',
    border: isDark ? '#2A2F36' : '#E5E8EC',
  };

  const loadBusinesses = async () => {
    try {
      setError(null);
      const data = await fetchAllBusinessDetails();
      console.log('📊 Businesses fetched:', data.length);
      console.log('📊 Business statuses:', data.map(b => ({ name: b.business_name, status: b.status })));
      
      // Filter only active/approved businesses
      const activeBusinesses = data.filter(b => 
        b.status === 'Approved' || b.status === 'Active'
      );
      console.log('✅ Active businesses:', activeBusinesses.length);
      setBusinesses(activeBusinesses);
    } catch (err: any) {
      console.error('❌ Error loading businesses:', err);
      setError(err.message || 'Failed to load businesses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadBusinesses();
  };

  const handleBusinessPress = (business: Business) => {
    // Using a simpler navigation approach
    router.push(`/(tabs)/(home)/(shop)/business-details?businessId=${business.id}`);
  };

  const renderBusinessCard = ({ item }: { item: Business }) => (
    <ShopCard
      image={item.business_image || require('@/assets/images/placeholder.png')}
      name={item.business_name}
      category={item.description || 'No description'}
      elevation={2}
      onPress={() => handleBusinessPress(item)}
      style={styles.card}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={{ fontSize: type.h3, color: palette.subText, fontWeight: '600' }}>
        No businesses available
      </Text>
      <Text style={{ fontSize: type.body, color: palette.subText, marginTop: 8 }}>
        Check back later for new shops and services
      </Text>
    </View>
  );

  if (loading) {
    return (
      <PageContainer>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ fontSize: type.body, color: palette.text, marginTop: 16 }}>
            Loading businesses...
          </Text>
        </View>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <View style={styles.centerContainer}>
          <Text style={{ fontSize: type.h3, color: colors.error, marginBottom: 8, fontWeight: '600' }}>
            Error
          </Text>
          <Text style={{ fontSize: type.body, color: palette.subText }}>
            {error}
          </Text>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <FlatList
        data={businesses}
        renderItem={renderBusinessCard}
        keyExtractor={(item) => item.id || ''}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </PageContainer>
  );
};

export default Shop;

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    marginBottom: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
});