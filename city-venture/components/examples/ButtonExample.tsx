import React from 'react';
import { View, ScrollView } from 'react-native';
import { Button } from '../custom-ui/Button';
import { ThemedText } from '../themed-text';
import { Heart, Plus, Send, Settings, X, ChevronRight, Download } from 'lucide-react-native';

export default function ButtonExample() {
  return (
    <ScrollView className="flex-1 p-4 bg-background-0">
      <View className="gap-8">
        <View className="gap-4">
          <ThemedText.Heading size="lg" bold>
            Button.Icon Examples
          </ThemedText.Heading>
          <ThemedText.Body>Icon-only buttons</ThemedText.Body>
          
          <View className="flex-row gap-2 flex-wrap">
            <Button action="primary" size="md">
              <Button.Icon as={Heart} />
            </Button>
            
            <Button action="positive" variant="outline" size="md">
              <Button.Icon as={Plus} />
            </Button>
            
            <Button action="negative" variant="outline" size="md">
              <Button.Icon as={X} />
            </Button>
            
            <Button action="secondary" size="lg">
              <Button.Icon as={Settings} />
            </Button>
          </View>
        </View>

        <View className="gap-4">
          <ThemedText.Heading size="lg" bold>
            Button.Text Examples
          </ThemedText.Heading>
          <ThemedText.Body>Text buttons</ThemedText.Body>
          
          <View className="gap-3">
            <Button action="primary" variant="solid">
              <Button.Text>Primary Button</Button.Text>
            </Button>
            
            <Button action="positive" variant="outline">
              <Button.Icon as={Heart} />
              <Button.Text>With Icon</Button.Text>
            </Button>
            
            <Button action="secondary" variant="outline">
              <Button.Text>Download</Button.Text>
              <Button.Icon as={ChevronRight} />
            </Button>
            
            <Button action="negative" size="lg">
              <Button.Icon as={X} />
              <Button.Text>Delete</Button.Text>
              <Button.Icon as={ChevronRight} />
            </Button>
          </View>
        </View>

        <View className="gap-4">
          <ThemedText.Heading size="lg" bold>
            Button (Default) Examples
          </ThemedText.Heading>
          <ThemedText.Body>Custom content buttons</ThemedText.Body>
          
          <View className="gap-3">
            <Button action="primary" variant="solid">
              <ThemedText.Body className="text-typography-0 font-semibold">
                Custom Content
              </ThemedText.Body>
            </Button>
            
            <Button action="positive" variant="outline">
              <Button.Icon as={Download} />
              <ThemedText.Body className="text-success-500 font-semibold">
                Download Now
              </ThemedText.Body>
            </Button>
            
            <Button action="warning" variant="solid">
              <Button.Icon as={X} />
              <ThemedText.Body className="text-typography-0 font-semibold">
                Warning Action
              </ThemedText.Body>
            </Button>
          </View>
        </View>

        <View className="gap-4">
          <ThemedText.Heading size="lg" bold>
            Button.Spinner Examples
          </ThemedText.Heading>
          <ThemedText.Body>Loading states</ThemedText.Body>
          
          <View className="gap-3">
            <Button action="primary" variant="solid" disabled>
              <Button.Spinner />
              <Button.Text>Loading...</Button.Text>
            </Button>
            
            <Button action="positive" variant="outline" disabled>
              <Button.Spinner />
              <Button.Text>Processing</Button.Text>
            </Button>
          </View>
        </View>

        <View className="gap-4">
          <ThemedText.Heading size="lg" bold>
            Button.Group Examples
          </ThemedText.Heading>
          <ThemedText.Body>Button grouping</ThemedText.Body>
          
          <ThemedText.Body bold className="mt-2">
            Row Direction
          </ThemedText.Body>
          <Button.Group flexDirection="row" space="sm">
            <Button action="primary" variant="outline">
              <Button.Text>Option 1</Button.Text>
            </Button>
            <Button action="primary" variant="outline">
              <Button.Text>Option 2</Button.Text>
            </Button>
            <Button action="primary" variant="outline">
              <Button.Text>Option 3</Button.Text>
            </Button>
          </Button.Group>

          <ThemedText.Body bold className="mt-2">
            Column Direction
          </ThemedText.Body>
          <Button.Group flexDirection="column" space="md">
            <Button action="positive">
              <Button.Icon as={Plus} />
              <Button.Text>Add Item</Button.Text>
            </Button>
            <Button action="negative">
              <Button.Icon as={X} />
              <Button.Text>Remove Item</Button.Text>
            </Button>
            <Button action="secondary">
              <Button.Icon as={Settings} />
              <Button.Text>Settings</Button.Text>
            </Button>
          </Button.Group>

          <ThemedText.Body bold className="mt-2">
            Icon Button Group
          </ThemedText.Body>
          <Button.Group flexDirection="row" space="xs">
            <Button action="primary" variant="outline">
              <Button.Icon as={Heart} />
            </Button>
            <Button action="positive" variant="outline">
              <Button.Icon as={Plus} />
            </Button>
            <Button action="secondary" variant="outline">
              <Button.Icon as={Send} />
            </Button>
            <Button action="default" variant="outline">
              <Button.Icon as={Settings} />
            </Button>
          </Button.Group>
        </View>

        <View className="gap-4 mb-8">
          <ThemedText.Heading size="lg" bold>
            Size Variations
          </ThemedText.Heading>
          
          <View className="gap-2">
            <Button size="xs" action="primary">
              <Button.Text>Extra Small</Button.Text>
            </Button>
            <Button size="sm" action="primary">
              <Button.Text>Small</Button.Text>
            </Button>
            <Button size="md" action="primary">
              <Button.Text>Medium (Default)</Button.Text>
            </Button>
            <Button size="lg" action="primary">
              <Button.Text>Large</Button.Text>
            </Button>
            <Button size="xl" action="primary">
              <Button.Text>Extra Large</Button.Text>
            </Button>
          </View>
        </View>

        <View className="gap-4 mb-8">
          <ThemedText.Heading size="lg" bold>
            Action Colors
          </ThemedText.Heading>
          
          <View className="gap-2">
            <Button action="primary">
              <Button.Text>Primary</Button.Text>
            </Button>
            <Button action="secondary">
              <Button.Text>Secondary</Button.Text>
            </Button>
            <Button action="positive">
              <Button.Text>Positive/Success</Button.Text>
            </Button>
            <Button action="negative">
              <Button.Text>Negative/Error</Button.Text>
            </Button>
            <Button action="warning">
              <Button.Text>Warning</Button.Text>
            </Button>
            <Button action="default">
              <Button.Text>Default</Button.Text>
            </Button>
          </View>
        </View>

        <View className="gap-4 mb-8">
          <ThemedText.Heading size="lg" bold>
            Variant Styles
          </ThemedText.Heading>
          
          <View className="gap-2">
            <Button action="primary" variant="solid">
              <Button.Text>Solid</Button.Text>
            </Button>
            <Button action="primary" variant="outline">
              <Button.Text>Outline</Button.Text>
            </Button>
            <Button action="primary" variant="link">
              <Button.Text>Link</Button.Text>
            </Button>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
