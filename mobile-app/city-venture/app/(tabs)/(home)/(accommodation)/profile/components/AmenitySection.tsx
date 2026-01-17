import Chip from '@/components/Chip';
import Container from '@/components/Container';
import Divider from '@/components/Divider';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontAwesome5 } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native';

interface AmenitySectionProps {
  amenities: { id?: number; name: string }[];
  loading?: boolean;
}

const AmenitySection = ({ amenities, loading }: AmenitySectionProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (loading) {
    return (
      <Container elevation={2} style={styles.container}>
        <View style={styles.header}>
          <FontAwesome5
            name="star"
            size={20}
            color={isDark ? '#FBBF24' : '#F59E0B'}
          />
          <ThemedText type="card-title-small" weight="semi-bold">
            Amenities
          </ThemedText>
        </View>
        <ThemedText type="body-small" style={{ color: '#6A768E' }}>
          Loading amenities…
        </ThemedText>
      </Container>
    );
  }

  if (amenities.length === 0) {
    return (
      <Container elevation={2} style={styles.container}>
        <View style={styles.header}>
          <FontAwesome5
            name="star"
            size={20}
            color={isDark ? '#FBBF24' : '#F59E0B'}
          />
          <ThemedText type="card-title-small" weight="semi-bold">
            Amenities
          </ThemedText>
        </View>
        <ThemedText type="body-small" style={{ color: '#6A768E' }}>
          No amenities listed.
        </ThemedText>
      </Container>
    );
  }

  return (
    <Container
      elevation={2}
      gap={0}
      padding={16}
      style={{
        marginBottom: 16,
        ...Platform.select({
          android: {
            elevation: 3,
          },
        }),
      }}
    >
      <View style={styles.header}>
        <FontAwesome5
          name="star"
          size={20}
          color={isDark ? '#FBBF24' : '#F59E0B'}
        />
        <ThemedText type="card-title-small" weight="semi-bold">
          Amenities
        </ThemedText>

        <View
          style={[
            styles.badge,
            { backgroundColor: isDark ? '#1E3A5F' : '#E3F2FD' },
          ]}
        >
          <ThemedText
            type="body-extra-small"
            weight="semi-bold"
            style={{ color: isDark ? '#60A5FA' : '#0077B6' }}
          >
            {amenities.length}
          </ThemedText>
        </View>
      </View>

      <Divider />

      <View style={styles.amenitiesGrid}>
        {amenities.map((a, idx) => (
          <Chip
            color="secondary"
            elevation={2}
            label={a.name}
            key={a.id != null ? String(a.id) : `${a.name}-${idx}`}
            variant="soft"
            size="medium"
            startIconName="check"
          />
        ))}
      </View>
    </Container>
  );
};

export default AmenitySection;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    gap: 12,
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
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
