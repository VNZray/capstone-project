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

/**
 * BusinessProfileModal - Modal screen for viewing business details.
 * Accessible from any tab via Routes.modals.businessProfile(id)
 */
export default function BusinessProfileModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<{
    id: string;
    name: string;
    description?: string;
    image?: string;
    category?: string;
    address?: string;
    rating?: number;
  } | null>(null);

  useEffect(() => {
    // TODO: Fetch business data using the id
    // For now, simulate loading with placeholder data
    const fetchBusiness = async () => {
      setLoading(true);
      try {
        // Simulated fetch - replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        setBusiness({
          id: id || '',
          name: 'Sample Business',
          description: 'This is a placeholder for the business description.',
          category: 'Tourism',
          address: 'City Venture Location',
          rating: 4.5,
        });
      } catch (error) {
        console.error('Failed to fetch business:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBusiness();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Loading business...</Text>
      </View>
    );
  }

  if (!business) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#666" />
        <ThemedText type="title-large" style={styles.errorTitle}>
          Business Not Found
        </ThemedText>
        <ThemedText type="body-medium" style={styles.errorMessage}>
          The business you are looking for does not exist or has been removed.
        </ThemedText>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Text style={styles.closeButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      {/* Business Image Placeholder */}
      <View style={styles.imageContainer}>
        {business.image ? (
          <Image source={{ uri: business.image }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialCommunityIcons name="store" size={64} color="#ccc" />
          </View>
        )}
      </View>

      {/* Business Info */}
      <View style={styles.content}>
        <ThemedText type="title-large" weight="bold">
          {business.name}
        </ThemedText>

        {business.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{business.category}</Text>
          </View>
        )}

        {business.address && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
            <ThemedText type="body-medium" style={styles.infoText}>
              {business.address}
            </ThemedText>
          </View>
        )}

        {business.rating !== undefined && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="star" size={20} color="#FFB007" />
            <ThemedText type="body-medium" style={styles.infoText}>
              {business.rating.toFixed(1)} rating
            </ThemedText>
          </View>
        )}

        {business.description && (
          <View style={styles.descriptionSection}>
            <ThemedText type="sub-title-medium" weight="semi-bold">
              About
            </ThemedText>
            <ThemedText type="body-medium" style={styles.description}>
              {business.description}
            </ThemedText>
          </View>
        )}

        <Text style={styles.idText}>Business ID: {id}</Text>

        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Text style={styles.closeButtonText}>Close</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    height: 200,
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
});
