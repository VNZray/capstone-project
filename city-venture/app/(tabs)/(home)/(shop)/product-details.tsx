// See spec.md §4 - Tourist flow: Browse → add to cart

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import PageContainer from '@/components/PageContainer';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types/Product';
import { Ionicons } from '@expo/vector-icons';

const ProductDetails = () => {
  const params = useLocalSearchParams<{
    product: string; // JSON stringified product
    businessName: string;
  }>();
  
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const type = useTypography();
  const { h3, h4, body, bodySmall } = type;
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);

  // Parse product from params
  const product: Product = params.product ? JSON.parse(params.product as string) : null;

  if (!product) {
    return (
      <PageContainer>
        <View style={styles.errorContainer}>
          <Text style={[{ fontSize: h4 }, { color: colors.error }]}>
            Product not found
          </Text>
        </View>
      </PageContainer>
    );
  }

  const palette = {
    bg: isDark ? '#0D1B2A' : '#F8F9FA',
    card: isDark ? '#1C2833' : '#FFFFFF',
    text: isDark ? '#ECEDEE' : '#0D1B2A',
    subText: isDark ? '#9BA1A6' : '#6B7280',
    border: isDark ? '#2A2F36' : '#E5E8EC',
  };

  const price = typeof product.price === 'string' 
    ? parseFloat(product.price) 
    : product.price;

  const currentStock = typeof product.current_stock === 'string'
    ? parseInt(product.current_stock)
    : (product.current_stock || 0);

  const isAvailable = product.status === 'active' && currentStock > 0;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= currentStock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!isAvailable) {
      Alert.alert('Unavailable', 'This product is currently out of stock');
      return;
    }

    try {
      setLoading(true);
      addToCart(product, quantity, specialRequests || undefined);
      
      Alert.alert(
        'Added to Cart',
        `${quantity}x ${product.name} added to your cart`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          {
            text: 'View Cart',
            onPress: () => router.push('/(tabs)/(home)/(shop)/cart' as never),
          },
        ]
      );

      // Reset form
      setQuantity(1);
      setSpecialRequests('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: product.name,
          headerStyle: { backgroundColor: palette.card },
          headerTintColor: palette.text,
        }}
      />
      <PageContainer>
        <ScrollView
          style={[styles.container, { backgroundColor: palette.bg }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Product Image */}
          {product.image_url ? (
            <Image
              source={{ uri: product.image_url }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.productImage, styles.placeholderImage, { backgroundColor: palette.border }]}>
              <Ionicons name="image-outline" size={64} color={palette.subText} />
            </View>
          )}

          {/* Product Info */}
          <View style={[styles.infoCard, { backgroundColor: palette.card }]}>
            <Text style={[{ fontSize: h3 }, { color: palette.text, marginBottom: 8 }]}>
              {product.name}
            </Text>
            
            <Text style={[{ fontSize: h4 }, { color: colors.primary, marginBottom: 16 }]}>
              ₱{price.toFixed(2)}
            </Text>

            {/* Stock Status */}
            <View style={styles.stockRow}>
              <Text style={[{ fontSize: body }, { color: palette.subText }]}>
                Stock: {currentStock} {product.stock_unit || 'units'}
              </Text>
              {!isAvailable && (
                <View style={[styles.badge, { backgroundColor: colors.error }]}>
                  <Text style={[{ fontSize: bodySmall }, { color: '#FFF' }]}>Out of Stock</Text>
                </View>
              )}
            </View>

            {/* Description */}
            {product.description && (
              <View style={styles.section}>
                <Text style={[{ fontSize: body }, { color: palette.text, marginBottom: 4 }]}>
                  Description
                </Text>
                <Text style={[{ fontSize: bodySmall }, { color: palette.subText }]}>
                  {product.description}
                </Text>
              </View>
            )}

            {/* Quantity Selector */}
            <View style={styles.section}>
              <Text style={[{ fontSize: body }, { color: palette.text, marginBottom: 8 }]}>
                Quantity
              </Text>
              <View style={styles.quantityContainer}>
                <Pressable
                  style={[styles.quantityButton, { backgroundColor: palette.border }]}
                  onPress={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Ionicons name="remove" size={20} color={palette.text} />
                </Pressable>
                
                <Text style={[{ fontSize: h3 }, { color: palette.text, marginHorizontal: 24 }]}>
                  {quantity}
                </Text>
                
                <Pressable
                  style={[styles.quantityButton, { backgroundColor: palette.border }]}
                  onPress={() => handleQuantityChange(1)}
                  disabled={quantity >= currentStock}
                >
                  <Ionicons name="add" size={20} color={palette.text} />
                </Pressable>
              </View>
            </View>

            {/* Special Requests */}
            <View style={styles.section}>
              <Text style={[{ fontSize: body }, { color: palette.text, marginBottom: 8 }]}>
                Special Requests (Optional)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: palette.bg,
                    color: palette.text,
                    borderColor: palette.border,
                  },
                ]}
                placeholder="e.g., no onions, extra sauce"
                placeholderTextColor={palette.subText}
                value={specialRequests}
                onChangeText={setSpecialRequests}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Add to Cart Button */}
            <Pressable
              style={[
                styles.addButton,
                {
                  backgroundColor: isAvailable ? colors.primary : palette.border,
                  opacity: loading ? 0.6 : 1,
                },
              ]}
              onPress={handleAddToCart}
              disabled={!isAvailable || loading}
            >
              <Ionicons name="cart" size={20} color="#FFF" />
              <Text style={[{ fontSize: body }, { color: '#FFF', marginLeft: 8 }]}>
                {loading ? 'Adding...' : 'Add to Cart'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </PageContainer>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  productImage: {
    width: '100%',
    height: 300,
    borderRadius: 0,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  section: {
    marginTop: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProductDetails;
