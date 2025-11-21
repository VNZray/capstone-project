import Container from '@/components/Container';
import Divider from '@/components/Divider';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { BusinessSchedule } from '@/types/Business';
import { FontAwesome5 } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native';

interface BusinessHoursSectionProps {
  hours: BusinessSchedule;
  loading?: boolean;
}

const BusinessHoursSection = ({
  hours,
  loading,
}: BusinessHoursSectionProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const dayOrder = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const formatTime = (t?: string): string => {
    if (!t) return '';
    const parts = t.split(':');
    const h24 = parseInt(parts[0] || '0', 10);
    const m = (parts[1] || '00').padStart(2, '0');
    const suffix = h24 >= 12 ? 'PM' : 'AM';
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return `${h12}:${m} ${suffix}`;
  };

  const getCurrentDay = () => {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return days[new Date().getDay()];
  };

  const currentDay = getCurrentDay();

  const sortedHours = [...hours].sort(
    (a, b) =>
      dayOrder.indexOf(a.day_of_week || '') -
      dayOrder.indexOf(b.day_of_week || '')
  );

  if (loading) {
    return (
      <Container elevation={2} style={styles.container}>
        <View style={styles.header}>
          <FontAwesome5
            name="clock"
            size={20}
            color={isDark ? '#60A5FA' : '#0077B6'}
          />
          <ThemedText type="card-title-small" weight="semi-bold">
            Business Hours
          </ThemedText>
        </View>
        <ThemedText type="body-small" style={{ color: '#6A768E' }}>
          Loading hours…
        </ThemedText>
      </Container>
    );
  }

  if (hours.length === 0) {
    return (
      <Container elevation={2} style={styles.container}>
        <View style={styles.header}>
          <FontAwesome5
            name="clock"
            size={20}
            color={isDark ? '#60A5FA' : '#0077B6'}
          />
          <ThemedText type="card-title-small" weight="semi-bold">
            Business Hours
          </ThemedText>
        </View>
        <ThemedText type="body-small" style={{ color: '#6A768E' }}>
          No business hours available.
        </ThemedText>
      </Container>
    );
  }

  return (
    <Container elevation={2} gap={0} style={styles.container}>
      <View style={styles.header}>
        <FontAwesome5
          name="clock"
          size={20}
          color={isDark ? '#60A5FA' : '#0077B6'}
        />
        <ThemedText type="card-title-small" weight="semi-bold">
          Business Hours
        </ThemedText>
      </View>

      <Divider />

      <View style={styles.hoursContainer}>
        {sortedHours.map((h, idx) => {
          const isOpen = !!h.is_open;
          const isToday = h.day_of_week === currentDay;
          const openStr = formatTime(h.open_time);
          const closeStr = formatTime(h.close_time);

          return (
            <View
              key={`${h.day_of_week}-${idx}`}
              style={[
                styles.hourRow,
                isToday && [
                  styles.todayRow,
                  { backgroundColor: isDark ? '#1E3A5F' : '#E3F2FD' },
                ],
              ]}
            >
              <View style={styles.dayContainer}>
                {isToday && (
                  <View
                    style={[
                      styles.todayIndicator,
                      { backgroundColor: isDark ? '#60A5FA' : '#0077B6' },
                    ]}
                  />
                )}
                <ThemedText
                  type="body-small"
                  weight={isToday ? 'semi-bold' : 'medium'}
                  style={[
                    styles.dayText,
                    isToday && { color: isDark ? '#60A5FA' : '#0077B6' },
                  ]}
                >
                  {h.day_of_week}
                </ThemedText>
              </View>

              <View style={styles.timeContainer}>
                {isOpen ? (
                  <>
                    <View style={styles.timeRow}>
                      <FontAwesome5
                        name="door-open"
                        size={14}
                        color="#16A34A"
                        style={{ marginRight: 6 }}
                      />
                      <ThemedText
                        type="body-small"
                        weight={isToday ? 'medium' : 'normal'}
                        style={{ color: '#16A34A' }}
                      >
                        {openStr}
                      </ThemedText>
                    </View>
                    <ThemedText
                      type="body-small"
                      style={{ color: '#6A768E', marginHorizontal: 4 }}
                    >
                      -
                    </ThemedText>
                    <View style={styles.timeRow}>
                      <FontAwesome5
                        name="door-closed"
                        size={14}
                        color="#DC2626"
                        style={{ marginRight: 6 }}
                      />
                      <ThemedText
                        type="body-small"
                        weight={isToday ? 'medium' : 'normal'}
                        style={{ color: '#DC2626' }}
                      >
                        {closeStr}
                      </ThemedText>
                    </View>
                  </>
                ) : (
                  <View
                    style={[
                      styles.closedBadge,
                      { backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2' },
                    ]}
                  >
                    <FontAwesome5
                      name="times-circle"
                      size={12}
                      color="#DC2626"
                    />
                    <ThemedText
                      type="body-extra-small"
                      weight="medium"
                      style={{ color: '#DC2626', marginLeft: 4 }}
                    >
                      Closed
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </Container>
  );
};

export default BusinessHoursSection;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
    ...Platform.select({
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  hoursContainer: {
    gap: 8,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    ...Platform.select({
      android: {
        elevation: 1,
      },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
      },
    }),
  },
  todayRow: {
    borderWidth: 1.5,
    borderColor: '#0077B6',
    ...Platform.select({
      android: {
        elevation: 2,
      },
    }),
  },
  todayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 6,
  },
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dayText: {
    minWidth: 80,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
