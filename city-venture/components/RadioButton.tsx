import { card, colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontAwesome5 } from '@expo/vector-icons';
import React, { useCallback, useImperativeHandle, useState } from 'react';
import { Platform, Pressable, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { ThemedText } from './themed-text';

// Types -----------------------------------------------------------
export interface RadioItem {
  id: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
  icon?: keyof typeof FontAwesome5.glyphMap;
}

export type RadioVariant = 'filled' | 'unfilled';
export type RadioType = 'chip' | 'text';
export type RadioSize = 'small' | 'medium' | 'large';
export type RadioColor = keyof typeof colors;

export interface RadioGroupProps<T extends RadioItem = RadioItem> {
  items: T[];
  value?: string | number | null; // controlled
  defaultValue?: string | number | null;
  onChange?: (item: T | null) => void;
  size?: RadioSize;
  color?: RadioColor;
  variant?: RadioVariant;
  type?: RadioType;
  elevation?: 1 | 2 | 3 | 4 | 5 | 6;
  disabled?: boolean;
  columns?: number; // chip layout columns
  style?: StyleProp<ViewStyle>;
  itemContainerStyle?: StyleProp<ViewStyle>;
  itemTextStyle?: StyleProp<TextStyle>;
  label?: string;
  helperText?: string;
  errorText?: string;
  emptyText?: string;
  required?: boolean;
  validateOnChange?: boolean;
  customValidator?: (item: T | null) => string | null;
  testID?: string;
}

export interface RadioGroupRef<T extends RadioItem = RadioItem> {
  clear: () => void;
  getSelected: () => T | null;
  validate: () => boolean;
  getError: () => string | null;
}

const SIZE_CFG: Record<RadioSize, { outer: number; inner: number; font: number; subFont: number; padV: number; padH: number; gap: number; radius: number; chipPadH: number; chipPadV: number; icon: number; }>= {
  small:  { outer: 18, inner: 8, font: 13, subFont: 11.5, padV: 6, padH: 10, gap: 8, radius: 8, chipPadH: 10, chipPadV: 6, icon: 14 },
  medium: { outer: 20, inner:10, font: 14, subFont: 12.5, padV: 8, padH: 14, gap:10, radius:10, chipPadH:14, chipPadV:8, icon:16 },
  large:  { outer: 24, inner:12, font: 16, subFont: 14, padV:10, padH: 18, gap:12, radius:12, chipPadH:18, chipPadV:10, icon:18 },
};

function getElevation(level?: 1 | 2 | 3 | 4 | 5 | 6): ViewStyle | undefined {
  if (!level) return undefined;
  const iosShadow: Record<number, ViewStyle> = {
    1: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    2: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
    3: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
    4: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
    5: { shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
    6: { shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
  };
  const androidElevation: Record<number, ViewStyle> = {
    1: { elevation: 1 },
    2: { elevation: 2 },
    3: { elevation: 3 },
    4: { elevation: 4 },
    5: { elevation: 5 },
    6: { elevation: 6 },
  };
  return Platform.select({ ios: iosShadow[level], android: androidElevation[level], default: androidElevation[level] });
}

const RadioGroupInner = <T extends RadioItem = RadioItem>(
  {
    items,
    value,
    defaultValue = null,
    onChange,
    size = 'medium',
    color = 'primary',
    variant = 'filled',
    type = 'text',
    elevation,
    disabled,
    columns = 1,
    style,
    itemContainerStyle,
    itemTextStyle,
    label,
    helperText,
    errorText,
    emptyText = 'No items',
    required = false,
    validateOnChange = false,
    customValidator,
    testID,
  }: RadioGroupProps<T>,
  ref: React.Ref<RadioGroupRef<T>>
) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const accent = colors[color] ?? colors.primary;
  const surface = isDark ? card.dark : card.light;
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const borderColor = isDark ? '#2A3142' : '#D8DFEA';

  const sizeCfg = SIZE_CFG[size];
  const controlled = value !== undefined;
  const [internal, setInternal] = useState<string | number | null>(defaultValue);
  const selectedId = controlled ? value : internal;
  const [validationError, setValidationError] = useState<string | null>(null);

  const setSelected = (id: string | number | null) => {
    if (!controlled) setInternal(id);
    const item = items.find((i) => i.id === id) || null;
    onChange?.(item as T | null);
    if (validateOnChange) requestAnimationFrame(() => validate(id));
  };

  const validate = useCallback((candidate?: string | number | null): boolean => {
    const id = candidate !== undefined ? candidate : selectedId;
    const item = items.find((i) => i.id === id) || null;
    let error: string | null = null;
    if (required && !item) {
      error = `${label || 'This field'} is required`;
    }
    if (!error && customValidator) {
      error = customValidator(item as T | null);
    }
    setValidationError(error);
    return error === null;
  }, [selectedId, items, required, customValidator, label]);

  useImperativeHandle(ref, () => ({
    clear: () => {
      setSelected(null);
      requestAnimationFrame(() => validate(null));
    },
    getSelected: () => (items.find((i) => i.id === selectedId) as T | null) ?? null,
    validate: () => validate(),
    getError: () => validationError,
  }), [selectedId, validate, validationError, items]);

  const isChip = type === 'chip';
  const wrapStyle: ViewStyle | undefined = isChip ? { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } : undefined;
  const colWidth = isChip && columns > 1 ? `${100 / columns - 2}%` : undefined;

  const radioOuter = (checked: boolean): ViewStyle => ({
    width: sizeCfg.outer,
    height: sizeCfg.outer,
    borderRadius: sizeCfg.outer / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: variant === 'filled' ? (checked ? accent : (isDark ? '#1B2232' : '#FFFFFF')) : 'transparent',
    borderColor: checked ? accent : borderColor,
  });

  const radioInner: ViewStyle = {
    width: sizeCfg.inner,
    height: sizeCfg.inner,
    borderRadius: sizeCfg.inner / 2,
    backgroundColor: '#FFFFFF',
  };

  const chipStyle = (checked: boolean): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sizeCfg.chipPadH,
    paddingVertical: sizeCfg.chipPadV,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: checked ? accent : borderColor,
    backgroundColor: checked
      ? (variant === 'filled' ? accent : (isDark ? '#1E2535' : '#EEF3FA'))
      : (variant === 'filled' ? (isDark ? '#1B2232' : '#FFFFFF') : 'transparent'),
  });

  const rowStyle = (checked: boolean): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sizeCfg.padV,
    paddingHorizontal: sizeCfg.padH,
    borderRadius: sizeCfg.radius,
    backgroundColor: checked
      ? (variant === 'filled' ? (isDark ? '#1E2535' : '#EEF3FA') : 'transparent')
      : 'transparent',
  });

  const renderItem = ({ item }: { item: T }) => {
    const checked = item.id === selectedId;
    const disabledItem = disabled || item.disabled;
    const containerBase: ViewStyle = isChip ? chipStyle(checked) : rowStyle(checked);
    return (
      <Pressable
        key={item.id}
        disabled={disabledItem}
        onPress={() => setSelected(item.id)}
        style={({ pressed }) => {
          const extras: ViewStyle[] = [];
          if (isChip && columns > 1 && colWidth) {
            const numeric = 100 / columns - 2;
            extras.push({ flexBasis: `${numeric}%` as any, maxWidth: `${numeric}%` as any });
          }
          if (!isChip) extras.push({ alignSelf: 'stretch' });
            if (disabledItem) extras.push({ opacity: 0.5 });
          if (pressed && !disabledItem) extras.push({ opacity: 0.8 });
          return [containerBase, ...extras, itemContainerStyle as any];
        }}
      >
        {isChip ? (
          <>
            {item.icon && (
              <FontAwesome5
                name={item.icon}
                size={sizeCfg.icon}
                color={checked ? (variant === 'filled' ? '#FFFFFF' : accent) : accent}
                style={{ marginRight: 6 }}
              />
            )}
            <ThemedText
              style={{
                fontSize: sizeCfg.font,
                color: checked && variant === 'filled' ? '#FFFFFF' : textColor,
                fontWeight: '600',
              }}
              numberOfLines={1}
            >
              {item.label}
            </ThemedText>
            <View style={{ marginLeft: 8 }}>
              {variant === 'filled' ? (
                <FontAwesome5 name={checked ? 'dot-circle' : 'circle'} size={sizeCfg.icon - 2} color={checked ? (variant === 'filled' ? '#FFFFFF' : accent) : accent} />
              ) : (
                <FontAwesome5 name={checked ? 'check' : 'circle'} size={sizeCfg.icon - 2} color={accent} />
              )}
            </View>
          </>
        ) : (
          <>
            <View style={[radioOuter(checked)]}>
              {checked && (
                <View style={radioInner} />
              )}
            </View>
            <View style={{ flex: 1, marginLeft: sizeCfg.gap }}>
              <ThemedText
                style={[{
                  fontSize: sizeCfg.font,
                  color: textColor,
                  fontWeight: '600',
                }, itemTextStyle]}
                numberOfLines={1}
              >
                {item.label}
              </ThemedText>
              {!!item.description && (
                <ThemedText
                  style={{
                    fontSize: sizeCfg.subFont,
                    color: subTextColor,
                    marginTop: 2,
                  }}
                  numberOfLines={2}
                >
                  {item.description}
                </ThemedText>
              )}
            </View>
          </>
        )}
      </Pressable>
    );
  };

  return (
    <View style={style} testID={testID}>
      {label && (
        <ThemedText type="label-small" weight="semi-bold" mb={6} style={{ color: subTextColor }}>
          {label}
        </ThemedText>
      )}
      <View
        style={[
          isChip
            ? [wrapStyle]
            : [{
                borderWidth: 1,
                borderColor: borderColor,
                borderRadius: 10,
                backgroundColor: surface,
              }, elevation && getElevation(elevation)],
        ]}
      >
        {items.length === 0 ? (
          <View style={{ padding: 16 }}>
            <ThemedText style={{ fontSize: 13, color: subTextColor }}>{emptyText}</ThemedText>
          </View>
        ) : (
          items.map((it, idx) => (
            <React.Fragment key={it.id}>
              {renderItem({ item: it })}
              {(!isChip && idx < items.length - 1) && (
                <View style={{ height: 1, backgroundColor: 'transparent' }} />
              )}
            </React.Fragment>
          ))
        )}
      </View>
      {!!helperText && !errorText && !validationError && (
        <ThemedText type="label-extra-small" mt={4} style={{ color: subTextColor }}>
          {helperText}
        </ThemedText>
      )}
      {(!!errorText || !!validationError) && (
        <ThemedText type="label-extra-small" mt={4} style={{ color: colors.error }}>
          {errorText || validationError}
        </ThemedText>
      )}
    </View>
  );
};

const RadioButton = React.forwardRef(RadioGroupInner) as <T extends RadioItem = RadioItem>(
  p: RadioGroupProps<T> & { ref?: React.Ref<RadioGroupRef<T>> }
) => React.ReactElement;

export default RadioButton;

const styles = StyleSheet.create({});