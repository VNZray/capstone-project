import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import PageContainer from '@/components/PageContainer';
import { fetchProductsByBusinessId } from '@/services/ProductService';
import { fetchServicesByBusinessId } from '@/services/ServiceService';
import { fetchBusinessDetails } from '@/services/BusinessService';
import type { Product } from '@/types/Product';
import type { Service } from '@/types/Service';
import type { Business } from '@/types/Business';

const BusinessDetails = () => {
  const { businessId } = useLocalSearchParams<{ businessId: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const type = useTypography();

  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'services'>('products');

  const palette = {
    bg: isDark ? '#0D1B2A' : '#F8F9FA',
    card: isDark ? '#1C2833' : '#FFFFFF',
    text: isDark ? '#ECEDEE' : '#0D1B2A',
    subText: isDark ? '#9BA1A6' : '#6B7280',
    border: isDark ? '#2A2F36' : '#E5E8EC',
    tabActive: colors.primary,
    tabInactive: isDark ? '#4A5568' : '#CBD5E0',
  };

  const loadBusinessData = async () => {
    if (!businessId) {
      setError('No business ID provided');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const [businessData, productsData, servicesData] = await Promise.all([
        fetchBusinessDetails(businessId),
        fetchProductsByBusinessId(businessId).catch((err) => {
          console.log('⚠️ No products found for business:', businessId);
          return [];
        }),
        fetchServicesByBusinessId(businessId).catch((err) => {
          console.log('⚠️ No services found for business:', businessId);
          return [];
        }),
      ]);

      console.log('📦 Products loaded:', productsData.length);
      console.log('💼 Services loaded:', servicesData.length);

      // Validate and filter products
      const validProducts = productsData.filter(p => {
        if (!p.price && p.price !== 0) {
          console.warn('⚠️ Product missing price:', p.name, p);
          return false;
        }
        return p.status === 'active';
      });

      // Validate and filter services
      const validServices = servicesData.filter(s => {
        if (!s.base_price && s.base_price !== 0) {
          console.warn('⚠️ Service missing base_price:', s.name, s);
          return false;
        }
        return s.status === 'active';
      });

      setBusiness(businessData);
      setProducts(validProducts);
      setServices(validServices);
      
      console.log('✅ Valid products:', validProducts.length);
      console.log('✅ Valid services:', validServices.length);
    } catch (err: any) {
      console.error('❌ Error loading business data:', err);
      setError(err.message || 'Failed to load business data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBusinessData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadBusinessData();
  };

  const formatPrice = (price?: number | null) => {
    if (price === null || price === undefined || isNaN(price)) {
      return '₱0.00';
    }
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `₱${numPrice.toFixed(2)}`;
  };

  const getPriceDisplay = (service: Service) => {
    const basePrice = formatPrice(service.base_price);
    switch (service.price_type) {
      case 'per_hour':
        return `${basePrice}/hr`;
      case 'per_person':
        return `${basePrice}/person`;
      case 'custom':
        return `${basePrice} (custom)`;
      default:
        return basePrice;
    }
  };

  const renderProductItem = (product: Product) => (
    <Pressable
      key={product.id}
      style={[styles.itemCard, { backgroundColor: palette.card, borderColor: palette.border }]}
      onPress={() => console.log('Product pressed:', product.id)}
    >
      <Image
        source={
          product.image_url
            ? { uri: product.image_url }
            : require('@/assets/images/placeholder.png')
        }
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemContent}>
        <Text
          style={{ fontSize: type.h4, fontWeight: '600', color: palette.text }}
          numberOfLines={2}
        >
          {product.name}
        </Text>
        {product.description && (
          <Text
            style={{ fontSize: type.bodySmall, color: palette.subText, marginTop: 4 }}
            numberOfLines={2}
          >
            {product.description}
          </Text>
        )}
        <View style={styles.priceRow}>
          <Text style={{ fontSize: type.h4, fontWeight: '700', color: colors.primary }}>
            {formatPrice(product.price)}
          </Text>
          {product.stock_unit && product.current_stock !== undefined && (
            <Text style={{ fontSize: type.caption, color: palette.subText }}>
              Stock: {product.current_stock} {product.stock_unit}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );

  const renderServiceItem = (service: Service) => (
    <Pressable
      key={service.id}
      style={[styles.itemCard, { backgroundColor: palette.card, borderColor: palette.border }]}
      onPress={() => console.log('Service pressed:', service.id)}
    >
      <View style={styles.serviceContent}>
        <Text
          style={{ fontSize: type.h4, fontWeight: '600', color: palette.text }}
          numberOfLines={2}
        >
          {service.name}
        </Text>
        {service.description && (
          <Text
            style={{ fontSize: type.bodySmall, color: palette.subText, marginTop: 4 }}
            numberOfLines={3}
          >
            {service.description}
          </Text>
        )}
        <View style={styles.serviceDetails}>
          <Text style={{ fontSize: type.h4, fontWeight: '700', color: colors.primary }}>
            {getPriceDisplay(service)}
          </Text>
          {service.duration_value && service.duration_unit && (
            <Text style={{ fontSize: type.caption, color: palette.subText }}>
              Duration: {service.duration_value} {service.duration_unit}
            </Text>
          )}
          {service.capacity && (
            <Text style={{ fontSize: type.caption, color: palette.subText }}>
              Capacity: {service.capacity} {service.capacity === 1 ? 'person' : 'people'}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <PageContainer>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ fontSize: type.body, color: palette.text, marginTop: 16 }}>
              Loading business...
            </Text>
          </View>
        </PageContainer>
      </>
    );
  }

  if (error || !business) {
    return (
      <>
        <Stack.Screen options={{ title: 'Error' }} />
        <PageContainer>
          <View style={styles.centerContainer}>
            <Text style={{ fontSize: type.h3, color: colors.error, marginBottom: 8, fontWeight: '600' }}>
              Error
            </Text>
            <Text style={{ fontSize: type.body, color: palette.subText, textAlign: 'center' }}>
              {error || 'Business not found'}
            </Text>
          </View>
        </PageContainer>
      </>
    );
  }

  const hasProducts = products.length > 0;
  const hasServices = services.length > 0;
  const showTabs = hasProducts && hasServices;

  return (
    <>
      <Stack.Screen options={{ title: business.business_name }} />
      <PageContainer>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Business Header */}
          <View style={[styles.header, { backgroundColor: palette.card }]}>
            <Image
              source={
                business.business_image
                  ? { uri: business.business_image }
                  : require('@/assets/images/placeholder.png')
              }
              style={styles.businessImage}
              resizeMode="cover"
            />
            <View style={styles.headerContent}>
              <Text style={{ fontSize: type.h2, fontWeight: '700', color: palette.text }}>
                {business.business_name}
              </Text>
              {business.description && (
                <Text style={{ fontSize: type.body, color: palette.subText, marginTop: 8 }}>
                  {business.description}
                </Text>
              )}
            </View>
          </View>

          {/* Tabs */}
          {showTabs && (
            <View style={[styles.tabs, { borderBottomColor: palette.border }]}>
              <Pressable
                style={[
                  styles.tab,
                  activeTab === 'products' && {
                    borderBottomColor: palette.tabActive,
                    borderBottomWidth: 3,
                  },
                ]}
                onPress={() => setActiveTab('products')}
              >
                <Text
                  style={{
                    fontSize: type.body,
                    fontWeight: '600',
                    color: activeTab === 'products' ? palette.tabActive : palette.subText,
                  }}
                >
                  Products ({products.length})
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.tab,
                  activeTab === 'services' && {
                    borderBottomColor: palette.tabActive,
                    borderBottomWidth: 3,
                  },
                ]}
                onPress={() => setActiveTab('services')}
              >
                <Text
                  style={{
                    fontSize: type.body,
                    fontWeight: '600',
                    color: activeTab === 'services' ? palette.tabActive : palette.subText,
                  }}
                >
                  Services ({services.length})
                </Text>
              </Pressable>
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>
            {activeTab === 'products' || !showTabs ? (
              hasProducts ? (
                <>
                  <Text style={{ fontSize: type.h3, fontWeight: '600', color: palette.text, marginBottom: 16 }}>
                    Products
                  </Text>
                  {products.map(renderProductItem)}
                </>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={{ fontSize: type.body, color: palette.subText }}>
                    No products available
                  </Text>
                </View>
              )
            ) : null}

            {activeTab === 'services' || !showTabs ? (
              hasServices ? (
                <>
                  <Text style={{ fontSize: type.h3, fontWeight: '600', color: palette.text, marginBottom: 16 }}>
                    Services
                  </Text>
                  {services.map(renderServiceItem)}
                </>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={{ fontSize: type.body, color: palette.subText }}>
                    No services available
                  </Text>
                </View>
              )
            ) : null}
          </View>
        </ScrollView>
      </PageContainer>
    </>
  );
};

export default BusinessDetails;

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  header: {
    padding: 16,
    marginBottom: 16,
  },
  businessImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  headerContent: {
    gap: 4,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  itemCard: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  itemImage: {
    width: 100,
    height: 100,
  },
  itemContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  serviceContent: {
    flex: 1,
    padding: 16,
  },
  serviceDetails: {
    marginTop: 12,
    gap: 4,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
});
