import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  useWindowDimensions,
  ImageBackground,
  Platform,
  Animated,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { navigateToLogin, navigateToRegister } from '@/routes/mainRoutes';

const HERO_IMAGE = 'https://i0.wp.com/nagayon.com/wp-content/uploads/2024/08/oragon-monument-by-colline.jpg';

const FEATURES = [
  {
    icon: 'map-marker-radius',
    title: 'Discover Places',
    description: 'Explore hidden gems and popular tourist spots across Naga City',
    gradient: ['#FF6B6B', '#FF8E53'] as const,
  },
  {
    icon: 'calendar-star',
    title: 'Local Events',
    description: 'Stay updated with festivals, concerts, and community gatherings',
    gradient: ['#4ECDC4', '#44A08D'] as const,
  },
  {
    icon: 'storefront',
    title: 'Shop Local',
    description: 'Support local businesses and discover unique products',
    gradient: ['#A770EF', '#CF8BF3'] as const,
  },
  {
    icon: 'bed-queen',
    title: 'Find Accommodation',
    description: 'Book comfortable stays from hotels to cozy homestays',
    gradient: ['#FFA751', '#FFE259'] as const,
  },
];

const CATEGORIES = [
  {
    id: 'restaurants',
    name: 'Restaurants',
    icon: 'silverware-fork-knife',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    count: '200+',
  },
  {
    id: 'attractions',
    name: 'Attractions',
    icon: 'camera',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
    count: '150+',
  },
  {
    id: 'hotels',
    name: 'Hotels',
    icon: 'bed',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    count: '80+',
  },
  {
    id: 'events',
    name: 'Events',
    icon: 'party-popper',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    count: '50+',
  },
];

const POPULAR_SPOTS = [
  {
    id: '1',
    name: 'Naga Metropolitan Cathedral',
    image: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviews: 1234,
    category: 'Religious Site',
  },
  {
    id: '2',
    name: 'Plaza Rizal',
    image: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    reviews: 856,
    category: 'Park',
  },
  {
    id: '3',
    name: 'Naga River Walk',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviews: 642,
    category: 'Scenic Walk',
  },
];

