import { card, colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontAwesome5 } from '@expo/vector-icons';
import React, { useImperativeHandle, useMemo, useState } from 'react';
import {
    Pressable,
    TextInput as RNTextInput,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import { ThemedText } from './themed-text';

export interface FormTextInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  clearable?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: any;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  variant?: 'solid' | 'outlined' | 'soft';
  size?: 'small' | 'medium' | 'large';
  color?: keyof typeof colors;
  elevation?: 1 | 2 | 3 | 4 | 5 | 6;
  style?: StyleProp<ViewStyle>; // wrapper style
  inputStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>; // inner container style
  testID?: string;
  leftIcon?: keyof typeof FontAwesome5.glyphMap;
  rightIcon?: keyof typeof FontAwesome5.glyphMap;
  onPressRightIcon?: () => void;
  autoFocus?: boolean;
  returnKeyType?: any;
  editable?: boolean;
  // grid columns support: span 1..3 across a 3-col layout (default 1)
  columns?: 1 | 2 | 3;
  // show character counter when maxLength provided
  showCounter?: boolean;
}

export interface FormTextInputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  getValue: () => string;
}

function getElevation(
  level: FormTextInputProps['elevation']
): ViewStyle | undefined {
  if (!level) return undefined;
  const iosShadow: Record<number, ViewStyle> = {
    1: {
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    2: {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
    },
    3: {
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    4: {
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
    },
    5: {
      shadowColor: '#000',
      shadowOpacity: 0.14,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
    },
    6: {
      shadowColor: '#000',
      shadowOpacity: 0.16,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
    },
  };
  const android: Record<number, ViewStyle> = {
    1: { elevation: 1 },
    2: { elevation: 2 },
    3: { elevation: 3 },
    4: { elevation: 4 },
    5: { elevation: 5 },
    6: { elevation: 6 },
  };
  return android[level];
}

const FormTextInput = React.forwardRef<FormTextInputRef, FormTextInputProps>(
  (
    {
      label,
      placeholder = 'Enter text',
      value,
      defaultValue = '',
      onChangeText,
      onBlur,
      onFocus,
      helperText,
      errorText,
      disabled,
      clearable = true,
      secureTextEntry,
      keyboardType,
      multiline,
      numberOfLines,
      maxLength,
      autoCapitalize = 'sentences',
      variant = 'outlined',
      size = 'medium',
      color = 'primary',
      elevation = 0,
      style,
      inputStyle,
      containerStyle,
      testID,
      leftIcon,
      rightIcon,
      onPressRightIcon,
      autoFocus,
      returnKeyType,
      editable = true,
      columns = 1,
      showCounter,
    },
    ref
  ) => {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const accent = colors[color] || colors.primary;
    const surface = isDark ? card.dark : card.light;
    const borderColor = isDark ? '#2A3142' : '#D8DFEA';
    const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
    const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
    const errorColor = colors.error;

    const controlled = value !== undefined;
    const [internal, setInternal] = useState(defaultValue);
    const currentValue = controlled ? value! : internal;

    const sizeCfg = useMemo(() => {
      switch (size) {
        case 'small':
          return { h: 40, font: 13, padH: 12, padV: 8, icon: 14 };
        case 'large':
          return { h: 54, font: 16, padH: 16, padV: 14, icon: 18 };
        default:
          return { h: 48, font: 14, padH: 14, padV: 12, icon: 16 };
      }
    }, [size]);

    const variantStyles = useMemo(() => {
      if (variant === 'solid')
        return { backgroundColor: surface, borderWidth: 1, borderColor };
      if (variant === 'outlined')
        return {
          backgroundColor: isDark ? '#1B2232' : '#FFFFFF',
          borderWidth: 0.3,
          borderColor: accent,
        };
      // soft
      return {
        backgroundColor: isDark ? '#1E2535' : '#EEF3FA',
        borderWidth: 1,
        borderColor,
      };
    }, [variant, surface, borderColor, accent, isDark]);

    const handleChange = (t: string) => {
      if (!controlled) setInternal(t);
      onChangeText?.(t);
    };

    const clear = () => {
      if (!controlled) setInternal('');
      onChangeText?.('');
    };

    useImperativeHandle(
      ref,
      () => ({
        focus: () => inputRef.current?.focus(),
        blur: () => inputRef.current?.blur(),
        clear,
        getValue: () => currentValue,
      }),
      [currentValue]
    );

    const inputRef = React.useRef<RNTextInput>(null);

    const elevationStyle = useMemo(
      () => getElevation(elevation as 1 | 2 | 3 | 4 | 5 | 6 | undefined),
      [elevation]
    );

    // grid columns style (consumer should wrap in a flex row of width 100%)
    const colStyle: ViewStyle = useMemo(() => {
      const pct = columns === 3 ? 100 : columns === 2 ? 66.6666 : 33.3333; // treat columns as span out of 3? default 1 => 33%
      // But requirement: default 1 column meaning full width? The description ambiguous.
      // We'll interpret: default single column (full width). If user passes columns=2 -> 50%, 3 -> 33.33%. Provide more intuitive mapping.
      if (columns === 1) return { flex: 1 };
      if (columns === 2) return { flexBasis: '48%', width: '48%' };
      return { flexBasis: '31%', width: '31%' };
    }, [columns]);

    const showClear = clearable && !!currentValue && !disabled && editable;

    return (
      <View style={[style, colStyle]} testID={testID}>
        {label && (
          <ThemedText
            type="label-small"
            weight="semi-bold"
            mb={6}
            style={{ color: subTextColor }}
          >
            {label}
          </ThemedText>
        )}
        <View
          style={[
            styles.inputOuter,
            {
              minHeight: sizeCfg.h,
              paddingHorizontal: sizeCfg.padH,
              paddingVertical: multiline ? sizeCfg.padV : 0,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: multiline ? 'flex-start' : 'center',
            },
            variantStyles,
            elevationStyle,
            !!errorText && { borderColor: errorColor },
            disabled && { opacity: 0.6 },
            containerStyle,
          ]}
        >
          {leftIcon && (
            <View style={{ marginRight: 10, paddingTop: multiline ? 6 : 0 }}>
              <FontAwesome5
                name={leftIcon}
                size={sizeCfg.icon}
                color={subTextColor}
              />
            </View>
          )}
          <RNTextInput
            ref={inputRef}
            style={[
              styles.input,
              {
                color: textColor,
                fontSize: sizeCfg.font,
                paddingVertical: multiline ? 4 : 0,
                flex: 1,
              },
              inputStyle,
            ]}
            placeholder={placeholder}
            placeholderTextColor={subTextColor}
            value={currentValue}
            editable={!disabled && editable}
            onChangeText={handleChange}
            onBlur={onBlur}
            onFocus={onFocus}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={numberOfLines}
            maxLength={maxLength}
            autoCapitalize={autoCapitalize}
            autoFocus={autoFocus}
            returnKeyType={returnKeyType}
          />
          {showCounter && maxLength != null && (
            <Text style={[styles.counter, { color: subTextColor }]}>
              {currentValue.length}/{maxLength}
            </Text>
          )}
          {showClear && (
            <Pressable
              onPress={clear}
              hitSlop={10}
              style={({ pressed }) => [
                { padding: 4, borderRadius: 4 },
                pressed && { opacity: 0.6 },
              ]}
            >
              <FontAwesome5
                name="times-circle"
                size={16}
                color={subTextColor}
              />
            </Pressable>
          )}
          {rightIcon && (
            <Pressable
              disabled={!onPressRightIcon}
              onPress={onPressRightIcon}
              hitSlop={10}
              style={{ marginLeft: 8, paddingTop: multiline ? 4 : 0 }}
            >
              <FontAwesome5
                name={rightIcon}
                size={sizeCfg.icon}
                color={subTextColor}
              />
            </Pressable>
          )}
        </View>
        {!!helperText && !errorText && (
          <ThemedText
            type="label-extra-small"
            mt={4}
            style={{ color: subTextColor }}
          >
            {helperText}
          </ThemedText>
        )}
        {!!errorText && (
          <ThemedText
            type="label-extra-small"
            mt={4}
            style={{ color: errorColor }}
          >
            {errorText}
          </ThemedText>
        )}
      </View>
    );
  }
);

export default FormTextInput;

const styles = StyleSheet.create({
  inputOuter: {
    borderWidth: 1,
  },
  input: {
    fontWeight: '500',
  },
  counter: {
    fontSize: 11,
    marginRight: 6,
    alignSelf: 'center',
  },
});
