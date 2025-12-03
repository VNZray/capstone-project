import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import Button from '@/components/Button';

/**
 * ProductDetailsModal - Modal screen for viewing product details.
 * Accessible from any tab via Routes.modals.productDetails(id)
 */
export default function ProductDetailsModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<{
    id: string;
    name: string;
    description?: string;
    image?: string;
    price: number;
    category?: string;
    stock?: number;
    businessId?: string;
    businessName?: string;
  } | null>(null);

  useEffect(() => {
    // TODO: Fetch product data using the id
    // For now, simulate loading with placeholder data
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // Simulated fetch - replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        setProduct({
          id: id || '',
          name: 'Sample Product',
          description:
            'This is a placeholder description for the product. It provides detailed information about the product features, materials, and usage.',
          price: 299.99,
          category: 'Tourism Goods',
          stock: 50,
          businessName: 'Sample Shop',
        });
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    // TODO: Integrate with actual cart context when product data structure is aligned
    // For now, show a placeholder message
    console.log('[ProductDetails] Add to cart:', product.id, product.name);
    
    // Close modal after action
    router.back();
  };

  const formatPrice = (price: number) => {
    return (
      '₱' +
      price.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="package-variant-remove" size={64} color="#666" />
        <ThemedText type="title-large" style={styles.errorTitle}>
          Product Not Found
        </ThemedText>
        <ThemedText type="body-medium" style={styles.errorMessage}>
          The product you are looking for does not exist or has been removed.
        </ThemedText>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Text style={styles.closeButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {product.image ? (
            <Image source={{ uri: product.image }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons name="package-variant" size={64} color="#ccc" />
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <ThemedText type="title-large" weight="bold">
                {product.name}
              </ThemedText>
              {product.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{product.category}</Text>
                </View>
              )}
            </View>
            <ThemedText
              type="title-medium"
              weight="bold"
              style={styles.price}
            >
              {formatPrice(product.price)}
            </ThemedText>
          </View>

          {product.businessName && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="store" size={20} color="#666" />
              <ThemedText type="body-medium" style={styles.infoText}>
                Sold by {product.businessName}
              </ThemedText>
            </View>
          )}

          {product.stock !== undefined && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name={product.stock > 0 ? 'check-circle' : 'close-circle'}
                size={20}
                color={product.stock > 0 ? '#4CAF50' : '#F44336'}
              />
              <ThemedText
                type="body-medium"
                style={[
                  styles.infoText,
                  { color: product.stock > 0 ? '#4CAF50' : '#F44336' },
                ]}
              >
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </ThemedText>
            </View>
          )}

          {product.description && (
            <View style={styles.descriptionSection}>
              <ThemedText type="sub-title-medium" weight="semi-bold">
                Description
              </ThemedText>
              <ThemedText type="body-medium" style={styles.description}>
                {product.description}
              </ThemedText>
            </View>
          )}

          <Text style={styles.idText}>Product ID: {id}</Text>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        style={[
          styles.actionBar,
          { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 },
        ]}
      >
        <Button
          label="Close"
          variant="outlined"
          color="secondary"
          style={styles.actionButton}
          onPress={() => router.back()}
        />
        <Button
          label="Add to Cart"
          variant="solid"
          color="primary"
          startIcon="cart-plus"
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleAddToCart}
          disabled={!product.stock || product.stock <= 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
    maxWidth: 280,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
    paddingRight: 16,
  },
  price: {
    color: Colors.light.tint,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: Colors.light.tint + '20',
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.light.tint,
    fontFamily: 'Poppins-Medium',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  infoText: {
    color: '#666',
  },
  descriptionSection: {
    marginTop: 24,
  },
  description: {
    marginTop: 8,
    color: '#666',
    lineHeight: 22,
  },
  idText: {
    marginTop: 24,
    fontSize: 12,
    color: '#999',
    fontFamily: 'Poppins-Regular',
  },
  closeButton: {
    marginTop: 24,
    padding: 16,
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  primaryButton: {
    flex: 2,
  },
});
