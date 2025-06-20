import { Ionicons } from '@expo/vector-icons';
import debounce from 'lodash.debounce';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  value?: string;
  onClear?: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  placeholder = 'Search shops...',
  value = '',
  onClear,
}) => {
  const [inputValue, setInputValue] = useState(value);

  // Create debounced search function
  const debouncedSearch = React.useMemo(
    () =>
      debounce((query: string) => {
        onSearch(query);
      }, 300),
    [onSearch]
  );

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Call debounced search when input changes
  useEffect(() => {
    debouncedSearch(inputValue);

    return () => {
      debouncedSearch.cancel();
    };
  }, [inputValue, debouncedSearch]);

  const handleClear = () => {
    setInputValue('');
    debouncedSearch('');
    onClear?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={placeholder}
          placeholderTextColor="#999"
          returnKeyType="search"
          clearButtonMode="never" // We'll use custom clear button
        />
        {inputValue.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0, // Remove default padding
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default SearchInput;
