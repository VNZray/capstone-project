import React from 'react';
import { View, StyleSheet, Pressable, Image, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/color';
import { useAuth } from '@/context/AuthContext';

type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  route: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home-variant-outline', route: '/(tabs)/(home)' },
  { id: 'maps', label: 'Maps', icon: 'map-outline', route: '/(tabs)/maps' },
  { id: 'favorites', label: 'Favorites', icon: 'heart-outline', route: '/(tabs)/favorite' },
  { id: 'orders', label: 'Orders', icon: 'clipboard-list-outline', route: '/(tabs)/orders' },
  { id: 'profile', label: 'Profile', icon: 'account-circle-outline', route: '/(tabs)/(profile)' },
];

export const WebSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme() ?? 'light';
  const { user } = useAuth();
  const isDark = colorScheme === 'dark';

  const isActive = (route: string) => {
    if (route === '/(tabs)/(home)' && pathname === '/') return true;
    return pathname.startsWith(route);
  };

  return (
    <View style={[
      styles.sidebar, 
      { 
        backgroundColor: isDark ? '#151718' : '#FFFFFF',
        borderRightColor: isDark ? '#2D3133' : '#E5E7EB'
      }
    ]}>
      <View style={styles.logoContainer}>
        {/* Replace with your actual logo asset */}
        <View style={styles.logoPlaceholder}>
           <MaterialCommunityIcons name="city-variant-outline" size={32} color={Colors[colorScheme].tint} />
        </View>
        <ThemedText type="sub-title-medium" style={styles.appName}>City Venture</ThemedText>
      </View>

      <View style={styles.navContainer}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.route);
          const activeColor = Colors[colorScheme].tint;
          const inactiveColor = isDark ? '#9BA1A6' : '#687076';

          return (
            <Pressable
              key={item.id}
              style={({ pressed, hovered }) => [
                styles.navItem,
                active && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(10,126,164,0.1)' },
                hovered && { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' },
                pressed && { opacity: 0.7 }
              ]}
              onPress={() => router.push(item.route as any)}
            >
              <MaterialCommunityIcons 
                name={active ? item.icon.replace('-outline', '') as any : item.icon} 
                size={24} 
                color={active ? activeColor : inactiveColor} 
              />
              <ThemedText 
                style={[
                  styles.navLabel, 
                  { color: active ? activeColor : inactiveColor, fontWeight: active ? '600' : '400' }
                ]}
              >
                {item.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.userContainer, { borderTopColor: isDark ? '#2D3133' : '#E5E7EB' }]}>
        <View style={styles.avatar}>
          <ThemedText style={styles.avatarText}>
            {user?.first_name?.[0] || 'U'}
          </ThemedText>
        </View>
        <View style={styles.userInfo}>
          <ThemedText type="body-medium" weight="semi-bold" numberOfLines={1}>
            {user?.first_name || 'Guest'}
          </ThemedText>
          <ThemedText type="label-small" style={{ opacity: 0.7 }}>
            View Profile
          </ThemedText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 280,
    height: '100%',
    borderRightWidth: 1,
    paddingVertical: 24,
    display: Platform.select({ web: 'flex', default: 'none' }),
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
    gap: 12,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
  },
  navContainer: {
    flex: 1,
    paddingHorizontal: 12,
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 16,
    cursor: 'pointer',
  },
  navLabel: {
    fontSize: 15,
  },
  userContainer: {
    padding: 16,
    marginHorizontal: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0A1B47',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
});
