import Container from '@/components/Container';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontAwesome5 } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

interface AboutSectionProps {
  description?: string;
}

const AboutSection = ({ description }: AboutSectionProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [expanded, setExpanded] = useState(false);

  const raw = description
    ? description.replace(/^"|"$/g, '').trim()
    : '';

  const hasContent = raw.length > 0;
  const needsExpansion = raw.length > 200;
  const displayText = !hasContent
    ? 'No description provided.'
    : expanded || !needsExpansion
    ? raw
    : `${raw.slice(0, 200)}…`;

  return (
    <Container elevation={2} style={styles.container}>
      <View style={styles.header}>
        <FontAwesome5 name="info-circle" size={20} color={isDark ? '#60A5FA' : '#0077B6'} />
        <ThemedText type="card-title-small" weight="semi-bold">
          About
        </ThemedText>
      </View>

      <ThemedText 
        type="body-small" 
        style={{ 
          lineHeight: 22,
          color: !hasContent ? '#6A768E' : undefined 
        }}
      >
        {displayText}
      </ThemedText>

      {needsExpansion && (
        <Pressable 
          onPress={() => setExpanded((s) => !s)}
          style={styles.expandButton}
        >
          <ThemedText 
            type="link-small" 
            weight="semi-bold"
            style={{ color: isDark ? '#60A5FA' : '#0077B6' }}
          >
            {expanded ? 'Show less' : 'Read more'}
          </ThemedText>
          <FontAwesome5 
            name={expanded ? 'chevron-up' : 'chevron-down'} 
            size={12} 
            color={isDark ? '#60A5FA' : '#0077B6'} 
          />
        </Pressable>
      )}
    </Container>
  );
};

export default AboutSection;

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
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
});
