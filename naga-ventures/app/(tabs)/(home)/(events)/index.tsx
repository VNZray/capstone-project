/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { events } from '@/Controller/EventData';
import CardContainer from '@/components/CardContainer';
import SearchBar from '@/components/SearchBar';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type EventImageProps = {
  source: { uri: string };
  style?: any;
};

const EventImage: React.FC<EventImageProps> = ({ source, style }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <View
      style={[
        style,
        {
          backgroundColor: '#f0f0f0',
          justifyContent: 'center',
          alignItems: 'center',
        },
      ]}
    >
      {isLoading && <ActivityIndicator size="large" color="#0A2342" />}
      {hasError ? (
        <FontAwesome5 name="image" size={24} color="#666" />
      ) : (
        <Image
          source={source}
          style={[style, { position: 'absolute' }]}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            console.error('Image loading error for:', source.uri);
            setHasError(true);
            setIsLoading(false);
          }}
        />
      )}
    </View>
  );
};

interface GetDaysInMonth {
  (year: number, month: number): number;
}

const getDaysInMonth: GetDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

interface GetFirstDayOfMonth {
  (year: number, month: number): number;
}

const getFirstDayOfMonth: GetFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

interface GetDaysInWeek {
  (date: Date): Date[];
}

const getDaysInWeek: GetDaysInWeek = (date) => {
  const curr = new Date(date);
  const week: Date[] = [];

  // Get Monday
  curr.setDate(curr.getDate() - curr.getDay() + 1);

  for (let i = 0; i < 7; i++) {
    week.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
  }

  return week;
};

