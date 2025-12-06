import { Colors } from '@/constants/color';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';

const SectionHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIndicator} />
    <View>
      <ThemedText type="label-small" weight="bold" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      {subtitle && (
        <ThemedText
          type="body-small"
          style={{ color: Colors.light.textSecondary }}
        >
          {subtitle}
        </ThemedText>
      )}
    </View>
  </View>
);

export default SectionHeader;

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionIndicator: {
    width: 4,
    height: '100%',
    backgroundColor: Colors.light.accent,
    marginRight: 10,
    borderRadius: 2,
  },
  sectionTitle: {
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
