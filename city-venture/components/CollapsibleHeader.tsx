import React from 'react';
import { View, StyleSheet, Pressable, TextInput, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';
import { router } from 'expo-router';

interface CollapsibleHeaderProps {
  userName: string;
  headerAnimatedStyle: any;
  greetingStyle: any;
  headerBackgroundStyle: any;
  searchBarBackgroundStyle: any;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onCartPress?: () => void;
}

const CollapsibleHeader: React.FC<CollapsibleHeaderProps> = ({
  userName,
  headerAnimatedStyle,
  greetingStyle,
  headerBackgroundStyle,
  searchBarBackgroundStyle,
  onSearchPress,
  onNotificationPress,
  onCartPress,
}) => {
  const insets = useSafeAreaInsets();
  const windowWidth = Dimensions.get('window').width;
  
  // Responsive breakpoints
  const isCompact = windowWidth < 360;
  const isMedium = windowWidth >= 360 && windowWidth < 375;

  // Responsive icon button sizes - more compact
  const iconButtonSize = isCompact ? 28 : isMedium ? 32 : 36;
  const iconSize = isCompact ? 14 : isMedium ? 16 : 18;
  const cartIconSize = isCompact ? 12 : isMedium ? 14 : 16;
  const actionsGap = isCompact ? 6 : isMedium ? 8 : 10;
  
  // Compact search bar sizing - ULTRA THIN
  const searchPaddingVertical = isCompact ? 3 : isMedium ? 4 : 4.5;
  const searchPaddingHorizontal = isCompact ? 10 : isMedium ? 12 : 14;
  const searchFontSize = isCompact ? 11 : isMedium ? 12 : 12.5;
  const searchIconSize = isCompact ? 12 : isMedium ? 13 : 14;

  return (
    <>
      {/* Animated Header (background + greeting) */}
      <Animated.View style={[styles.headerContainer, headerAnimatedStyle, { paddingTop: insets.top + 8 }]}>
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(0,0,0,0.18)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0)']}
          locations={[0, 0.5, 1]}
          style={styles.heroScrim}
        />

        <Animated.View style={[styles.solidBackground, headerBackgroundStyle]}>
          <LinearGradient
            colors={[colors.primary, '#0D2357']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        <View style={styles.content}>
          {/* Greeting below search bar */}
          <Animated.View style={[styles.greetingContainer, greetingStyle]}>
            <ThemedText style={styles.greeting}>
              Mabuhay,
            </ThemedText>
            <View style={styles.nameRow}>
              <ThemedText style={styles.userName}>
                {userName || 'Explorer'}
              </ThemedText>
              <ThemedText style={styles.waveEmoji}>{'\uD83D\uDC4B'}</ThemedText>
            </View>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Fixed Search Bar (OUTSIDE animated container - never changes) */}
      <Animated.View style={[styles.fixedSearchContainer, { paddingHorizontal: 12, gap: actionsGap, paddingTop: insets.top + 8, paddingBottom: 16 }, searchBarBackgroundStyle]}>
        <Pressable
          onPress={onSearchPress || (() => {})}
          style={[
            styles.searchBar,
            {
              paddingVertical: searchPaddingVertical,
              paddingHorizontal: searchPaddingHorizontal,
            },
          ]}
        >
          <FontAwesome5 name="search" size={searchIconSize} color="#B0B8C8" />
          <TextInput
            placeholder="Search places, events..."
            placeholderTextColor="#B0B8C8"
            style={[styles.searchInput, { fontSize: searchFontSize }]}
            editable={false}
            pointerEvents="none"
          />
        </Pressable>

        <View style={[styles.iconsContainer, { gap: actionsGap }]}>
          <Pressable
            onPress={onNotificationPress || (() => router.push('/(tabs)/profile' as any))}
            style={[
              styles.iconButton,
              {
                width: iconButtonSize,
                height: iconButtonSize,
                borderRadius: iconButtonSize / 2,
              },
            ]}
          >
            <Ionicons name="notifications-outline" size={iconSize} color="#FFFFFF" />
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>3</ThemedText>
            </View>
          </Pressable>

          <Pressable
            onPress={onCartPress || (() => {})}
            style={[
              styles.iconButton,
              {
                width: iconButtonSize,
                height: iconButtonSize,
                borderRadius: iconButtonSize / 2,
              },
            ]}
          >
            <FontAwesome5 name="shopping-cart" size={cartIconSize} color="#FFFFFF" />
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>2</ThemedText>
            </View>
          </Pressable>
        </View>
      </Animated.View>
    </>
  );
};

export default CollapsibleHeader;

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  solidBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    height: 'auto',
  },
  fixedSearchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1001,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    minHeight: 50, // Prevents scaling with parent
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 3,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E1E1E',
    fontFamily: 'Inter-Regular',
  },
  iconsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  greetingContainer: {
    marginBottom: 16,
    paddingTop: 4,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    letterSpacing: -0.3,
  },
  waveEmoji: {
    fontSize: 24,
    lineHeight: 28,
  },
});