const EventsDirectory = () => {
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredEvents, setFilteredEvents] = useState(events);
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? '#fff' : '#000';
  const backgroundColor = colorScheme === 'dark' ? '#1c1c1c' : '#fff';
  const router = useRouter();

  const calendarData = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const currentDate = selectedDate.getDate();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month) || 7; // Convert Sunday (0) to 7
    const firstDayIndex = firstDay - 1; // Adjust to 0-based index

    const days = [];
    const totalSlots = Math.ceil((daysInMonth + firstDayIndex) / 7) * 7;

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    // Add empty slots for remaining days
    while (days.length < totalSlots) {
      days.push(null);
    }

    // Group days into weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return {
      year,
      month,
      currentDate,
      weeks,
    };
  }, [selectedDate]);

  const weekDays = useMemo(() => getDaysInWeek(selectedDate), [selectedDate]);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  interface NavigateMonth {
    (direction: number): void;
  }

  const navigateMonth: NavigateMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  interface NavigateWeek {
    (direction: number): void;
  }

  const navigateWeek: NavigateWeek = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setSelectedDate(newDate);
  };

  interface HandleDateSelect {
    (date: Date): void;
  }

  const handleDateSelect: HandleDateSelect = (date) => {
    setSelectedDate(date);
  };

  interface EventType {
    id: number;
    name: string;
    location: string;
    description: string;
    date: string;
    type?: string;
    isNearby?: boolean;
    isUpcoming?: boolean;
    image: {
      src: string;
    };
  }

  interface HandleSearch {
    (text: string): void;
  }

  const handleSearch: HandleSearch = (text) => {
    setSearch(text);
    if (!text.trim()) {
      setFilteredEvents(events);
      return;
    }

    const searchQuery = text.toLowerCase().trim();
    const filtered = events.filter((event: EventType) => {
      const nameMatch = event.name?.toLowerCase().includes(searchQuery);
      const locationMatch = event.location?.toLowerCase().includes(searchQuery);
      const descriptionMatch = event.description
        ?.toLowerCase()
        .includes(searchQuery);
      return nameMatch || locationMatch || descriptionMatch;
    });
    setFilteredEvents(filtered);
  };

  interface HandleEventPress {
    (eventId: number): void;
  }

  const handleEventPress: HandleEventPress = (eventId) => {
    router.push(`/(tabs)/(home)/(events)/${eventId}`);
  };

  const renderDateSelector = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <View style={styles.dateSection}>
        <View style={styles.monthHeader}>
          <Pressable onPress={() => navigateWeek(-1)} style={styles.navButton}>
            <FontAwesome5 name="chevron-left" size={20} color={color} />
          </Pressable>
          <ThemedText type="title" style={styles.monthText}>
            {selectedDate.toLocaleString('default', { month: 'long' })}{' '}
            {selectedDate.getFullYear()}
          </ThemedText>
          <Pressable onPress={() => navigateWeek(1)} style={styles.navButton}>
            <FontAwesome5 name="chevron-right" size={20} color={color} />
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysContainer}
        >
          {weekDays.map((date, index) => {
            const isSelected =
              date.getDate() === selectedDate.getDate() &&
              date.getMonth() === selectedDate.getMonth();
            const isToday = date.getTime() === today.getTime();

            return (
              <Pressable
                key={index}
                style={styles.dayColumn}
                onPress={() => handleDateSelect(date)}
              >
                <ThemedText
                  style={[styles.dayText, isSelected && styles.selectedDayText]}
                >
                  {days[index]}
                </ThemedText>
                <View
                  style={[
                    styles.dateCircle,
                    {
                      backgroundColor:
                        colorScheme === 'dark' ? '#2c2c2c' : '#f0f0f0',
                    },
                    isSelected && styles.selectedDate,
                    isToday && styles.todayDate,
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.dateText,
                      isSelected && styles.selectedDateText,
                      isToday && styles.todayDateText,
                    ]}
                  >
                    {date.getDate()}
                  </ThemedText>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderNearbyEvents = () => {
    const nearbyEvents = filteredEvents.filter((event) => event.isNearby);

    if (nearbyEvents.length === 0 && search.trim()) {
      return null; // Don't show section if no results found
    }

    return (
      <View style={styles.eventsSection}>
        <ThemedText type="title" style={styles.sectionTitle}>
          Nearby Events
        </ThemedText>
        {nearbyEvents.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {nearbyEvents.map((event) => (
              <Pressable
                key={event.id}
                onPress={() => handleEventPress(event.id)}
              >
                <CardContainer style={styles.eventCard}>
                  <EventImage
                    source={{ uri: event.image.src }}
                    style={styles.eventImage}
                  />
                  <View style={[styles.eventInfo, { backgroundColor }]}>
                    <ThemedText type="cardTitle">{event.name}</ThemedText>
                    <ThemedText type="cardSubTitle">{event.date}</ThemedText>
                    <ThemedText type="cardSubTitle" style={styles.location}>
                      <FontAwesome5
                        name="map-marker-alt"
                        size={12}
                        color={color}
                      />{' '}
                      {event.location}
                    </ThemedText>
                  </View>
                </CardContainer>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <ThemedText style={styles.noResults}>
            No nearby events found
          </ThemedText>
        )}
      </View>
    );
  };

  const renderUpcomingEvents = () => {
    const upcomingEvents = filteredEvents.filter((event) => event.isUpcoming);

    if (upcomingEvents.length === 0 && search.trim()) {
      return null; // Don't show section if no results found
    }

    return (
      <View style={styles.eventsSection}>
        <ThemedText type="title" style={styles.sectionTitle}>
          Upcoming Events
        </ThemedText>
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => (
            <Pressable
              key={event.id}
              onPress={() => handleEventPress(event.id)}
            >
              <CardContainer style={styles.upcomingEventCard}>
                <EventImage
                  source={{ uri: event.image.src }}
                  style={styles.upcomingEventImage}
                />
                <View
                  style={[styles.upcomingEventContent, { backgroundColor }]}
                >
                  <View style={styles.eventTextContent}>
                    <ThemedText type="title">{event.name}</ThemedText>
                    <ThemedText type="subtitle">{event.type}</ThemedText>
                    <ThemedText
                      type="default"
                      numberOfLines={2}
                      style={styles.description}
                    >
                      {event.description}
                    </ThemedText>
                    <View style={styles.eventDetails}>
                      <ThemedText type="cardSubTitle">
                        <FontAwesome5
                          name="calendar-alt"
                          size={12}
                          color={color}
                        />{' '}
                        {event.date}
                      </ThemedText>
                      <ThemedText type="cardSubTitle">
                        <FontAwesome5
                          name="map-marker-alt"
                          size={12}
                          color={color}
                        />{' '}
                        {event.location}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </CardContainer>
            </Pressable>
          ))
        ) : (
          <ThemedText style={styles.noResults}>
            No upcoming events found
          </ThemedText>
        )}
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView>
          <View style={styles.content}>
            <SearchBar
              value={search}
              onChangeText={handleSearch}
              onSearch={() => handleSearch(search)}
              placeholder="Search events by name, location..."
            />
            {renderDateSelector()}
            {filteredEvents.length === 0 ? (
              <View style={styles.noResultsContainer}>
                <ThemedText style={styles.noResultsText}>
                  No events found matching "{search}"
                </ThemedText>
              </View>
            ) : (
              <>
                {renderNearbyEvents()}
                {renderUpcomingEvents()}
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dateSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
  },
  navButton: {
    padding: 8,
  },
  daysContainer: {
    paddingHorizontal: 16,
  },
  dayColumn: {
    alignItems: 'center',
    marginRight: 24,
  },
  dayText: {
    fontSize: 13,
    marginBottom: 8,
    opacity: 0.8,
  },
  selectedDayText: {
    color: '#0A2342',
    opacity: 1,
    fontWeight: '600',
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDate: {
    backgroundColor: '#0A2342',
  },
  todayDate: {
    borderWidth: 1,
    borderColor: '#0A2342',
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
  },
  selectedDateText: {
    color: '#fff',
  },
  todayDateText: {
    color: '#0A2342',
  },
  eventsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  eventCard: {
    width: width * 0.7,
    height: 250,
    marginRight: 16,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: '60%',
    resizeMode: 'cover',
  },
  eventInfo: {
    padding: 12,
    flex: 1,
  },
  location: {
    marginTop: 4,
  },
  upcomingEventCard: {
    width: '100%',
    height: 300,
    marginBottom: 16,
    overflow: 'hidden',
  },
  upcomingEventImage: {
    width: '100%',
    height: '50%',
    resizeMode: 'cover',
  },
  upcomingEventContent: {
    flex: 1,
    padding: 16,
  },
  eventTextContent: {
    flex: 1,
  },
  description: {
    marginTop: 8,
    marginBottom: 8,
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  noResults: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.6,
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  noResultsText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
  },
});

export default EventsDirectory;
