import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button, ButtonIcon } from '../custom-ui/Button';

/**
 * Example component demonstrating the new ThemedText API
 */
export default function ThemedTextExample() {
  return (
    <View style={{ padding: 20 }}>
      {/* New API - Headings */}
      <ThemedText.Heading size="3xl">
        Large Heading
      </ThemedText.Heading>

      <ThemedText.Heading size="xl">
        Medium Heading
      </ThemedText.Heading>

      <ThemedText.Heading size="md">
        Small Heading
      </ThemedText.Heading>

      <Button.Icon>

      </Button.Icon>

      {/* New API - Body Text */}
      <ThemedText.Body size="lg">
        This is large body text with Poppins font.
      </ThemedText.Body>

      <ThemedText.Body size="md" bold>
        This is medium bold body text.
      </ThemedText.Body>

      <ThemedText.Body size="sm" italic>
        This is small italic body text.
      </ThemedText.Body>

      {/* Default (Body) */}
      <ThemedText>
        Default body text (size md)
      </ThemedText>

      {/* Legacy API - Still works! */}
      <ThemedText type="body-medium" weight="semi-bold">
        Legacy API: Body medium with semi-bold weight
      </ThemedText>

      <ThemedText type="sub-title-small" weight="bold">
        Legacy API: Sub-title small with bold weight
      </ThemedText>

      {/* With custom colors */}
      <ThemedText.Body 
        size="md" 
        lightColor="#333333" 
        darkColor="#FFFFFF"
      >
        Custom themed text
      </ThemedText.Body>

      {/* With alignment */}
      <ThemedText.Heading size="xl" align="center">
        Centered Heading
      </ThemedText.Heading>

      {/* With Tailwind classes */}
      <ThemedText.Body 
        size="lg" 
        className="text-primary-600"
      >
        Text with Tailwind color
      </ThemedText.Body>
    </View>
  );
}
