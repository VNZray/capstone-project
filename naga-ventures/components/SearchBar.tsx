import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Platform,
  StyleProp,
  StyleSheet,
  TextInput,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: () => void;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  iconContainerStyle?: StyleProp<ViewStyle>;
};

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSearch,
  placeholder,
  containerStyle,
  inputStyle,
  iconContainerStyle,
}) => {
  const colorScheme = useColorScheme();
  const color =
    Platform.OS === 'web' ? '#000' : colorScheme === 'dark' ? '#fff' : '#000';

  return (
    <ThemedView
      style={[
        styles.container,
        containerStyle,
        Platform.OS === 'web' && styles.webContainerBackground,
      ]}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Search'}
        placeholderTextColor={color}
        style={[
          styles.input,
          inputStyle,
          { color: color },
          Platform.OS === 'web' && {
            outlineWidth: 0,
            outlineColor: 'transparent',
            borderWidth: 1,
            borderBottomStartRadius: 20,
            borderTopLeftRadius: 20,
          },
        ]}
      />
      <TouchableOpacity
        onPress={onSearch}
        style={[styles.iconContainer, iconContainerStyle]}
      >
        <Ionicons name="search" size={20} color="#fff" />
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  iconContainer: {
    backgroundColor: '#0A2342',
    padding: 16,
    paddingLeft: 20,
    paddingRight: 20,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webContainerBackground: {
    backgroundColor: '#fff',
  },
});

export default SearchBar;
