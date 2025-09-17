/* eslint-disable @typescript-eslint/no-unused-vars */
import Button from '@/components/Button';
import Container from '@/components/Container';
import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FeaturedLocation } from '@/query/HomeData';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { navigateToAccommodationHome } from '@/routes/accommodationRoutes';
import { navigateToShopHome } from '@/routes/shopRoutes';

const width = Dimensions.get('screen').width;

const HomeScreen = () => {
  const scheme = useColorScheme();
  const bg = scheme === 'dark' ? '#0F1222' : '#FFFFFF';
  const altBg = scheme === 'dark' ? '#0B0E1B' : '#F6F7FA';
  const card = scheme === 'dark' ? '#161A2E' : '#FFFFFF';
  const textMuted = scheme === 'dark' ? '#A9B2D0' : '#6A768E';

  const { user } = useAuth();
  const didRedirect = useRef(false);
  const ref = useRef<any>(null);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!user && !didRedirect.current) {
      didRedirect.current = true;
      router.replace('/(screens)/Login');
    }
  }, [user]);

  if (!user) return null;

  // Sample highlight data
  const spots = useMemo(
    () => [
      {
        id: 's1',
        name: 'Basilica Minore',
        tag: 'A Spiritual Journey in Naga',
        img: 'https://i0.wp.com/nagayon.com/wp-content/uploads/2024/05/Cathedral-Exterior_1-scaled.jpg?resize=768%2C576&ssl=1',
      },
      {
        id: 's2',
        name: 'Peñafrancia Shrine',
        tag: 'Historic devotion site',
        img: 'https://i0.wp.com/nagayon.com/wp-content/uploads/2024/05/Porta-mariae-e1717984426731.jpg?resize=768%2C506&ssl=1',
      },
      {
        id: 's3',
        name: 'JMR Coliseum',
        tag: 'Events and sports hub',
        img: 'https://i0.wp.com/nagayon.com/wp-content/uploads/2024/09/jmr-coliseum-scaled.jpg?resize=768%2C576&ssl=1',
      },
    ],
    []
  );

  const partners = useMemo(
    () => [
      {
        id: 'p1',
        name: 'UMA Residence',
        tag: 'Accommodation',
        img: require('@/assets/images/android-icon-foreground.png'),
      },
      {
        id: 'p2',
        name: 'Local Cafe',
        tag: 'Shop',
        img: require('@/assets/images/partial-react-logo.png'),
      },
      {
        id: 'p3',
        name: 'Travel Co',
        tag: 'Partner',
        img: require('@/assets/images/react-logo.png'),
      },
    ],
    []
  );

  const events = useMemo(
    () => [
      {
        id: 'e1',
        name: 'Peñafrancia Festival',
        date: 'Sep 12-20',
        img: require('@/assets/images/react-logo.png'),
        desc: 'Cultural parade and celebration',
      },
      {
        id: 'e2',
        name: 'City Music Night',
        date: 'Oct 05',
        img: require('@/assets/images/react-logo.png'),
        desc: 'Live performances in the plaza',
      },
    ],
    []
  );

  const news = useMemo(
    () => [
      {
        id: 'n1',
        title: 'Naga City Festival Set to Welcome Thousands of Visitors',
        img: require('@/assets/images/android-icon-background.png'),
      },
      {
        id: 'n2',
        title: 'New Walking Tours Launched in Downtown',
        img: require('@/assets/images/android-icon-monochrome.png'),
      },
    ],
    []
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero Section (white) */}
          <View style={{ backgroundColor: bg }}>
            <View style={{ width: width }}>
              <Carousel
                ref={ref}
                width={width}
                height={360}
                data={FeaturedLocation}
                onProgressChange={progress}
                renderItem={({ item }) => (
                  <View style={styles.carouselItem}>
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.6)']}
                      style={styles.overlay}
                    />
                    <View style={styles.overlayContent}>
                      <ThemedText
                        type="title-small"
                        weight="bold"
                        style={{ color: '#fff' }}
                      >
                        Discover Naga’s Hidden Gems
                      </ThemedText>
                      <Button
                        label="Start Exploring"
                        variant="soft"
                        color="info"
                        startIcon="compass"
                        elevation={2}
                        radius={14}
                        onPress={() => router.push('/(tabs)/(home)/(spot)' as any)}
                      />
                    </View>
                  </View>
                )}
              />
            </View>
          </View>

          {/* Quick Navigation (light gray) */}
          <View style={{ backgroundColor: altBg, padding: 16 }}>
            <Container
              elevation={2}
              padding={16}
              direction="row"
              justify="space-between"
              align="center"
              radius={14}
            >
              <Button
                label="Place to stay"
                color="white"
                topIcon="hotel"
                iconSize={24}
                textSize={10}
                onPress={() => navigateToAccommodationHome()}
              />

              <Button
                label="Shops"
                color="white"
                topIcon="shopping-bag"
                iconSize={24}
                textSize={10}
                onPress={() => navigateToShopHome()}
              />

              <Button
                label="Tourist Spots"
                color="white"
                topIcon="map-marker"
                iconSize={24}
                textSize={10}
                onPress={() => router.push('/(tabs)/(home)/(spot)')}
              />

              <Button
                label="Events"
                color="white"
                topIcon="calendar"
                iconSize={24}
                textSize={10}
                onPress={() => router.push('/(tabs)/(home)/(event)')}
              />
            </Container>
          </View>

          {/* Highlighted Tourist Spots (white) */}
          <SectionHeader
            title="Highlighted Tourist Spots"
            subtitle="Don’t miss these popular places"
            bg={bg}
          />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={spots}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 10,
              gap: 12,
            }}
            renderItem={({ item }) => (
              <View
                style={[styles.spotCard, { backgroundColor: card }, shadow(2)]}
              >
                <Image source={{ uri: item.img }} style={styles.spotImg} />
                <View style={{ padding: 10 }}>
                  <ThemedText type="body-medium" weight="semi-bold">
                    {item.name}
                  </ThemedText>
                  <ThemedText type="label-small" style={{ color: textMuted }}>
                    {item.tag}
                  </ThemedText>
                </View>
                <FontAwesome5
                  name="map-marker-alt"
                  size={16}
                  color={colors.secondary}
                  style={{ position: 'absolute', right: 10, top: 10 }}
                />
              </View>
            )}
          />

          {/* Partners (light gray) */}
          <SectionHeader
            title="Partnered Businesses"
            subtitle="Trusted Partners of City Venture"
            bg={altBg}
          />
          <View style={{ backgroundColor: altBg, paddingBottom: 10 }}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={partners}
              keyExtractor={(i) => i.id}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.partnerCard,
                    { backgroundColor: card },
                    shadow(1),
                  ]}
                >
                  <Image source={item.img} style={styles.partnerImg} />
                  <View style={{ marginTop: 6 }}>
                    <ThemedText type="label-medium" weight="semi-bold">
                      {item.name}
                    </ThemedText>
                    <ThemedText type="label-small" style={{ color: textMuted }}>
                      {item.tag}
                    </ThemedText>
                  </View>
                </View>
              )}
            />
          </View>

          {/* Upcoming Events (white) */}
          <SectionHeader
            title="Upcoming Events"
            subtitle="Mark your calendars"
            bg={bg}
            actionLabel="See All"
            onAction={() => router.push('/(tabs)/(home)/(event)' as any)}
          />
          <View style={{ backgroundColor: bg }}>
            {events.map((e) => (
              <View
                key={e.id}
                style={[styles.eventCard, { backgroundColor: card }, shadow(1)]}
              >
                <Image source={e.img} style={styles.eventImg} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <ThemedText type="body-medium" weight="semi-bold">
                    {e.name}
                  </ThemedText>
                  <ThemedText type="label-small" style={{ color: textMuted }}>
                    {e.date} • {e.desc}
                  </ThemedText>
                </View>
                <FontAwesome5 name="chevron-right" size={12} color="#9AA4B2" />
              </View>
            ))}
          </View>

          {/* News & Articles (light gray) */}
          <SectionHeader
            title="News & Articles"
            subtitle="What’s new in Naga"
            bg={altBg}
          />
          <View
            style={{
              backgroundColor: altBg,
              paddingHorizontal: 16,
              paddingBottom: 16,
              gap: 10,
            }}
          >
            {news.map((n) => (
              <View
                key={n.id}
                style={[styles.newsCard, { backgroundColor: card }, shadow(1)]}
              >
                <Image source={n.img} style={styles.newsThumb} />
                <ThemedText
                  type="body-small"
                  weight="semi-bold"
                  style={{ flex: 1 }}
                  numberOfLines={2}
                >
                  {n.title}
                </ThemedText>
                <FontAwesome5
                  name="arrow-right"
                  size={12}
                  color={colors.secondary}
                />
              </View>
            ))}
          </View>

          {/* About City Venture (white) */}
          <View style={{ backgroundColor: bg, padding: 16 }}>
            <Container elevation={2} padding={16} backgroundColor={card}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={require('@/assets/logo/logo.png')}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    marginRight: 12,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <ThemedText type="sub-title-small" weight="bold">
                    About City Venture
                  </ThemedText>
                  <ThemedText type="label-small" style={{ color: textMuted }}>
                    City Venture is your trusted companion for exploring Naga
                    City—connecting you with accommodations, shops, events, and
                    tourist spots.
                  </ThemedText>
                </View>
              </View>
              <View style={{ marginTop: 12 }}>
                <Button
                  label="Learn More"
                  variant="soft"
                  color="primary"
                  startIcon="info-circle"
                  radius={12}
                  onPress={() => router.push('/' as any)}
                />
              </View>
            </Container>
          </View>

          {/* Footer (light gray) */}
          <View style={{ backgroundColor: altBg, padding: 16 }}>
            <Container elevation={1} padding={16} backgroundColor={altBg}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <FooterLink label="Contact" />
                <FooterLink label="Terms" />
                <FooterLink label="Privacy" />
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <FontAwesome5 name="facebook" size={14} color={textMuted} />
                  <FontAwesome5 name="twitter" size={14} color={textMuted} />
                  <FontAwesome5 name="instagram" size={14} color={textMuted} />
                </View>
              </View>
            </Container>
          </View>
          <View style={{ height: 70 }} />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default HomeScreen;