const TESTIMONIALS = [
  {
    id: '1',
    name: 'Maria Santos',
    avatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    text: 'CityVenture made exploring Naga so much easier! Found amazing local restaurants and hidden gems I never knew existed.',
  },
  {
    id: '2',
    name: 'John Reyes',
    avatar: 'https://i.pravatar.cc/150?img=3',
    rating: 5,
    text: 'The event calendar is fantastic. Never miss out on local festivals and community events anymore!',
  },
  {
    id: '3',
    name: 'Ana Cruz',
    avatar: 'https://i.pravatar.cc/150?img=5',
    rating: 5,
    text: 'Booking accommodations through CityVenture was seamless. Great selection and verified reviews!',
  },
];

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Explore',
    description: 'Browse through hundreds of places, events, and experiences',
    icon: 'magnify',
  },
  {
    step: '2',
    title: 'Discover',
    description: 'Read reviews, check ratings, and find what suits you best',
    icon: 'star',
  },
  {
    step: '3',
    title: 'Experience',
    description: 'Book, visit, and create unforgettable memories',
    icon: 'heart',
  },
];

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleSearch = () => {
    // Navigate to search results or home
    router.push('/(tabs)/(home)');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <View style={[styles.heroSection, isDesktop && styles.heroSectionDesktop]}>
          <ImageBackground
            source={{ uri: HERO_IMAGE }}
            style={styles.heroBackground}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['rgba(10, 27, 71, 0.7)', 'rgba(10, 27, 71, 0.85)', '#0A1B47']}
              style={styles.heroGradient}
            >
              {/* Navigation Bar */}
              <View style={[styles.navbar, isDesktop && styles.navbarDesktop]}>
                <View style={styles.navLeft}>
                  <MaterialCommunityIcons name="city" size={32} color="#fff" />
                  <ThemedText type="title-small" weight="bold" style={styles.logo}>
                    CityVenture
                  </ThemedText>
                </View>
                <View style={styles.navRight}>
                  <Pressable
                    style={styles.navButton}
                    onPress={() => navigateToLogin()}
                  >
                    <ThemedText type="label-medium" weight="semi-bold" style={styles.navButtonText}>
                      Sign In
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.navButton, styles.navButtonPrimary]}
                    onPress={() => navigateToRegister()}
                  >
                    <ThemedText type="label-medium" weight="semi-bold" style={styles.navButtonTextPrimary}>
                      Sign Up
                    </ThemedText>
                  </Pressable>
                </View>
              </View>

              {/* Hero Content */}
              <View style={[styles.heroContent, isDesktop && styles.heroContentDesktop]}>
                <ThemedText
                  type="title-large"
                  weight="extra-bold"
                  style={styles.heroTitle}
                >
                  Discover the Heart{'\n'}of Naga City
                </ThemedText>
                <ThemedText
                  type={isDesktop ? 'title-small' : 'body-large'}
                  style={styles.heroSubtitle}
                >
                  Explore local attractions, events, dining, and more.{'\n'}
                  Your ultimate guide to experiencing Naga.
                </ThemedText>

                {/* Search Bar */}
                <View style={[styles.searchContainer, isDesktop && styles.searchContainerDesktop]}>
                  <MaterialCommunityIcons
                    name="magnify"
                    size={24}
                    color="#666"
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search for places, events, restaurants..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                  />
                  <Pressable style={styles.searchButton} onPress={handleSearch}>
                    <ThemedText type="label-medium" weight="semi-bold" style={styles.searchButtonText}>
                      Search
                    </ThemedText>
                  </Pressable>
                </View>

                {/* Quick Stats */}
                <View style={[styles.statsContainer, isDesktop && styles.statsContainerDesktop]}>
                  <View style={styles.statItem}>
                    <ThemedText type="title-medium" weight="bold" style={styles.statNumber}>
                      500+
                    </ThemedText>
                    <ThemedText type="label-small" style={styles.statLabel}>
                      Places
                    </ThemedText>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <ThemedText type="title-medium" weight="bold" style={styles.statNumber}>
                      10K+
                    </ThemedText>
                    <ThemedText type="label-small" style={styles.statLabel}>
                      Reviews
                    </ThemedText>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <ThemedText type="title-medium" weight="bold" style={styles.statNumber}>
                      50+
                    </ThemedText>
                    <ThemedText type="label-small" style={styles.statLabel}>
                      Events
                    </ThemedText>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Categories Section */}
        <View style={[styles.section, isDesktop && styles.sectionDesktop]}>
          <ThemedText type="title-medium" weight="bold" style={styles.sectionTitle}>
            Explore by Category
          </ThemedText>
          <View style={[styles.categoriesGrid, isDesktop && styles.categoriesGridDesktop]}>
            {CATEGORIES.map((category) => (
              <Pressable
                key={category.id}
                style={[styles.categoryCard, isDesktop && styles.categoryCardDesktop]}
                onPress={() => router.push('/(tabs)/(home)')}
              >
                <ImageBackground
                  source={{ uri: category.image }}
                  style={styles.categoryImage}
                  imageStyle={styles.categoryImageStyle}
                >
                  <LinearGradient
                    colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                    style={styles.categoryOverlay}
                  >
                    <MaterialCommunityIcons
                      name={category.icon as any}
                      size={32}
                      color="#fff"
                    />
                    <ThemedText type="sub-title-small" weight="bold" style={styles.categoryName}>
                      {category.name}
                    </ThemedText>
                    <ThemedText type="label-small" style={styles.categoryCount}>
                      {category.count} listings
                    </ThemedText>
                  </LinearGradient>
                </ImageBackground>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Features Section */}
        <View style={[styles.section, styles.featuresSection, isDesktop && styles.sectionDesktop]}>
          <ThemedText type="title-medium" weight="bold" style={styles.sectionTitle}>
            Why Choose CityVenture?
          </ThemedText>
          <View style={[styles.featuresGrid, isDesktop && styles.featuresGridDesktop]}>
            {FEATURES.map((feature, index) => (
              <View
                key={index}
                style={[styles.featureCard, isDesktop && styles.featureCardDesktop]}
              >
                <LinearGradient
                  colors={feature.gradient}
                  style={styles.featureIcon}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons
                    name={feature.icon as any}
                    size={28}
                    color="#fff"
                  />
                </LinearGradient>
                <ThemedText type="sub-title-small" weight="bold" style={styles.featureTitle}>
                  {feature.title}
                </ThemedText>
                <ThemedText type="body-small" style={styles.featureDescription}>
                  {feature.description}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Popular Spots Section */}
        <View style={[styles.section, isDesktop && styles.sectionDesktop]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="title-medium" weight="bold" style={styles.sectionTitle}>
              Popular Destinations
            </ThemedText>
            <Pressable>
              <ThemedText type="label-medium" weight="semi-bold" style={styles.viewAllLink}>
                View All →
              </ThemedText>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.spotsScroll}
          >
            {POPULAR_SPOTS.map((spot) => (
              <View key={spot.id} style={[styles.spotCard, isDesktop && styles.spotCardDesktop]}>
                <ImageBackground
                  source={{ uri: spot.image }}
                  style={styles.spotImage}
                  imageStyle={styles.spotImageStyle}
                >
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.spotGradient}
                  >
                    <View style={styles.spotInfo}>
                      <ThemedText type="sub-title-small" weight="bold" style={styles.spotName}>
                        {spot.name}
                      </ThemedText>
                      <ThemedText type="label-small" style={styles.spotCategory}>
                        {spot.category}
                      </ThemedText>
                      <View style={styles.spotRating}>
                        <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                        <ThemedText type="label-small" style={styles.spotRatingText}>
                          {spot.rating} ({spot.reviews} reviews)
                        </ThemedText>
                      </View>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* How It Works Section */}
        <View style={[styles.section, styles.howItWorksSection, isDesktop && styles.sectionDesktop]}>
          <ThemedText type="title-medium" weight="bold" style={styles.sectionTitle}>
            How It Works
          </ThemedText>
          <View style={[styles.stepsContainer, isDesktop && styles.stepsContainerDesktop]}>
            {HOW_IT_WORKS.map((step, index) => (
              <View key={step.step} style={styles.stepCard}>
                <View style={styles.stepIconContainer}>
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.stepIcon}
                  >
                    <MaterialCommunityIcons
                      name={step.icon as any}
                      size={32}
                      color="#fff"
                    />
                  </LinearGradient>
                  <View style={styles.stepNumber}>
                    <ThemedText type="label-medium" weight="bold" style={styles.stepNumberText}>
                      {step.step}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText type="sub-title-small" weight="bold" style={styles.stepTitle}>
                  {step.title}
                </ThemedText>
                <ThemedText type="body-small" style={styles.stepDescription}>
                  {step.description}
                </ThemedText>
                {index < HOW_IT_WORKS.length - 1 && isDesktop && (
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={24}
                    color="#667eea"
                    style={styles.stepArrow}
                  />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Testimonials Section */}
        <View style={[styles.section, isDesktop && styles.sectionDesktop]}>
          <ThemedText type="title-medium" weight="bold" style={styles.sectionTitle}>
            What Our Users Say
          </ThemedText>
          <View style={[styles.testimonialsGrid, isDesktop && styles.testimonialsGridDesktop]}>
            {TESTIMONIALS.map((testimonial) => (
              <View key={testimonial.id} style={styles.testimonialCard}>
                <View style={styles.testimonialHeader}>
                  <ImageBackground
                    source={{ uri: testimonial.avatar }}
                    style={styles.testimonialAvatar}
                    imageStyle={styles.testimonialAvatarStyle}
                  />
                  <View style={styles.testimonialInfo}>
                    <ThemedText type="label-medium" weight="bold" style={styles.testimonialName}>
                      {testimonial.name}
                    </ThemedText>
                    <View style={styles.testimonialRating}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <MaterialCommunityIcons
                          key={i}
                          name="star"
                          size={14}
                          color="#FFD700"
                        />
                      ))}
                    </View>
                  </View>
                </View>
                <ThemedText type="body-small" style={styles.testimonialText}>
                  "{testimonial.text}"
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <ThemedText type="title-medium" weight="bold" style={styles.ctaTitle}>
              Ready to Explore Naga City?
            </ThemedText>
            <ThemedText type="body-medium" style={styles.ctaSubtitle}>
              Join thousands of users discovering the best of Naga
            </ThemedText>
            <Pressable
              style={styles.ctaButton}
              onPress={() => navigateToRegister()}
            >
              <ThemedText type="label-large" weight="bold" style={styles.ctaButtonText}>
                Get Started Free
              </ThemedText>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#667eea" />
            </Pressable>
          </LinearGradient>
        </View>

        {/* Footer */}
        <View style={[styles.footer, isDesktop && styles.footerDesktop]}>
          <View style={[styles.footerContent, isDesktop && styles.footerContentDesktop]}>
            <View style={styles.footerSection}>
              <View style={styles.footerBrand}>
                <MaterialCommunityIcons name="city" size={28} color="#667eea" />
                <ThemedText type="sub-title-small" weight="bold" style={styles.footerBrandText}>
                  CityVenture
                </ThemedText>
              </View>
              <ThemedText type="body-small" style={styles.footerDescription}>
                Your ultimate guide to exploring Naga City. Discover, experience, and create unforgettable memories.
              </ThemedText>
            </View>

            <View style={styles.footerSection}>
              <ThemedText type="label-medium" weight="bold" style={styles.footerSectionTitle}>
                Explore
              </ThemedText>
              <Pressable style={styles.footerLink}>
                <ThemedText type="body-small" style={styles.footerLinkText}>
                  Tourist Spots
                </ThemedText>
              </Pressable>
              <Pressable style={styles.footerLink}>
                <ThemedText type="body-small" style={styles.footerLinkText}>
                  Restaurants
                </ThemedText>
              </Pressable>
              <Pressable style={styles.footerLink}>
                <ThemedText type="body-small" style={styles.footerLinkText}>
                  Events
                </ThemedText>
              </Pressable>
              <Pressable style={styles.footerLink}>
                <ThemedText type="body-small" style={styles.footerLinkText}>
                  Accommodations
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.footerSection}>
              <ThemedText type="label-medium" weight="bold" style={styles.footerSectionTitle}>
                Company
              </ThemedText>
              <Pressable style={styles.footerLink}>
                <ThemedText type="body-small" style={styles.footerLinkText}>
                  About Us
                </ThemedText>
              </Pressable>
              <Pressable style={styles.footerLink}>
                <ThemedText type="body-small" style={styles.footerLinkText}>
                  Contact
                </ThemedText>
              </Pressable>
              <Pressable style={styles.footerLink}>
                <ThemedText type="body-small" style={styles.footerLinkText}>
                  Privacy Policy
                </ThemedText>
              </Pressable>
              <Pressable style={styles.footerLink}>
                <ThemedText type="body-small" style={styles.footerLinkText}>
                  Terms of Service
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.footerSection}>
              <ThemedText type="label-medium" weight="bold" style={styles.footerSectionTitle}>
                Connect
              </ThemedText>
              <View style={styles.socialLinks}>
                <Pressable style={styles.socialIcon}>
                  <MaterialCommunityIcons name="facebook" size={24} color="#667eea" />
                </Pressable>
                <Pressable style={styles.socialIcon}>
                  <MaterialCommunityIcons name="instagram" size={24} color="#667eea" />
                </Pressable>
                <Pressable style={styles.socialIcon}>
                  <MaterialCommunityIcons name="twitter" size={24} color="#667eea" />
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.footerBottom}>
            <ThemedText type="label-small" style={styles.footerCopyright}>
              © 2025 CityVenture. All rights reserved.
            </ThemedText>
          </View>
        </View>
      </ScrollView>
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
  heroSection: {
    height: 700,
  },
  heroSectionDesktop: {
    height: 800,
  },
  heroBackground: {
    flex: 1,
  },
  heroGradient: {
    flex: 1,
    paddingHorizontal: 20,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  navbarDesktop: {
    paddingHorizontal: 40,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    color: '#fff',
  },
  navRight: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  navButtonPrimary: {
    backgroundColor: '#fff',
  },
  navButtonText: {
    color: '#fff',
  },
  navButtonTextPrimary: {
    color: '#667eea',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroContentDesktop: {
    paddingHorizontal: 100,
  },
  heroTitle: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 4,
    width: '100%',
    maxWidth: 600,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  searchContainerDesktop: {
    maxWidth: 700,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  searchButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  searchButtonText: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    gap: 20,
  },
  statsContainerDesktop: {
    gap: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  sectionDesktop: {
    paddingHorizontal: 80,
  },
  sectionTitle: {
    color: '#0A1B47',
    marginBottom: 32,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  viewAllLink: {
    color: '#667eea',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  categoriesGridDesktop: {
    gap: 24,
  },
  categoryCard: {
    width: '48%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryCardDesktop: {
    width: '23%',
    height: 220,
  },
  categoryImage: {
    flex: 1,
  },
  categoryImageStyle: {
    borderRadius: 16,
  },
  categoryOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  categoryName: {
    color: '#fff',
    marginTop: 12,
    textAlign: 'center',
  },
  categoryCount: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  featuresSection: {
    backgroundColor: '#F8F9FF',
  },
  featuresGrid: {
    gap: 20,
  },
  featuresGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  featureCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featureCardDesktop: {
    width: '23%',
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    color: '#0A1B47',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    color: '#666',
    textAlign: 'center',
  },
  spotsScroll: {
    paddingRight: 20,
    gap: 16,
  },
  spotCard: {
    width: 280,
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
  },
  spotCardDesktop: {
    width: 320,
    height: 360,
  },
  spotImage: {
    flex: 1,
  },
  spotImageStyle: {
    borderRadius: 16,
  },
  spotGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  spotInfo: {
    padding: 20,
  },
  spotName: {
    color: '#fff',
    marginBottom: 4,
  },
  spotCategory: {
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  spotRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  spotRatingText: {
    color: '#fff',
  },
  howItWorksSection: {
    backgroundColor: '#F8F9FF',
  },
  stepsContainer: {
    gap: 32,
  },
  stepsContainerDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 40,
  },
  stepCard: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  stepIconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  stepIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#667eea',
  },
  stepNumberText: {
    color: '#667eea',
  },
  stepTitle: {
    color: '#0A1B47',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    color: '#666',
    textAlign: 'center',
  },
  stepArrow: {
    position: 'absolute',
    right: -32,
    top: 40,
  },
  testimonialsGrid: {
    gap: 20,
  },
  testimonialsGridDesktop: {
    flexDirection: 'row',
    gap: 24,
  },
  testimonialCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    flex: 1,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  testimonialAvatar: {
    width: 48,
    height: 48,
  },
  testimonialAvatarStyle: {
    borderRadius: 24,
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    color: '#0A1B47',
    marginBottom: 4,
  },
  testimonialRating: {
    flexDirection: 'row',
    gap: 2,
  },
  testimonialText: {
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  ctaSection: {
    marginHorizontal: 20,
    marginVertical: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  ctaGradient: {
    padding: 48,
    alignItems: 'center',
  },
  ctaTitle: {
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 32,
    textAlign: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
  },
  ctaButtonText: {
    color: '#667eea',
  },
  footer: {
    backgroundColor: '#0A1B47',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  footerDesktop: {
    paddingHorizontal: 80,
  },
  footerContent: {
    gap: 40,
  },
  footerContentDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerSection: {
    flex: 1,
  },
  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  footerBrandText: {
    color: '#fff',
  },
  footerDescription: {
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
  },
  footerSectionTitle: {
    color: '#fff',
    marginBottom: 16,
  },
  footerLink: {
    marginBottom: 12,
  },
  footerLinkText: {
    color: 'rgba(255,255,255,0.7)',
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  socialIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerBottom: {
    marginTop: 40,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  footerCopyright: {
    color: 'rgba(255,255,255,0.5)',
  },
});
