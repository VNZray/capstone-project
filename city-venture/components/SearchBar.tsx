import Chip from '@/components/Chip';
import { ThemedView } from '@/components/themed-view';
import { colors as AppColors, Brand } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SearchFilters } from '@/components/SearchFilters';
  
export type Color =
  | 'primary'
  | 'secondary'
  | 'info'
  | 'success'
  | 'error'
  | 'warning'
  | 'neutral'
  | 'transparent';

type Variant = 'plain' | 'icon-right' | 'icon-left' | 'multi';
type Size = 'sm' | 'md' | 'lg';
type Shape = 'rounded' | 'square';

export type QuickFilter = {
  id: string;
  label: string;
  value: any;
};

type FieldConfig = {
  key: string;
  placeholder?: string;
  ariaLabel?: string;
  keyboardType?: TextInputProps['keyboardType'];
  value?: string;
  defaultValue?: string;
  onChangeText?: (text: string) => void;
  inputStyle?: StyleProp<TextStyle>;
};

type BaseProps = {
  placeholder?: string;
  ariaLabel?: string;
  onSearch?: () => void;
  loading?: boolean;
  showClear?: boolean;
  variant?: Variant;
  size?: Size;
  color?: Color;
  shape?: Shape;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  iconContainerStyle?: StyleProp<ViewStyle>;
  enableFiltering?: boolean;
  quickFilters?: QuickFilter[];
  onQuickFilterChange?: (activeFilters: string[]) => void;
};

// Single field usage (backward compatible)
type SingleFieldProps = {
  value?: string;
  defaultValue?: string;
  onChangeText?: (text: string) => void;
  fields?: undefined;
};

// Multi-field usage
type MultiFieldProps = {
  fields: FieldConfig[];
  value?: undefined;
  defaultValue?: undefined;
  onChangeText?: undefined;
};

type SearchBarProps = BaseProps & (SingleFieldProps | MultiFieldProps);

