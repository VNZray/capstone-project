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
 * UserProfileModal - Modal screen for viewing user profiles.
 * Accessible from any tab via Routes.modals.userProfile(id)
 */
export default function UserProfileModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    bio?: string;
    joinDate?: string;
  } | null>(null);

  useEffect(() => {
    // TODO: Fetch user data using the id
    // For now, simulate loading with placeholder data
    const fetchUser = async () => {
      setLoading(true);
      try {
        // Simulated fetch - replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        setUser({
          id: id || '',
          name: 'Sample User',
          email: 'user@example.com',
          bio: 'This is a placeholder bio for the user profile.',
          joinDate: 'January 2024',
        });
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="account-alert-outline" size={64} color="#666" />
        <ThemedText type="title-large" style={styles.errorTitle}>
          User Not Found
        </ThemedText>
        <ThemedText type="body-medium" style={styles.errorMessage}>
          The user you are looking for does not exist or has been removed.
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
      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <MaterialCommunityIcons name="account" size={64} color="#999" />
          </View>
        )}
      </View>

      {/* User Info */}
      <View style={styles.content}>
        <ThemedText type="title-large" weight="bold" style={styles.name}>
          {user.name}
        </ThemedText>

        {user.email && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#666" />
            <ThemedText type="body-medium" style={styles.infoText}>
              {user.email}
            </ThemedText>
          </View>
        )}

        {user.joinDate && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={20} color="#666" />
            <ThemedText type="body-medium" style={styles.infoText}>
              Member since {user.joinDate}
            </ThemedText>
          </View>
        )}

        {user.bio && (
          <View style={styles.bioSection}>
            <ThemedText type="sub-title-medium" weight="semi-bold">
              About
            </ThemedText>
            <ThemedText type="body-medium" style={styles.bio}>
              {user.bio}
            </ThemedText>
          </View>
        )}

        <Text style={styles.idText}>User ID: {id}</Text>

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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#f8f8f8',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  content: {
    padding: 20,
  },
  name: {
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  infoText: {
    color: '#666',
  },
  bioSection: {
    marginTop: 24,
  },
  bio: {
    marginTop: 8,
    color: '#666',
    lineHeight: 22,
  },
  idText: {
    marginTop: 24,
    fontSize: 12,
    color: '#999',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
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
