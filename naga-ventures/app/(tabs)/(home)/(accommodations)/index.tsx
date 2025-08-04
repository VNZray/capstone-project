import CardView from '@/components/CardView';
import SearchBar from '@/components/SearchBar';
import { ThemedText } from '@/components/ThemedText';
import { useBusiness } from '@/context/BusinessContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { colors } from '@/utils/Colors';
const width = Dimensions.get('screen').width;

const AccommodationDirectory = () => {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#151718' : '#FFFFFF';
  const isDarkMode = colorScheme === 'dark';

  const {
    filteredBusinesses,
    loading,
    filterActiveOnly,
  } = useBusiness();

  const [search, setSearch] = useState('');

  useEffect(() => {
    filterActiveOnly(); // Only show active accommodations on load
  }, []);

  // Optional: basic search logic
  const handleSearch = (text: string) => {
    setSearch(text);
  };

  // Filter based on search input
  const displayedBusinesses = filteredBusinesses.filter((business) =>
    business.business_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.SearchContainer}>
        <SearchBar
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            handleSearch(text);
          }}
          onSearch={() => handleSearch(search)}
          placeholder={'Search Accommodation or Location'}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: 86, paddingBottom: 100 }}>
        <View style={styles.cardWrapper}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color={isDarkMode ? '#fff' : '#000'}
              style={{ marginTop: 40 }}
            />
          ) : displayedBusinesses.length > 0 ? (
            displayedBusinesses.map((business) => (
              <Link
                href={`/(home)/(accommodations)/profile/${business.id}`}
                key={business.id}
              >
                <CardView
                  data={business}
                  width={width - 32}
                  height={320}
                  radius={10}
                  elevation={0}
                />
              </Link>
            ))
          ) : (
            <ThemedText style={{ textAlign: 'center', marginTop: 40 }}>
              No active accommodations found.
            </ThemedText>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  SearchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: 16,
    backgroundColor: 'transparent',
  },
  cardWrapper: {
    paddingHorizontal: 16,
    gap: 16,
  },
});

export default AccommodationDirectory;