const SearchBar: React.FC<SearchBarProps> = ({
  // base
  placeholder,
  ariaLabel,
  onSearch,
  loading = false,
  showClear = true,
  variant = 'icon-right',
  size = 'md',
  color = 'neutral',
  shape = 'rounded',
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  iconContainerStyle,
  enableFiltering = false,
  quickFilters,
  onQuickFilterChange,
  // single field
  value,
  defaultValue,
  onChangeText,
  // multi-fields
  fields,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Palette mapping
  const palette = useMemo(() => getPalette(color, isDark), [color, isDark]);

  // Filter state
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);

  const handleQuickFilterPress = (id: string) => {
    let newFilters: string[];
    if (activeQuickFilters.includes(id)) {
      newFilters = activeQuickFilters.filter((f) => f !== id);
    } else {
      newFilters = [...activeQuickFilters, id];
    }
    setActiveQuickFilters(newFilters);
    if (onQuickFilterChange) {
      onQuickFilterChange(newFilters);
    }
  };

  // Single field controlled/uncontrolled
  const [internalValue, setInternalValue] = useState<string>(
    defaultValue ?? ''
  );
  const currentValue = value ?? internalValue;
  const handleChange = (text: string) => {
    if (onChangeText) onChangeText(text);
    else setInternalValue(text);
  };

  // Multi-field internal values
  const [internalFields, setInternalFields] = useState<Record<string, string>>(
    () => {
      const init: Record<string, string> = {};
      (fields ?? []).forEach((f) => {
        if (f.defaultValue != null) init[f.key] = f.defaultValue;
      });
      return init;
    }
  );

  const getFieldValue = (f: FieldConfig) =>
    f.value ?? internalFields[f.key] ?? '';
  const setFieldValue = (f: FieldConfig, text: string) => {
    if (f.onChangeText) f.onChangeText(text);
    else setInternalFields((prev) => ({ ...prev, [f.key]: text }));
  };

  const showClearButton =
    showClear && !loading && variant !== 'multi' && !!currentValue;

  const sizeStyle = sizeStyles[size];
  const radius = shape === 'rounded' ? 999 : 12;

  const LeftButton = (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={ariaLabel || 'Search'}
      onPress={onSearch}
      disabled={loading}
      style={[
        styles.iconContainer,
        {
          backgroundColor: palette.buttonBg,
          borderTopLeftRadius: radius,
          borderBottomLeftRadius: radius,
        },
        iconContainerStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        leftIcon || <Ionicons name="search" size={18} color={Brand.solarGold} />
      )}
    </TouchableOpacity>
  );

  const RightButton = (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={ariaLabel || 'Search'}
      onPress={onSearch}
      disabled={loading}
      style={[
        styles.iconContainer,
        {
          backgroundColor: palette.buttonBg,
          borderTopRightRadius: radius,
          borderBottomRightRadius: radius,
        },
        iconContainerStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        rightIcon || (
          <Ionicons name="search" size={18} color={Brand.solarGold} />
        )
      )}
    </TouchableOpacity>
  );

  const FilterButton = (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Filters"
      onPress={() => setFiltersVisible(!filtersVisible)}
      style={[
        styles.iconContainer,
        { paddingHorizontal: 12 },
        iconContainerStyle,
      ]}
    >
      <Ionicons
        name="options-outline"
        size={20}
        color={filtersVisible ? Brand.solarGold : palette.iconOnBg}
      />
    </TouchableOpacity>
  );

  const renderInput = (
    <View style={[styles.inputWrapper, sizeStyle.inputWrapper]}>
      {/* Leading search icon for plain variant */}
      {variant === 'plain' && (
        <Ionicons
          name="search"
          size={20}
          color={Brand.solarGold}
          style={{ marginLeft: 12, marginRight: 4 }}
        />
      )}
      <TextInput
        value={currentValue}
        onChangeText={handleChange}
        placeholder={placeholder || 'Search'}
        placeholderTextColor={palette.placeholder}
        accessibilityLabel={ariaLabel || 'Search input'}
        returnKeyType="search"
        onSubmitEditing={onSearch}
        style={[
          styles.input,
          sizeStyle.input,
          { color: palette.text },
          inputStyle,
          Platform.OS === 'web' && webInputOverrides(radius),
        ]}
      />
      {showClearButton && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          onPress={() => handleChange('')}
          style={styles.clearBtn}
        >
          <Ionicons name="close" size={16} color={palette.placeholder} />
        </TouchableOpacity>
      )}
      {variant === 'plain' &&
        (enableFiltering
          ? FilterButton
          : rightIcon && <View style={{ marginRight: 12 }}>{rightIcon}</View>)}
      {loading && variant === 'plain' && (
        <ActivityIndicator
          style={{ marginRight: 8 }}
          size="small"
          color={palette.iconOnBg}
        />
      )}
    </View>
  );

  const renderMulti = (
    <View style={[styles.multiRow]}>
      {(fields ?? []).map((f, idx) => (
        <View
          key={f.key}
          style={[
            styles.multiField,
            idx !== (fields?.length ?? 1) - 1 && { marginRight: 8 },
          ]}
        >
          <TextInput
            value={getFieldValue(f)}
            onChangeText={(t) => setFieldValue(f, t)}
            placeholder={f.placeholder}
            placeholderTextColor={palette.placeholder}
            accessibilityLabel={
              f.ariaLabel || f.placeholder || `Search field ${idx + 1}`
            }
            keyboardType={f.keyboardType}
            returnKeyType="search"
            onSubmitEditing={onSearch}
            style={[
              styles.input,
              sizeStyle.input,
              { color: palette.text },
              f.inputStyle,
              Platform.OS === 'web' && webInputOverrides(8),
            ]}
          />
          {showClear && !!getFieldValue(f) && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Clear ${f.placeholder || 'field'}`}
              onPress={() => setFieldValue(f, '')}
              style={styles.clearBtn}
            >
              <Ionicons name="close" size={16} color={palette.placeholder} />
            </TouchableOpacity>
          )}
        </View>
      ))}
      {enableFiltering ? FilterButton : RightButton}
    </View>
  );

  return (
    <View style={{ zIndex: 10 }}>
      <ThemedView
        style={[
          styles.container,
          sizeStyle.container,
          {
            backgroundColor: palette.bg,
            borderColor: palette.border,
            borderRadius: radius,
            shadowColor: isDark ? '#000' : '#000',
          },
          Platform.OS === 'web' && styles.webContainerBackground,
          containerStyle,
        ]}
      >
        {variant === 'icon-left' && LeftButton}

        {variant === 'multi' ? (
          renderMulti
        ) : (
          <>
            {renderInput}
            {variant === 'icon-right' &&
              (enableFiltering ? FilterButton : RightButton)}
          </>
        )}
      </ThemedView>

      {/* Quick Filters */}
      {quickFilters && quickFilters.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickFiltersContainer}
          contentContainerStyle={styles.quickFiltersContent}
        >
          {quickFilters.map((filter) => {
            const isActive = activeQuickFilters.includes(filter.id);
            return (
              <Chip
                key={filter.id}
                label={filter.label}
                variant={isActive ? 'solid' : 'soft'}
                color={isActive ? 'primary' : 'neutral'}
                size="small"
                onPress={() => handleQuickFilterPress(filter.id)}
                style={{ marginRight: 8 }}
              />
            );
          })}
        </ScrollView>
      )}

      {/* Filters Component */}
      <SearchFilters
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        onApply={(filters) => {
          console.log('Filters applied:', filters);
          setFiltersVisible(false);
          if (onSearch) onSearch();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
    zIndex: 20,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
  },
  iconContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  multiRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  multiField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  webContainerBackground: {
    backgroundColor: '#fff',
  },
  quickFiltersContainer: {
    marginTop: 12,
  },
  quickFiltersContent: {
    paddingRight: 16,
  },
});

const sizeStyles = {
  sm: StyleSheet.create({
    container: { minHeight: 36 },
    inputWrapper: {},
    input: { paddingVertical: 8, paddingHorizontal: 10, fontSize: 14 },
  }),
  md: StyleSheet.create({
    container: { minHeight: 44 },
    inputWrapper: {},
    input: { paddingVertical: 12, paddingHorizontal: 14, fontSize: 16 },
  }),
  lg: StyleSheet.create({
    container: { minHeight: 52 },
    inputWrapper: {},
    input: { paddingVertical: 16, paddingHorizontal: 16, fontSize: 18 },
  }),
} as const;

function getPalette(c: Color, isDark: boolean) {
  const base = {
    primary: AppColors.primary,
    secondary: AppColors.secondary,
    info: AppColors.info,
    success: AppColors.success,
    error: AppColors.error,
    warning: AppColors.warning,
    neutral: isDark ? '#2A2F36' : '#F1F5FB',
    transparent: 'transparent',
  } as Record<Color, string>;

  const border =
    c === 'transparent'
      ? isDark
        ? '#2A2F36'
        : '#E8EBF0'
      : c === 'neutral'
      ? isDark
        ? '#2A2F36'
        : '#E8EBF0'
      : base[c];
  const bg =
    c === 'transparent'
      ? 'transparent'
      : c === 'neutral'
      ? isDark
        ? '#1B1F24'
        : '#fff'
      : '#fff';
  const text = isDark ? '#ECEDEE' : '#11181C';
  const placeholder = isDark ? '#9BA1A6' : '#6B7280';
  const buttonBg =
    c === 'transparent' || c === 'neutral' ? AppColors.primary : base[c];
  const iconOnBg = isDark ? '#ECEDEE' : '#0D1B2A';

  return { border, bg, text, placeholder, buttonBg, iconOnBg };
}

function webInputOverrides(radius: number) {
  return {
    outlineWidth: 0 as unknown as number,
    outlineColor: 'transparent',
    borderWidth: 0,
    borderTopLeftRadius: radius,
    borderBottomLeftRadius: radius,
  } as TextStyle;
}

export default SearchBar;
