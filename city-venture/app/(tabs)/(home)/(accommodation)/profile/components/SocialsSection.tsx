import React from 'react';
import { View, Pressable, Linking, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import Container from '@/components/Container';
import { FontAwesome5 } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SocialsSectionProps {
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
}

const withScheme = (url: string): string => {
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
};

export default function SocialsSection({
  facebookUrl,
  twitterUrl,
  instagramUrl,
}: SocialsSectionProps) {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#E5E7EB' : '#0A1B47';

  const socials = [
    { icon: 'facebook', url: facebookUrl, label: 'Facebook', color: '#1877F2' },
    { icon: 'twitter', url: twitterUrl, label: 'Twitter', color: '#1DA1F2' },
    { icon: 'instagram', url: instagramUrl, label: 'Instagram', color: '#E4405F' },
  ].filter((s) => s.url && s.url.trim() !== '');

  return (
    <Container
      style={[
        { padding: 16, marginVertical: 8 },
        Platform.OS === 'android' && {
          elevation: 2,
          shadowColor: '#000',
        },
        Platform.OS === 'ios' && {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <FontAwesome5 name="share-alt" size={16} color={iconColor} />
        <ThemedText type="card-title-small" weight="medium">
          Social Media
        </ThemedText>
      </View>

      <View
        style={{
          marginTop: 12,
          flexDirection: 'row',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {socials.length === 0 ? (
          <ThemedText type="body-small" style={{ color: '#6A768E' }}>
            No social media links provided.
          </ThemedText>
        ) : (
          socials.map((social, idx) => (
            <Pressable
              key={`${social.icon}-${idx}`}
              onPress={() => Linking.openURL(withScheme(social.url!))}
              accessibilityRole="link"
              accessibilityLabel={`Open ${social.label}`}
              style={({ pressed }) => [
                Platform.OS === 'android' && pressed && { opacity: 0.7 },
              ]}
              android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: social.color,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FontAwesome5 
                  name={social.icon as any} 
                  size={20} 
                  color="#fff" 
                />
              </View>
            </Pressable>
          ))
        )}
      </View>
    </Container>
  );
}
