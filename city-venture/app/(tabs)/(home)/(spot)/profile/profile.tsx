import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, View } from 'react-native';
import { useNavigation } from 'expo-router';
import Tabs from '@/components/Tabs';
import { ThemedText } from '@/components/themed-text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Container from '@/components/Container';
import { Colors } from '@/constants/color';
import { useTouristSpot } from '@/context/TouristSpotContext';
import type { Tab } from '@/types/Tab';
import Details from './details';
import Ratings from './ratings';

const { width, height } = Dimensions.get('window');

const TouristSpotProfile = () => {
  const navigation = useNavigation();
  const { selectedSpot, addressDetails } = useTouristSpot();
  const averageRating = 0;
  const [activeTab, setActiveTab] = useState('details');
  const colors = Colors.light;
  const bg = colors.background;

  useEffect(() => {
    if (selectedSpot?.name && selectedSpot?.id) {
      navigation.setOptions({ headerTitle: selectedSpot.name });
    }
  }, [navigation, selectedSpot?.name, selectedSpot?.id]);

  const TABS: Tab[] = [
    { key: 'details', label: 'Details', icon: '' },
    { key: 'reviews', label: 'Reviews', icon: '' },
  ];

  if (!selectedSpot) {
    return (
      <View style={styles.notFoundContainer}>
        <ThemedText type="title-large">Tourist spot not found.</ThemedText>
        <ThemedText type="sub-title-large" style={{ textAlign: 'center' }}>
          Please go back and select a valid tourist spot.
        </ThemedText>
      </View>
    );
  }

  const primaryImage =
    selectedSpot.images?.find(
      (i) => i.is_primary === 1 || i.is_primary === true
    ) || selectedSpot.images?.[0];

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={[]}
        keyExtractor={() => 'header'}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            <Image
              source={{
                uri:
                  primaryImage?.file_url ||
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
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <ThemedText type="card-title-medium" weight="bold">
                    {selectedSpot.name}
                  </ThemedText>
                  <ThemedText type="body-small">
                    {[
                      addressDetails?.barangay || selectedSpot?.barangay,
                      addressDetails?.municipality ||
                        selectedSpot?.municipality,
                      addressDetails?.province || selectedSpot?.province,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </ThemedText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <ThemedText type="body-small">
                    <MaterialCommunityIcons
                      name="star"
                      size={20}
                      color={colors.accent}
                    />
                    {averageRating.toFixed(1)}
                  </ThemedText>
                </View>
              </Container>
              <Tabs tabs={TABS} onTabChange={(t) => setActiveTab(t.key)} />
            </Container>
            <View style={styles.tabContent}>
              {activeTab === 'details' && <Details />}
              {activeTab === 'reviews' && <Ratings />}
            </View>
          </>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  image: { width: width * 1, height: height * 0.4 },
  tabContent: { marginBottom: 150, overflow: 'visible' },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default TouristSpotProfile;
