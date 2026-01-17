import { card, Colors, colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontAwesome5 } from '@expo/vector-icons';
import React, {
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import {
  Platform,
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
import { IconSymbol } from './ui/icon-symbol';

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
  color?: 'primary' | 'success' | 'warning' | 'error';
  elevation?: 1 | 2 | 3 | 4 | 5 | 6;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
  leftIcon?: keyof typeof FontAwesome5.glyphMap;
  rightIcon?: keyof typeof FontAwesome5.glyphMap;
  onPressRightIcon?: () => void;
  autoFocus?: boolean;
  returnKeyType?: any;
  editable?: boolean;
  columns?: 1 | 2 | 3 | 4;
  showCounter?: boolean;
  required?: boolean;
  minLength?: number;
  pattern?: RegExp;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  customValidator?: (value: string) => string | null;
}

export interface FormTextInputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  getValue: () => string;
  validate: () => boolean;
  getError: () => string | null;
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
    1: {
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    2: {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    3: {
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
    },
    4: {
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.14,
      shadowRadius: 5,
    },
    5: {
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.16,
      shadowRadius: 6,
    },
    6: {
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.18,
      shadowRadius: 7,
    },
  };

  return Platform.select({
    ios: iosShadow[level],
    android: android[level],
    default: android[level],
  });
}

const FormTextInput = React.forwardRef<FormTextInputRef, FormTextInputProps>(
  (props, ref) => {
    const {
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
      startDecorator,
      endDecorator,
      leftIcon,
      rightIcon,
      onPressRightIcon,
      autoFocus,
      returnKeyType,
      editable = true,
      columns = 1,
      showCounter,
      required = false,
      minLength,
      pattern,
      validateOnBlur = true,
      validateOnChange = false,
      customValidator,
    } = props;

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
    const [validationError, setValidationError] = useState<string | null>(null);
    const currentValue = controlled ? value! : internal;

    const sizeCfg = useMemo(() => {
      switch (size) {
        case 'small':
          return { h: 40, font: 13, padH: 10, padV: 8, icon: 18 };
        case 'large':
          return { h: 54, font: 16, padH: 16, padV: 14, icon: 22 };
        default:
          return { h: 48, font: 14, padH: 14, padV: 12, icon: 20 };
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
      return {
        backgroundColor: isDark ? '#1E2535' : '#EEF3FA',
        borderWidth: 1,
        borderColor,
      };
    }, [variant, surface, borderColor, accent, isDark]);

    const handleChange = (t: string) => {
      if (!controlled) setInternal(t);
      onChangeText?.(t);
      if (validateOnChange) {
        validate(t);
      }
    };

    const handleBlur = () => {
      onBlur?.();
      if (validateOnBlur) {
        validate();
      }
    };

    const clear = () => {
      if (!controlled) setInternal('');
      onChangeText?.('');
    };

    const validate = useCallback(
      (valueToValidate?: string): boolean => {
        const val = valueToValidate ?? currentValue;
        let error: string | null = null;

        if (required && (!val || val.trim() === '')) {
          error = `${label || 'This field'} is required`;
        } else if (minLength && val.length < minLength) {
          error = `${
            label || 'This field'
          } must be at least ${minLength} characters`;
        } else if (pattern && !pattern.test(val)) {
          error = `${label || 'This field'} format is invalid`;
        } else if (customValidator) {
          const customError = customValidator(val);
          if (customError) {
            error = customError;
          }
        }

        setValidationError(error);
        return error === null;
      },
      [currentValue, required, minLength, pattern, customValidator, label]
    );

    const getError = useCallback(() => {
      return validationError;
    }, [validationError]);

    const inputRef = React.useRef<RNTextInput>(null);

    useImperativeHandle(
      ref,
      () => ({
        focus: () => inputRef.current?.focus(),
        blur: () => inputRef.current?.blur(),
        clear,
        getValue: () => currentValue,
        validate,
        getError,
      }),
      [currentValue, validate, getError]
    );

    const elevationStyle = useMemo(
      () => getElevation(elevation as 1 | 2 | 3 | 4 | 5 | 6 | undefined),
      [elevation]
    );

    const colStyle: ViewStyle = useMemo(() => {
      if (columns === 1) return { flex: 1 };
      if (columns === 2) return { width: '48%' };
      if (columns === 3) return { width: '31%' };
      return { width: '18%' };
    }, [columns]);

    const showClear = clearable && !!currentValue && !disabled && editable;

    return (
      <View style={[style, colStyle]} testID={testID}>
        {label && (
          <ThemedText
            type="label-medium"
            weight="semi-bold"
            mb={6}
            style={{ color: subTextColor }}
          >
            {label}
            {required && <Text style={{ color: errorColor }}> *</Text>}
            {!required && ' (Optional)'}
          </ThemedText>
        )}
        <View
          style={[
            styles.inputOuter,
            {
              minHeight: sizeCfg.h,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: multiline ? 'flex-start' : 'center',
            },
            variantStyles,
            elevationStyle,
            (!!errorText || !!validationError) && { borderColor: errorColor },
            disabled && { opacity: 0.6 },
            containerStyle,
          ]}
        >
          {startDecorator ? (
            <View
              style={{
                paddingTop: multiline ? 6 : 0,
                marginLeft: 16,
              }}
            >
              {startDecorator}
            </View>
          ) : leftIcon ? (
            <View style={{ paddingTop: multiline ? 6 : 0 }}>
              <FontAwesome5
                name={leftIcon}
                size={sizeCfg.icon}
                color={subTextColor}
              />
            </View>
          ) : null}
          <RNTextInput
            ref={inputRef}
            style={[
              styles.input,
              {
                color: textColor,
                fontSize: sizeCfg.font,
                paddingHorizontal: sizeCfg.padH,
                paddingVertical: multiline ? sizeCfg.padV : 0,
                flex: 1,
                height: multiline
                  ? sizeCfg.h * (numberOfLines || 1)
                  : sizeCfg.h,
              },
              Platform.select({
                android: {
                  textAlignVertical: multiline ? 'top' : 'center',
                },
              }),
              inputStyle,
            ]}
            placeholder={placeholder}
            placeholderTextColor={subTextColor}
            value={currentValue}
            editable={!disabled && editable}
            onChangeText={handleChange}
            onBlur={handleBlur}
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
                { padding: 4, borderRadius: 4, marginRight: 8 },
                pressed && { opacity: 0.6 },
              ]}
            >
              <IconSymbol
                name="x.circle"
                size={sizeCfg.icon}
                color={Colors.light.text}
              />
            </Pressable>
          )}
          {endDecorator ? (
            <View
              style={{
                marginLeft: 8,
                marginRight: 12,
                paddingTop: multiline ? 4 : 0,
              }}
            >
              {endDecorator}
            </View>
          ) : rightIcon ? (
            <Pressable
              disabled={!onPressRightIcon}
              onPress={onPressRightIcon}
              hitSlop={10}
              style={{
                marginRight: 12,
                paddingTop: multiline ? 4 : 0,
              }}
            >
              <FontAwesome5
                name={rightIcon}
                size={sizeCfg.icon}
                color={subTextColor}
              />
            </Pressable>
          ) : null}
        </View>
        {!!helperText && !errorText && !validationError && (
          <ThemedText
            type="label-extra-small"
            mt={4}
            style={{ color: subTextColor }}
          >
            {helperText}
          </ThemedText>
        )}
        {(!!errorText || !!validationError) && (
          <ThemedText
            type="label-extra-small"
            mt={4}
            style={{ color: errorColor }}
          >
            {errorText || validationError}
          </ThemedText>
        )}
      </View>
    );
  }
);

FormTextInput.displayName = 'FormTextInput';

export default FormTextInput;

const styles = StyleSheet.create({
  inputOuter: {
    borderWidth: 1,
    ...Platform.select({
      android: {
        borderStyle: 'solid',
        overflow: 'hidden',
      },
    }),
  },
  input: {
    fontWeight: '500',
    ...Platform.select({
      android: {
        includeFontPadding: false,
        paddingVertical: 0,
      },
    }),
  },
  counter: {
    fontSize: 11,
    marginRight: 6,
    alignSelf: 'center',
    ...Platform.select({
      android: {
        textAlignVertical: 'center',
        includeFontPadding: false,
      },
    }),
  },
});
