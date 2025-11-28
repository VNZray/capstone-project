import React from 'react';
import { View, Pressable, Linking, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import Container from '@/components/Container';
import { FontAwesome5 } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Divider from '@/components/Divider';

interface ContactSectionProps {
  email?: string;
  phone?: string;
  website?: string;
}

const withScheme = (url: string): string => {
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
};

export default function ContactSection({
  email,
  phone,
  website,
}: ContactSectionProps) {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#E5E7EB' : '#0A1B47';
  
  const hasContactInfo = email || phone || website;

  return (
    <Container
    gap={0}
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
        <FontAwesome5 name="address-card" size={16} color={iconColor} />
        <ThemedText type="card-title-small" weight="medium">
          Contact
        </ThemedText>
      </View>

      <View>
        <Divider />
        {!hasContactInfo ? (
          <ThemedText type="body-small" style={{ color: '#6A768E' }}>
            No contact info provided.
          </ThemedText>
        ) : (
          <>
            {email && (
              <Pressable
                onPress={() => Linking.openURL(`mailto:${email}`)}
                accessibilityRole="link"
                style={({ pressed }) => [
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    paddingVertical: 4,
                  },
                  Platform.OS === 'android' && pressed && { opacity: 0.7 },
                ]}
                android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: colorScheme === 'dark' ? '#374151' : '#F3F4F6',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FontAwesome5 name="envelope" size={12} color={iconColor} />
                </View>
                <ThemedText type="body-small" style={{ flex: 1 }}>
                  {email}
                </ThemedText>
              </Pressable>
            )}

            {phone && (
              <Pressable
                onPress={() =>
                  Linking.openURL(`tel:${String(phone).replace(/\s+/g, '')}`)
                }
                accessibilityRole="link"
                style={({ pressed }) => [
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    paddingVertical: 4,
                  },
                  Platform.OS === 'android' && pressed && { opacity: 0.7 },
                ]}
                android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: colorScheme === 'dark' ? '#374151' : '#F3F4F6',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FontAwesome5 name="phone" size={12} color={iconColor} />
                </View>
                <ThemedText type="body-small" style={{ flex: 1 }}>
                  {phone}
                </ThemedText>
              </Pressable>
            )}

            {website && (
              <Pressable
                onPress={() => Linking.openURL(withScheme(website))}
                accessibilityRole="link"
                style={({ pressed }) => [
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    paddingVertical: 4,
                  },
                  Platform.OS === 'android' && pressed && { opacity: 0.7 },
                ]}
                android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: colorScheme === 'dark' ? '#374151' : '#F3F4F6',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FontAwesome5 name="globe" size={12} color={iconColor} />
                </View>
                <ThemedText 
                  type="link-small" 
                  style={{ 
                    flex: 1,
                    color: '#2563EB' 
                  }}
                >
                  {website}
                </ThemedText>
              </Pressable>
            )}
          </>
        )}
      </View>
    </Container>
  );
}
