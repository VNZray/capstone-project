import Button from '@/components/Button';
import StatCard from '@/components/StatCard';
import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

const Profile = () => {
  const { user, logout } = useAuth();
  const scheme = useColorScheme();
  const mode: 'light' | 'dark' = scheme === 'dark' ? 'dark' : 'light';
  const bg = scheme === 'dark' ? '#0F1222' : '#F5F7FB';
  const card = scheme === 'dark' ? '#161A2E' : '#FFFFFF';
  const textMuted = scheme === 'dark' ? '#A9B2D0' : '#6A768E';

  const fullName = `${user?.first_name ?? 'Traveler'} ${
    user?.last_name ?? ''
  }`.trim();
  const handle = useMemo(
    () => (user?.email ? user.email.split('@')[0] : 'wanderer'),
    [user?.email]
  );

  if (!user) {
    // If not authenticated, rely on existing auth flow/guards outside this screen
    return null;
  }

  const onEdit = () => router.push('/(tabs)/(profile)/(edit)');
  const onSettings = () => router.push('/(tabs)/(profile)/(settings)');
  const onBookings = () => router.push('/(tabs)/(profile)/(bookings)');

  const activities = [
    {
      id: '1',
      title: 'Naga City Tour',
      subtitle: 'Saved • 2d ago',
      image: require('@/assets/images/partial-react-logo.png'),
    },
    {
      id: '2',
      title: 'Uma Hotel Residences',
      subtitle: 'Booked • last week',
      image: require('@/assets/images/android-icon-foreground.png'),
    },
    {
      id: '3',
      title: 'Plaza Quince Martires',
      subtitle: 'Reviewed • 3w ago',
      image: require('@/assets/images/react-logo.png'),
    },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Banner */}
        <View style={styles.bannerWrap}>
          <LinearGradient
            colors={[
              scheme === 'dark' ? '#0D1B3D' : '#9BC9FF',
              scheme === 'dark' ? '#1A2F5E' : '#EAF4FF',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          >
            {/* Decorative icons */}
            <FontAwesome5
              name="plane-departure"
              size={18}
              color="rgba(255,255,255,0.7)"
              style={{ position: 'absolute', top: 16, left: 16 }}
            />
            <FontAwesome5
              name="water"
              size={16}
              color="rgba(255,255,255,0.6)"
              style={{ position: 'absolute', bottom: 16, right: 24 }}
            />

            {/* Edit button */}
            <Pressable
              onPress={onEdit}
              style={styles.editBtn}
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
            >
              <FontAwesome5 name="pen" size={14} color="#0A1B47" />
            </Pressable>
          </LinearGradient>

          {/* Avatar */}
          <View style={styles.avatarRingOuter}>
            <View style={[styles.avatarRingInner, { backgroundColor: card }]}>
              <Image
                source={require('@/assets/images/react-logo.png')}
                style={styles.avatar}
                resizeMode="cover"
              />
              <View style={styles.cameraBadge}>
                <FontAwesome5 name="camera" size={12} color="#fff" />
              </View>
            </View>
          </View>
        </View>

        {/* Identity */}
        <View style={{ alignItems: 'center', marginTop: 44 }}>
          <ThemedText type="title-medium" weight="bold" align="center">
            {fullName}
          </ThemedText>
          <ThemedText
            type="body-small"
            align="center"
            style={{ color: textMuted }}
          >
            @{handle} • Traveler | Explorer | Foodie
          </ThemedText>
        </View>

        {/* Stats */}
        <View style={styles.sectionPad}>
          <View style={styles.statsRow}>
            <StatCard
              icon="suitcase-rolling"
              label="Trips"
              value={12}
              card={card}
              scheme={mode}
            />
            <StatCard
              icon="heart"
              label="Favorites"
              value={8}
              card={card}
              scheme={mode}
            />
            <StatCard
              icon="star"
              label="Reviews"
              value={15}
              card={card}
              scheme={mode}
            />
          </View>
        </View>

        {/* Personal Info */}
        <Section title="Personal Info" cardBg={card}>
          <InfoRow icon="envelope" label="Email" value={user.email} />
          <InfoRow icon="phone" label="Phone" value="—" />
          <InfoRow icon="flag" label="Nationality" value="—" />
          <InfoRow icon="user" label="Age / Gender" value="—" last />
        </Section>

        {/* Activity */}
        <Section
          title="Recent Activity"
          cardBg={card}
          onActionPress={onBookings}
          actionLabel="See all"
        >
          {activities.map((a, i) => (
            <ActivityItem
              key={a.id}
              image={a.image}
              title={a.title}
              subtitle={a.subtitle}
              last={i === activities.length - 1}
            />
          ))}
        </Section>

        {/* Footer Actions */}
        <View style={[styles.sectionPad, { gap: 12 }]}>
          <Button
            label="Log Out"
            variant="solid"
            color="error"
            size="large"
            fullWidth
            radius={14}
            startIcon="sign-out-alt"
            onPress={async () => {
              await logout();
              router.replace('/Login');
            }}
          />
          <Button
            label="Settings"
            variant="soft"
            color="info"
            size="large"
            fullWidth
            radius={14}
            startIcon="cog"
            onPress={onSettings}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;

type InfoRowProps = { icon: any; label: string; value: string; last?: boolean };
const InfoRow = ({ icon, label, value, last }: InfoRowProps) => (
  <View style={[styles.infoRow, !last && styles.infoDivider]}>
    <View style={styles.infoIconWrap}>
      <FontAwesome5 name={icon} size={14} color={colors.primary} />
    </View>
    <ThemedText type="body-small" weight="semi-bold" style={{ width: 110 }}>
      {label}
    </ThemedText>
    <ThemedText type="body-small" style={{ color: '#6A768E', flex: 1 }}>
      {value}
    </ThemedText>
  </View>
);

type ActivityItemProps = {
  image: any;
  title: string;
  subtitle: string;
  last?: boolean;
};
const ActivityItem = ({ image, title, subtitle, last }: ActivityItemProps) => (
  <View style={[styles.activityItem, !last && styles.infoDivider]}>
    <Image source={image} style={styles.activityThumb} />
    <View style={{ flex: 1, marginLeft: 12 }}>
      <ThemedText type="body-medium" weight="semi-bold">
        {title}
      </ThemedText>
      <ThemedText type="label-small" style={{ color: '#6A768E' }}>
        {subtitle}
      </ThemedText>
    </View>
    <FontAwesome5 name="chevron-right" size={12} color="#9AA4B2" />
  </View>
);

type SectionProps = {
  title: string;
  children: React.ReactNode;
  cardBg: string;
  onActionPress?: () => void;
  actionLabel?: string;
};
const Section = ({
  title,
  children,
  cardBg,
  onActionPress,
  actionLabel,
}: SectionProps) => (
  <View style={styles.sectionPad}>
    <View style={styles.sectionHeader}>
      <ThemedText type="sub-title-small" weight="bold">
        {title}
      </ThemedText>
      {onActionPress ? (
        <Pressable onPress={onActionPress}>
          <ThemedText type="link-small">{actionLabel ?? 'More'}</ThemedText>
        </Pressable>
      ) : null}
    </View>
    <View style={[styles.card, { backgroundColor: cardBg }, shadow(1)]}>
      {children}
    </View>
  </View>
);

// ---------- Styles ----------
const styles = StyleSheet.create({
  screen: { flex: 1 },
  bannerWrap: { position: 'relative' },
  banner: { height: 200 },
  editBtn: {
    position: 'absolute',
    right: 16,
    top: 50,
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRingOuter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -44,
    alignItems: 'center',
  },
  avatarRingInner: {
    width: 112,
    height: 112,
    borderRadius: 56,
    padding: 4,
    borderWidth: 3,
    borderColor: '#FFFFFFAA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  cameraBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionPad: { paddingHorizontal: 20, marginTop: 18 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
    flexDirection: 'row',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  card: { borderRadius: 16, padding: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  infoDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E6EF',
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF4FF',
    marginRight: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityThumb: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#EAEFF7',
  },
});

// Soft shadow helper
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
