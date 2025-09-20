import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/components/Button';
import Tabs from '@/components/Tabs';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

import Container from '@/components/Container';
import { background, colors } from '@/constants/color';
import { useAuth } from '@/context/AuthContext';
import { useRoom } from '@/context/RoomContext';
import { Tab } from '@/types/Tab';
import Details from './details';
import Photos from './photos';
import Ratings from './ratings';

const { width, height } = Dimensions.get('window');

const AccommodationProfile = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<string>('details');
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const { roomDetails } = useRoom();

  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(5);
  const [modalVisible, setModalVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | ''>(
    ''
  );
  const bg = colorScheme === 'dark' ? background.dark : background.light;

  useEffect(() => {
    if (roomDetails?.room_type && roomDetails?.id) {
      navigation.setOptions({
        headerTitle: roomDetails.room_type,
      });
    }
  }, [navigation, roomDetails?.room_type, roomDetails?.id]);

  const [averageAccommodationReviews, setAverageAccommodationReviews] =
    useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const formattedPrice = useMemo(() => {
    const raw = roomDetails?.room_price as any;
    if (raw == null) return '';
    if (typeof raw === 'number') {
      return (
        '₱' +
        raw.toLocaleString('en-PH', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    }
    const str = String(raw).trim();
    // Extract numeric part (allow digits & one decimal point)
    const numeric = str.replace(/[^0-9.]/g, '');
    if (!numeric) return str;
    const num = Number(numeric);
    if (isNaN(num)) return str; // cannot parse
    return (
      '₱' +
      num.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }, [roomDetails?.room_price]);

  const TABS: Tab[] = [
    { key: 'details', label: 'Details', icon: '' },
    { key: 'photos', label: 'Photos', icon: '' },
    { key: 'ratings', label: 'Ratings', icon: '' },
  ];

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab.key);
  };

  const actionLabel = activeTab === 'ratings' ? 'Write a Review' : 'Book Now';
  const primaryIcon = activeTab === 'ratings' ? 'comment' : 'calendar-check';
  const handlePrimaryAction = () => {
    if (activeTab === 'ratings') {
      // trigger review flow (placeholder)
      console.log('Open write review modal');
    } else {
      console.log('Navigate to booking flow');
    }
  };

  if (!roomDetails) {
    return (
      <View style={styles.notFoundContainer}>
        <ThemedText type="title-large">Room not found.</ThemedText>
        <ThemedText type="sub-title-large" style={{ textAlign: 'center' }}>
          Please go back and select a valid room.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={[]}
        keyExtractor={() => 'header'}
        renderItem={() => null}
        contentContainerStyle={{ paddingBottom: 140 }}
        ListHeaderComponent={
          <>
            <Image
              source={{
                uri:
                  roomDetails?.room_image ||
                  'https://via.placeholder.com/400x300',
              }}
              style={styles.image}
              resizeMode="cover"
            />

            <Container padding={16} backgroundColor={bg}>
              <Container
                padding={0}
                backgroundColor="transparent"
                direction="row"
                justify="space-between"
              >
                <View>
                  <ThemedText type="card-title-medium" weight="bold">
                    Room {roomDetails?.room_number}
                  </ThemedText>
                  <ThemedText type="body-small">
                    Size: {roomDetails?.floor}sqm
                  </ThemedText>

                  <ThemedText
                    darkColor={colors.warning}
                    weight="medium"
                    lightColor={colors.warning}
                    type="sub-title-large"
                    style={{ marginTop: 4 }}
                  >
                    {formattedPrice}
                  </ThemedText>
                </View>
                <View>
                  <ThemedText type="body-medium">
                    <MaterialCommunityIcons
                      name="star"
                      size={20}
                      color="#FFB007"
                    />
                    {averageAccommodationReviews.toFixed(1) || '0.0'} (100)
                  </ThemedText>
                </View>
              </Container>

              <Tabs tabs={TABS} onTabChange={handleTabChange} />
            </Container>

            <View style={styles.tabContent}>
              {activeTab === 'details' && <Details />}
              {activeTab === 'photos' && <Photos />}
              {activeTab === 'ratings' && <Ratings />}
            </View>
          </>
        }
      />
      {/* Floating Action Bar */}
      <View style={[styles.fabBar, { paddingBottom: 62 + insets.bottom }]}>
        {activeTab !== 'ratings' && (
          <Button
            icon
            variant={isFavorite ? 'soft' : 'soft'}
            color={isFavorite ? 'error' : 'primary'}
            startIcon={isFavorite ? 'heart' : 'heart'}
            onPress={() => setIsFavorite((f) => !f)}
            elevation={isFavorite ? 3 : 2}
          />
        )}
        <Button
          label={actionLabel}
          fullWidth
          startIcon={primaryIcon}
          color="primary"
          variant="solid"
          onPress={handlePrimaryAction}
          elevation={3}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: width * 1,
    height: height * 0.4,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tabContent: {
    marginBottom: 150,
    overflow: 'visible',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: 16,
    backgroundColor: 'transparent',
    marginBottom: 80,
  },
  fabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    // subtle backdrop & blur alternative (blur not added by default RN)
  },
});

export default AccommodationProfile;
