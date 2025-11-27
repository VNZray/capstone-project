import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const VisitorsHandbookSection = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F2043', '#081226']} // Deep navy blue gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Background Pattern/Decoration could go here if needed */}

        <View style={styles.content}>
          {/* Badge */}
          <View style={styles.badge}>
            <MaterialCommunityIcons
              name="compass-outline"
              size={12}
              color="#FFD700"
            />
            <ThemedText type="label-small" style={styles.badgeText}>
              TRAVEL ESSENTIALS
            </ThemedText>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <ThemedText type="sub-title-medium" style={styles.titleWhite}>
              The Visitor&apos;s
            </ThemedText>
            <ThemedText type="sub-title-medium" style={styles.titleGold}>
              Handbook
            </ThemedText>
          </View>

          {/* Description */}
          <ThemedText type="body-small" style={styles.description}>
            Curated itineraries, local transport tips, and hidden gems for the
            perfect stay.
          </ThemedText>

          {/* Button */}
          <Pressable
            style={styles.button}
            onPress={() => console.log('Open Guide')}
          >
            <MaterialCommunityIcons
              name="book-open-page-variant-outline"
              size={16}
              color="#0F2043"
            />
            <ThemedText
              type="label-small"
              weight="bold"
              style={styles.buttonText}
            >
              Open Guide
            </ThemedText>
          </Pressable>
        </View>

        {/* Right Side Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="map-legend"
              size={32}
              color="#D4AF37"
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // marginRight: -24,
    // marginLeft: -24,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 200,
  },
  content: {
    flex: 1,
    zIndex: 2,
    justifyContent: 'space-between',
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 6,
    marginBottom: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  titleContainer: {
    marginBottom: 4,
  },
  titleWhite: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  titleGold: {
    color: '#D4AF37', // Gold color
    fontSize: 22,
    lineHeight: 28,
    fontStyle: 'italic',
    fontWeight: '700',
    fontFamily: 'serif', // Try to use serif if available, or rely on style
  },
  description: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    lineHeight: 20,
    maxWidth: '85%',
  },
  button: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#0F2043',
  },
  iconContainer: {
    position: 'relative',
    right: 0,
    top: 0,
    bottom: 0,
    width: '35%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default VisitorsHandbookSection;
