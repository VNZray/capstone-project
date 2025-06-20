// Main tourist spots directory page that displays all tourist spots in Naga City
// Features a search bar, featured locations carousel, category navigation, and a grid of all spots

import CardContainer from '@/components/CardContainer';
import EmptyState from '@/components/EmptyState';
import PressableButton from '@/components/PressableButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import SearchBar from '@/components/touristSpot/TouristSearchBar';
import TouristSpotCard from '@/components/touristSpot/TouristSpotCard';
import { Colors } from '@/constants/Colors';
import { useTouristSpots } from '@/context/TouristSpotContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Get screen width for carousel sizing
const width = Dimensions.get('window').width;

const TouristSpotDirectory: React.FC = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const color = colorScheme === 'dark' ? '#fff' : '#000';
  const { getCategories, getDestinations, searchSpots } = useTouristSpots();

  // State for search functionality
  const [searchQuery, setSearchQuery] = useState('');

  // Navigation handlers
  const handleCategoryPress = (categoryId: string) => {
    router.push(
      `/(tabs)/(home)/(touristSpots)/(categories)/${categoryId}`
    );
  };

  const handleDestinationPress = (destinationId: string) => {
    router.push(
      `/(tabs)/(home)/(touristSpots)/(spots)/${destinationId}`
    );
  };

  // Get categories and destinations
  const categories = getCategories();
  const destinations = getDestinations();

  // Filter spots based on search query
  const filteredSpots = useMemo(() => {
    if (!searchQuery.trim()) return destinations;

    return searchSpots(searchQuery);
  }, [searchQuery, destinations, searchSpots]);

  return (
    <SafeAreaProvider>
      <ThemedView style={styles.container}>
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        />

        {/* Search bar for filtering spots */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search tourist spots..."
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Featured Locations Carousel - Only shown when not searching */}
          {!searchQuery.trim() && (
            <View style={styles.sectionContainer}>
              <ThemedText type="subtitle" style={styles.CarouselTitle}>
                Featured Locations
              </ThemedText>
              <View style={{ height: 200 }}>
                <Carousel
                  loop
                  width={width - 50}
                  height={200}
                  mode="parallax"
                  data={destinations.slice(0, 3)}
                  scrollAnimationDuration={1000}
                  renderItem={({ item: spot }) => (
                    <TouristSpotCard
                      key={spot.id}
                      spot={{
                        ...spot,
                        description: '',
                        location: '',
                      }}
                      onPress={() => handleDestinationPress(spot.id)}
                      variant="carousel"
                    />
                  )}
                />
              </View>
            </View>
          )}

          {/* Categories Section - Only shown when not searching */}
          {!searchQuery.trim() && (
            <View style={styles.sectionContainer}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Categories
              </ThemedText>
              <CardContainer style={styles.directories} height={'auto'}>
                {categories.map((category) => (
                  <PressableButton
                    key={category.id}
                    IconSize={24}
                    color={Colors[colorScheme].text}
                    direction="column"
                    Title={category.name}
                    Icon={category.icon}
                    onPress={() => handleCategoryPress(category.id)}
                  />
                ))}
              </CardContainer>
            </View>
          )}

          {/* Discover More / Search Results Section */}
          <View style={[styles.sectionContainer, { marginBottom: 100 }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {searchQuery ? 'Search Results' : 'Discover More'}
            </ThemedText>
            <View style={styles.destinationsGrid}>
              {filteredSpots.map((spot) => (
                <TouristSpotCard
                  key={spot.id}
                  spot={{
                    ...spot,
                    description: '',
                    location: '',
                  }}
                  onPress={() => handleDestinationPress(spot.id)}
                  variant="grid"
                />
              ))}
              {filteredSpots.length === 0 && (
                <EmptyState
                  message={`No tourist spots found matching "${searchQuery}"`}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  directories: {
    flex: 1,
    width: '100%',
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 10,
  },
  CarouselTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: -10,
  },
  destinationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default TouristSpotDirectory;
