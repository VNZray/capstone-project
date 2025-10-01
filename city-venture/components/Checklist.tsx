import { card, colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontAwesome5 } from '@expo/vector-icons';
import React, { useCallback, useImperativeHandle, useState } from 'react';
import { Platform, Pressable, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { ThemedText } from './themed-text';

// Types -----------------------------------------------------------
export interface ChecklistItem {
  id: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
  icon?: keyof typeof FontAwesome5.glyphMap; // optional leading icon
}

export type ChecklistVariant = 'filled' | 'unfilled'; // visual style of box / radio icon
export type ChecklistType = 'chip' | 'text'; // container style
export type ChecklistSize = 'small' | 'medium' | 'large';
export type ChecklistColor = keyof typeof colors; // reuse existing palette keys

export interface ChecklistProps<T extends ChecklistItem = ChecklistItem> {
  items: T[];
  // Controlled selection
  values?: Array<string | number>;
  defaultValues?: Array<string | number>;
  onChange?: (items: T[], ids: Array<string | number>) => void;
  // Visual
  size?: ChecklistSize;
  color?: ChecklistColor;
  variant?: ChecklistVariant; // affects check mark style
  type?: ChecklistType; // chip vs plain list row
  elevation?: 1 | 2 | 3 | 4 | 5 | 6;
  disabled?: boolean;
  columns?: number; // for chip layout (wrap)
  style?: StyleProp<ViewStyle>; // root wrapper
  itemContainerStyle?: StyleProp<ViewStyle>;
  itemTextStyle?: StyleProp<TextStyle>;
  // Labels / messaging
  label?: string; // section label
  helperText?: string;
  errorText?: string; // external error override
  emptyText?: string;
  // Validation
  required?: boolean;
  minSelected?: number;
  maxSelected?: number;
  validateOnChange?: boolean;
  customValidator?: (items: T[], ids: Array<string | number>) => string | null;
  // Accessibility
  testID?: string;
}

export interface ChecklistRef<T extends ChecklistItem = ChecklistItem> {
  clear: () => void;
  getSelected: () => T[];
  validate: () => boolean;
  getError: () => string | null;
}

// Size tokens (align roughly with input sizes) -------------------
const SIZE_CFG: Record<ChecklistSize, { box: number; font: number; subFont: number; padV: number; padH: number; gap: number; radius: number; chipPadH: number; chipPadV: number; icon: number; }>= {
  small: { box: 18, font: 13, subFont: 11.5, padV: 6, padH: 10, gap: 8, radius: 8, chipPadH: 10, chipPadV: 6, icon: 14 },
  medium:{ box: 20, font: 14, subFont: 12.5, padV: 8, padH: 14, gap: 10, radius: 10, chipPadH: 14, chipPadV: 8, icon: 16 },
  large: { box: 24, font: 16, subFont: 14, padV: 10, padH: 18, gap: 12, radius: 12, chipPadH: 18, chipPadV: 10, icon: 18 },
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

const ChecklistInner = <T extends ChecklistItem = ChecklistItem>(
  {
    items,
    values,
    defaultValues = [],
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
    minSelected,
    maxSelected,
    validateOnChange = false,
    customValidator,
    testID,
  }: ChecklistProps<T>,
  ref: React.Ref<ChecklistRef<T>>
) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const accent = colors[color] ?? colors.primary;
  const surface = isDark ? card.dark : card.light;
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const borderColor = isDark ? '#2A3142' : '#D8DFEA';

  const sizeCfg = SIZE_CFG[size];

  const controlled = values !== undefined;
  const [internalIds, setInternalIds] = useState<Array<string | number>>(defaultValues);
  const selectedIds = controlled ? (values as Array<string | number>) : internalIds;

  const [validationError, setValidationError] = useState<string | null>(null);

  const toggleSelect = (id: string | number, item: T) => {
    if (disabled) return;
    const exists = selectedIds.includes(id);
    let next: Array<string | number>;
    if (exists) {
      next = selectedIds.filter((x) => x !== id);
    } else {
      next = [...selectedIds, id];
    }
    if (!controlled) setInternalIds(next);
    onChange?.(items.filter((i) => next.includes(i.id)) as T[], next);
    if (validateOnChange) requestAnimationFrame(() => validate(next));
  };

  const validate = useCallback((candidate?: Array<string | number>): boolean => {
    const ids = candidate ?? selectedIds;
    const selectedItems = items.filter((i) => ids.includes(i.id));
    let error: string | null = null;
    const count = ids.length;
    if (required && count === 0) {
      error = `${label || 'This field'} is required`;
    } else if (minSelected != null && count < minSelected) {
      error = `${label || 'Select at least'} ${minSelected}`;
    } else if (maxSelected != null && count > maxSelected) {
      error = `${label || 'Select at most'} ${maxSelected}`;
    }
    if (!error && customValidator) {
      error = customValidator(selectedItems as T[], ids);
    }
    setValidationError(error);
    return error === null;
  }, [selectedIds, items, required, minSelected, maxSelected, customValidator, label]);

  useImperativeHandle(ref, () => ({
    clear: () => {
      if (!controlled) setInternalIds([]);
      onChange?.([], []);
      requestAnimationFrame(() => validate([]));
    },
    getSelected: () => items.filter((i) => selectedIds.includes(i.id)) as T[],
    validate: () => validate(),
    getError: () => validationError,
  }), [controlled, onChange, items, selectedIds, validate, validationError]);

  // Layout helpers -------------------------------------------------
  const isChip = type === 'chip';
  const wrapStyle: ViewStyle | undefined = isChip ? { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } : undefined;
  const colWidth = isChip && columns > 1 ? `${100 / columns - 2}%` : undefined;

  const boxBase = (checked: boolean): ViewStyle => ({
    width: sizeCfg.box,
    height: sizeCfg.box,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: variant === 'filled'
      ? (checked ? accent : (isDark ? '#1B2232' : '#FFFFFF'))
      : 'transparent',
    borderColor: checked ? accent : borderColor,
  });

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

  const accentContent = (checked: boolean) => (
    <FontAwesome5
      // Show a check when selected, outlined square when not selected
      name={checked ? 'check' : ''}
      size={sizeCfg.icon - 2}
      color={variant === 'filled' ? (checked ? '#FFFFFF' : accent) : accent}
    />
  );

  const renderItem = ({ item }: { item: T }) => {
    const checked = selectedIds.includes(item.id);
    const disabledItem = disabled || item.disabled;
    const containerBase: ViewStyle = isChip
      ? chipStyle(checked)
      : rowStyle(checked);
    return (
      <Pressable
        key={item.id}
        disabled={disabledItem}
        onPress={() => toggleSelect(item.id, item)}
        style={({ pressed }) => {
          const extra: ViewStyle[] = [];
          if (isChip && columns > 1 && colWidth) {
            // Instead of percentage width string (not typed), approximate with flexBasis & maxWidth
            const numeric = 100 / columns - 2; // subtract small gap
            extra.push({ flexBasis: `${numeric}%` as any, maxWidth: `${numeric}%` as any });
          }
          if (!isChip) extra.push({ alignSelf: 'stretch' });
          if (disabledItem) extra.push({ opacity: 0.5 });
          if (pressed && !disabledItem) extra.push({ opacity: 0.8 });
          return [containerBase, ...extra, itemContainerStyle as any];
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
            <View style={{ marginLeft: 8 }}>{accentContent(checked)}</View>
          </>
        ) : (
          <>
            <View style={[boxBase(checked)]}>{accentContent(checked)}</View>
            <View style={{ flex: 1, marginLeft: sizeCfg.gap }}>
              <ThemedText
                style={[
                  {
                    fontSize: sizeCfg.font,
                    color: textColor,
                    fontWeight: '600',
                  },
                  itemTextStyle,
                ]}
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

const Checklist = React.forwardRef(ChecklistInner) as <T extends ChecklistItem = ChecklistItem>(
  p: ChecklistProps<T> & { ref?: React.Ref<ChecklistRef<T>> }
) => React.ReactElement;

export default Checklist;

const styles = StyleSheet.create({});