const SectionHeader = ({
  title,
  subtitle,
  bg,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  bg: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <View
    style={{
      backgroundColor: bg,
      paddingHorizontal: 16,
      paddingTop: 18,
      paddingBottom: 6,
    }}
  >
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View>
        <ThemedText type="sub-title-medium" weight="bold">
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="label-small" style={{ color: '#6A768E' }}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {onAction ? (
        <Pressable onPress={onAction}>
          <ThemedText type="link-small">{actionLabel ?? 'See All'}</ThemedText>
        </Pressable>
      ) : null}
    </View>
  </View>
);

const FooterLink = ({ label }: { label: string }) => (
  <Pressable>
    <ThemedText type="label-small" style={{ color: '#6A768E' }}>
      {label}
    </ThemedText>
  </Pressable>
);

const styles = StyleSheet.create({
  carouselItem: { flex: 1, overflow: 'hidden', padding: 0 },
  image: { width: '100%', height: '100%', borderRadius: 0 },
  overlay: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 120 },
  overlayContent: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    gap: 8,
  },
  spotCard: { width: 220, borderRadius: 16, overflow: 'hidden' },
  spotImg: { width: '100%', height: 120 },
  partnerCard: {
    width: 140,
    borderRadius: 16,
    alignItems: 'center',
    padding: 10,
  },
  partnerImg: {
    width: "100%",
    height: 100,
    borderRadius: 12,
    backgroundColor: '#EAEFF7',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 10,
  },
  eventImg: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#EAEFF7',
  },
  newsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    padding: 10,
  },
  newsThumb: {
    width: 54,
    height: 54,
    borderRadius: 10,
    backgroundColor: '#EAEFF7',
  },
});

function shadow(level: 1 | 2 | 3) {
  switch (level) {
    case 1:
      return {
        shadowColor: '#1e1e1e',
        shadowOpacity: 0.08,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      } as const;
    case 2:
      return {
        shadowColor: '#1e1e1e',
        shadowOpacity: 0.12,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      } as const;
    default:
      return {
        shadowColor: '#1e1e1e',
        shadowOpacity: 0.16,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
      } as const;
  }
}
