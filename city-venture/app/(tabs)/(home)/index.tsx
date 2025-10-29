/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

import Button from '@/components/Button';
import Container from '@/components/Container';
import CollapsibleHeader from '@/components/CollapsibleHeader';
import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCollapsibleHeader } from '@/hooks/useCollapsibleHeader';
import { useAuth } from '@/context/AuthContext';
import { navigateToAccommodationHome } from '@/routes/accommodationRoutes';
import { navigateToShopHome } from '@/routes/shopRoutes';

const width = Dimensions.get('screen').width;

const CollapsibleHomeScreen = () => {
  const scheme = useColorScheme();
  const bg = scheme === 'dark' ? '#0F1222' : '#FFFFFF';
  const altBg = scheme === 'dark' ? '#0B0E1B' : '#F6F7FA';
  const card = scheme === 'dark' ? '#161A2E' : '#FFFFFF';
  const textMuted = scheme === 'dark' ? '#A9B2D0' : '#6A768E';

  const { user } = useAuth();
  const didRedirect = useRef(false);

  const {
    scrollHandler,
    headerAnimatedStyle,
    backgroundImageStyle,
    greetingStyle,
    headerBackgroundStyle,
    contentMarginStyle,
    searchBarBackgroundStyle,
    HEADER_HEIGHT_EXPANDED,
    HEADER_HEIGHT_COLLAPSED,
    SCROLL_THRESHOLD,
  } = useCollapsibleHeader();

  const heroHeight = HEADER_HEIGHT_EXPANDED + 60;
  const contentTopInset = Math.max(HEADER_HEIGHT_EXPANDED - 80, HEADER_HEIGHT_COLLAPSED + 40);

  // Sample highlight data - moved before early return
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
    [],
  );

  useEffect(() => {
    if (!user && !didRedirect.current) {
      didRedirect.current = true;
      router.replace('/(screens)/Login');
    }
  }, [user]);

  if (!user) return null;

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: bg }}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.heroBackground,
            { height: heroHeight },
            backgroundImageStyle,
          ]}
        />

        <CollapsibleHeader
          userName={user.first_name || 'Explorer'}
          headerAnimatedStyle={headerAnimatedStyle}
          greetingStyle={greetingStyle}
          headerBackgroundStyle={headerBackgroundStyle}
          searchBarBackgroundStyle={searchBarBackgroundStyle}
          onSearchPress={() => {
            // TODO: Navigate to search screen
            console.log('Search pressed');
          }}
          onNotificationPress={() => {
            router.push('/(tabs)/profile' as any);
          }}
          onCartPress={() => {
            // TODO: Navigate to cart screen
            console.log('Cart pressed');
          }}
        />

        {/* Main Content with Sticky Quick Nav */}
        <Animated.ScrollView
          style={{ flex: 1 }}
          contentInsetAdjustmentBehavior="never"
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: contentTopInset,
            paddingBottom: 32,
          }}
          stickyHeaderIndices={[0]}
        >
          {/* Sticky Quick Navigation */}
          <View style={styles.stickyNavWrapper}>
            <Animated.View style={[styles.stickyNavCard, { backgroundColor: bg }]}>
              <Container
                elevation={2}
                padding={width < 360 ? 12 : 16}
                direction="row"
                justify="space-between"
                align="center"
                radius={14}
              >
                <Button
                  label="Place to stay"
                  color="white"
                  topIcon="hotel"
                  iconSize={width < 360 ? 20 : 24}
                  textSize={width < 360 ? 9 : 10}
                  onPress={() => navigateToAccommodationHome()}
                />

                <Button
                  label="Shops"
                  color="white"
                  topIcon="shopping-bag"
                  iconSize={width < 360 ? 20 : 24}
                  textSize={width < 360 ? 9 : 10}
                  onPress={() => navigateToShopHome()}
                />

                <Button
                  label="Tourist Spots"
                  color="white"
                  topIcon="map-marker"
                  iconSize={width < 360 ? 20 : 24}
                  textSize={width < 360 ? 9 : 10}
                  onPress={() => router.push('/(tabs)/(home)/(spot)')}
                />

                <Button
                  label="Events"
                  color="white"
                  topIcon="calendar"
                  iconSize={width < 360 ? 20 : 24}
                  textSize={width < 360 ? 9 : 10}
                  onPress={() => router.push('/(tabs)/(home)/(event)')}
                />
              </Container>
            </Animated.View>
          </View>

          {/* Scrollable Body */}
          <Animated.View style={[styles.bodyContainer, { backgroundColor: bg }, contentMarginStyle]}>
            {/* Highlighted Tourist Spots */}
            <SectionHeader
              title="Highlighted Tourist Spots"
              subtitle="Don't miss these popular places"
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

            {/* Partners */}
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

            {/* Upcoming Events */}
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

            {/* News & Articles */}
            <SectionHeader
              title="News & Articles"
              subtitle="What's new in Naga"
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

            {/* About City Venture */}
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

            {/* Footer */}
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
          </Animated.View>
        </Animated.ScrollView>
      </View>
    </SafeAreaProvider>
  );
};

export default CollapsibleHomeScreen;

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
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    backgroundColor: colors.primary,
    zIndex: 0,
  },
  stickyNavWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: colors.primary,
    zIndex: 20,
  },
  stickyNavCard: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  bodyContainer: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    paddingTop: 16,
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
    width: '100%',
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
