import { card, colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontAwesome5 } from '@expo/vector-icons';
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Keyboard,
  LayoutChangeEvent,
  Modal,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Button from './Button';
import { ThemedText } from './themed-text';

// Types ---------------------------------------------------
export interface DropdownItem {
  id: string | number; // database id or stable identifier
  label: string; // display text
  value?: any; // optional raw value (fallback to id)
  description?: string; // optional sub label
  icon?: keyof typeof FontAwesome5.glyphMap; // optional icon name
  disabled?: boolean;
}

export interface DropdownProps<T extends DropdownItem = DropdownItem> {
  items?: T[]; // static items
  fetchItems?: () => Promise<T[]>; // async provider (db)
  onSelect?: (item: T) => void; // single select callback
  onChangeMulti?: (items: T[]) => void; // multi select callback
  value?: string | number | null; // controlled single value id
  values?: Array<string | number>; // controlled multi selected ids
  defaultValue?: string | number | null; // uncontrolled initial single
  defaultValues?: Array<string | number>; // uncontrolled initial multi
  multi?: boolean; // enable multi select
  searchable?: boolean; // enable local search filter
  withSearch?: boolean; // alias: overrides searchable if provided
  placeholder?: string; // text when nothing selected
  label?: string; // optional field label
  helperText?: string; // below component helper
  errorText?: string; // error message
  disabled?: boolean; // disable trigger
  clearable?: boolean; // show clear selection button
  maxHeight?: number; // max list height
  emptyText?: string; // message when no items
  loadingText?: string; // custom loading label
  size?: 'small' | 'medium' | 'large'; // sizing preset
  variant?: 'solid' | 'outlined' | 'soft'; // visual variant for trigger
  color?: keyof typeof colors; // accent color
  style?: StyleProp<ViewStyle>; // wrapper style
  triggerStyle?: StyleProp<ViewStyle>; // trigger container style
  triggerTextStyle?: StyleProp<TextStyle>; // selected text style
  dropdownStyle?: StyleProp<ViewStyle>; // modal sheet style
  listStyle?: StyleProp<ViewStyle>; // list container style
  searchPlaceholder?: string; // search input placeholder
  autoFetch?: boolean; // fetch items on mount
  closeOnSelect?: boolean; // close after single select
  elevation?: 1 | 2 | 3 | 4 | 5 | 6; // trigger elevation
  testID?: string; // testing id
}

export interface DropdownRef<T extends DropdownItem = DropdownItem> {
  open: () => void;
  close: () => void;
  toggle: () => void;
  clear: () => void;
  getSelected: () => T | T[] | null;
  refetch: () => Promise<void>;
}

// Component ------------------------------------------------
const DropdownInner = <T extends DropdownItem = DropdownItem>(
  {
    items: staticItems = [],
    fetchItems,
    onSelect,
    onChangeMulti,
    value,
    values,
    defaultValue = null,
    defaultValues = [],
    multi = false,
    searchable = true,
    withSearch,
    placeholder = 'Select…',
    label,
    helperText,
    errorText,
    disabled,
    clearable = true,
    maxHeight = 320,
    emptyText = 'No items',
    loadingText = 'Loading…',
    size = 'medium',
    variant = 'outlined',
    color = 'primary',
    style,
    triggerStyle,
    triggerTextStyle,
    dropdownStyle,
    listStyle,
    searchPlaceholder = 'Search…',
    autoFetch = true,
    closeOnSelect = true,
    elevation = 2,
    testID,
  }: DropdownProps<T>,
  ref: React.Ref<DropdownRef<T>>
) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const accent = colors[color] ?? colors.primary;
  const surface = isDark ? card.dark : card.light;
  const borderColor = isDark ? '#2A3142' : '#D8DFEA';
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [internalItems, setInternalItems] = useState<T[]>(staticItems);
  const [search, setSearch] = useState('');
  const mounted = useRef(false);
  const [triggerHeight, setTriggerHeight] = useState(0);
  const triggerRef = useRef<View>(null);
  const [panelPos, setPanelPos] = useState<{
    top: number;
    left: number;
    width: number;
  }>({ top: 0, left: 0, width: 0 });

  // uncontrolled selections state (if not controlled)
  const [selectedId, setSelectedId] = useState<string | number | null>(
    defaultValue
  );
  const [selectedIds, setSelectedIds] =
    useState<Array<string | number>>(defaultValues);

  // Derived selected(s)
  const controlledSingle = value !== undefined;
  const controlledMulti = values !== undefined;

  const effectiveSelectedId = controlledSingle ? value! : selectedId;
  const effectiveSelectedIds = controlledMulti
    ? (values as Array<string | number>)
    : selectedIds;

  // Fetch items (async)
  const loadItems = useCallback(async () => {
    if (!fetchItems) return;
    setLoading(true);
    try {
      const data = await fetchItems();
      setInternalItems(data);
    } catch (e) {
      console.warn('[Dropdown] fetchItems error', e);
    } finally {
      setLoading(false);
    }
  }, [fetchItems]);

  // initial mount
  useEffect(() => {
    mounted.current = true;
    if (autoFetch && fetchItems) {
      loadItems();
    }
    return () => {
      mounted.current = false;
    };
  }, [autoFetch, fetchItems, loadItems]);

  // update when static items prop changes
  useEffect(() => {
    setInternalItems(staticItems);
  }, [staticItems]);

  const filteredItems = useMemo(() => {
    const list = internalItems;
    const effectiveSearchable = withSearch ?? searchable;
    if (!effectiveSearchable || !search.trim()) return list;
    const s = search.trim().toLowerCase();
    return list.filter(
      (it) =>
        it.label.toLowerCase().includes(s) ||
        (it.description ? it.description.toLowerCase().includes(s) : false)
    );
  }, [internalItems, search, searchable, withSearch]);

  const selectedItemsResolved = useMemo<T[]>(() => {
    if (multi) {
      return filteredItems.filter((i) => effectiveSelectedIds.includes(i.id));
    }
    const single = filteredItems.find((i) => i.id === effectiveSelectedId);
    return single ? [single] : [];
  }, [filteredItems, effectiveSelectedId, effectiveSelectedIds, multi]);

  const sizeConfig = useMemo(() => {
    switch (size) {
      case 'small':
        return { height: 40, fontSize: 13, padding: 10, icon: 14 };
      case 'large':
        return { height: 54, fontSize: 16, padding: 16, icon: 18 };
      case 'medium':
      default:
        return { height: 48, fontSize: 14, padding: 14, icon: 16 };
    }
  }, [size]);

  const elevationStyle = useMemo(() => getElevation(elevation), [elevation]);

  // selection handlers
  const handleSelect = (item: T) => {
    if (multi) {
      const exists = effectiveSelectedIds.includes(item.id);
      let next: Array<string | number>;
      if (exists) {
        next = effectiveSelectedIds.filter((id) => id !== item.id);
      } else {
        next = [...effectiveSelectedIds, item.id];
      }
      if (!controlledMulti) setSelectedIds(next);
      onChangeMulti?.(internalItems.filter((i) => next.includes(i.id)) as T[]);
    } else {
      if (!controlledSingle) setSelectedId(item.id);
      onSelect?.(item);
      if (closeOnSelect) setOpen(false);
    }
  };

  const handleClear = () => {
    if (multi) {
      if (!controlledMulti) setSelectedIds([]);
      onChangeMulti?.([] as T[]);
    } else {
      if (!controlledSingle) setSelectedId(null);
      if (effectiveSelectedId != null) {
        const found = internalItems.find((i) => i.id === effectiveSelectedId);
        if (found) onSelect?.({ ...(found as any), id: undefined });
      }
    }
  };

  const displayLabel = useMemo(() => {
    if (multi) {
      if (!effectiveSelectedIds.length) return placeholder;
      if (effectiveSelectedIds.length === 1) {
        const one = internalItems.find((i) => i.id === effectiveSelectedIds[0]);
        return one?.label ?? placeholder;
      }
      return `${effectiveSelectedIds.length} selected`;
    }
    const single = internalItems.find((i) => i.id === effectiveSelectedId);
    return single?.label ?? placeholder;
  }, [
    multi,
    effectiveSelectedIds,
    internalItems,
    effectiveSelectedId,
    placeholder,
  ]);

  // expose imperative methods
  useImperativeHandle(
    ref,
    () => ({
      open: () => setOpen(true),
      close: () => setOpen(false),
      toggle: () => setOpen((o) => !o),
      clear: handleClear,
      getSelected: () => {
        if (multi) {
          return internalItems.filter((i) =>
            effectiveSelectedIds.includes(i.id)
          );
        }
        const single =
          internalItems.find((i) => i.id === effectiveSelectedId) || null;
        return single;
      },
      refetch: async () => {
        await loadItems();
      },
    }),
    [multi, internalItems, effectiveSelectedIds, effectiveSelectedId, loadItems]
  );

  // trigger styles
  const triggerVariant = getTriggerVariantStyles(
    variant,
    surface,
    borderColor,
    accent,
    isDark
  );

  const onTriggerLayout = (e: LayoutChangeEvent) => {
    setTriggerHeight(e.nativeEvent.layout.height);
  };

  // measure trigger position when opening
  const measureTrigger = useCallback(() => {
    if (!triggerRef.current) return;
    triggerRef.current.measureInWindow((x, y, w, h) => {
      const screenH = Dimensions.get('window').height;
      let top = y + h + 4; // default below
      const estimatedPanelHeight = Math.min(maxHeight, 320); // heuristic
      if (top + estimatedPanelHeight > screenH - 12) {
        // flip above if not enough space
        top = Math.max(12, y - estimatedPanelHeight - 4);
      }
      setPanelPos({ top, left: x, width: w });
    });
  }, [maxHeight]);

  useEffect(() => {
    if (open) {
      // slight delay to ensure layout committed
      requestAnimationFrame(() => measureTrigger());
    }
  }, [open, measureTrigger]);

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
      {/* Trigger */}
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        ref={triggerRef}
        onPress={() => {
          if (!disabled) {
            Keyboard.dismiss();
            setOpen((o) => !o);
            if (!open && fetchItems && !internalItems.length) loadItems();
          }
        }}
        onLayout={onTriggerLayout}
        style={({ pressed }) => [
          styles.triggerBase,
          {
            minHeight: sizeConfig.height,
            paddingHorizontal: sizeConfig.padding,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          },
          triggerVariant.container,
          elevationStyle,
          disabled && { opacity: 0.6 },
          pressed && !disabled && { opacity: 0.85 },
          triggerStyle,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            {
              flex: 1,
              color: displayLabel === placeholder ? subTextColor : textColor,
              fontSize: sizeConfig.fontSize,
            },
            triggerTextStyle,
          ]}
        >
          {displayLabel}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {clearable &&
            ((multi && effectiveSelectedIds.length) ||
              (!multi && effectiveSelectedId != null)) && (
              <Pressable
                accessibilityLabel="Clear selection"
                hitSlop={10}
                onPress={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                style={({ pressed }) => [
                  { padding: 4, borderRadius: 4 },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <FontAwesome5
                  name="times-circle"
                  color={subTextColor}
                  size={16}
                />
              </Pressable>
            )}
          <FontAwesome5
            name={open ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={subTextColor}
          />
        </View>
      </Pressable>

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
          style={{ color: colors.error }}
        >
          {errorText}
        </ThemedText>
      )}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          <View
            style={[
              styles.panel,
              getElevation(5),
              {
                position: 'absolute',
                top: panelPos.top,
                left: panelPos.left,
                width: panelPos.width,
                backgroundColor: surface,
                borderColor: borderColor,
                maxHeight,
              },
              dropdownStyle,
            ]}
          >
            {(withSearch ?? searchable) && (
              <View
                style={[
                  styles.searchWrap,
                  {
                    borderColor: borderColor,
                    backgroundColor: isDark ? '#1E2535' : '#F3F6FB',
                    marginTop: 10,
                  },
                ]}
              >
                <FontAwesome5 name="search" size={14} color={subTextColor} />
                <TextInput
                  placeholder={searchPlaceholder}
                  placeholderTextColor={subTextColor}
                  value={search}
                  onChangeText={setSearch}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    color: textColor,
                    fontSize: 13,
                  }}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                {search.length > 0 && (
                  <Pressable onPress={() => setSearch('')} hitSlop={8}>
                    <FontAwesome5
                      name="times-circle"
                      size={14}
                      color={subTextColor}
                    />
                  </Pressable>
                )}
              </View>
            )}
            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={accent} />
                <Text
                  style={{ marginTop: 8, fontSize: 12, color: subTextColor }}
                >
                  {loadingText}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredItems}
                keyExtractor={(it) => String(it.id)}
                style={[{ flexGrow: 0 }, listStyle]}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={() => (
                  <View style={styles.emptyWrap}>
                    <ThemedText style={{ fontSize: 13, color: subTextColor }}>
                      {emptyText}
                    </ThemedText>
                  </View>
                )}
                renderItem={({ item }) => {
                  const selected = multi
                    ? effectiveSelectedIds.includes(item.id)
                    : item.id === effectiveSelectedId;
                  return (
                    <Pressable
                      disabled={item.disabled}
                      onPress={() => handleSelect(item)}
                      style={({ pressed }) => [
                        styles.itemRow,
                        {
                          backgroundColor: selected
                            ? isDark
                              ? '#1E2535'
                              : '#EEF3FA'
                            : 'transparent',
                          opacity: item.disabled ? 0.4 : 1,
                          borderColor: selected ? accent : 'transparent',
                        },
                        pressed && !item.disabled && { opacity: 0.7 },
                      ]}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          flex: 1,
                          gap: 10,
                        }}
                      >
                        {item.icon && (
                          <FontAwesome5
                            name={item.icon}
                            size={16}
                            color={accent}
                          />
                        )}
                        <View style={{ flex: 1 }}>
                          <ThemedText type="body-medium" numberOfLines={1}>
                            {item.label}
                          </ThemedText>
                          {!!item.description && (
                            <ThemedText
                              type="body-small"
                              style={{ color: subTextColor, marginTop: 2 }}
                              numberOfLines={2}
                            >
                              {item.description}
                            </ThemedText>
                          )}
                        </View>
                      </View>
                      <View style={{ marginLeft: 10 }}>
                        {multi ? (
                          selected ? (
                            <FontAwesome5
                              name="check-square"
                              size={16}
                              color={accent}
                            />
                          ) : (
                            <FontAwesome5
                              name="square"
                              size={16}
                              color={subTextColor}
                            />
                          )
                        ) : selected ? (
                          <FontAwesome5 name="check" size={16} color={accent} />
                        ) : null}
                      </View>
                    </Pressable>
                  );
                }}
              />
            )}
            {multi && (
              <View style={[styles.footer, { borderColor: borderColor }]}>
                <Button
                  variant="soft"
                  color="secondary"
                  size="small"
                  label="Close"
                  onPress={() => setOpen(false)}
                />
                <Button
                  variant="solid"
                  color="primary"
                  size="small"
                  label="Apply"
                  onPress={() => {
                    setOpen(false);
                    onChangeMulti?.(
                      internalItems.filter((i) =>
                        effectiveSelectedIds.includes(i.id)
                      ) as T[]
                    );
                  }}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// elevation helper (mirrors pattern used elsewhere) ------------------
function getElevation(
  level: 1 | 2 | 3 | 4 | 5 | 6 | undefined
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
  const androidElevation: Record<number, ViewStyle> = {
    1: { elevation: 1 },
    2: { elevation: 2 },
    3: { elevation: 3 },
    4: { elevation: 4 },
    5: { elevation: 5 },
    6: { elevation: 6 },
  };
  return Platform.select<ViewStyle>({
    ios: iosShadow[level],
    android: androidElevation[level],
    default: androidElevation[level],
  });
}

function getTriggerVariantStyles(
  variant: 'solid' | 'outlined' | 'soft',
  surface: string,
  borderColor: string,
  accent: string,
  isDark: boolean
) {
  if (variant === 'solid') {
    return {
      container: {
        backgroundColor: surface,
        borderWidth: 1,
        borderColor: borderColor,
      } as ViewStyle,
    };
  }
  if (variant === 'outlined') {
    return {
      container: {
        backgroundColor: isDark ? '#1B2232' : '#FFFFFF',
        borderWidth: 0.3,
        borderColor: accent,
      } as ViewStyle,
    };
  }
  // soft
  return {
    container: {
      backgroundColor: isDark ? '#1E2535' : '#EEF3FA',
      borderWidth: 1,
      borderColor: borderColor,
    } as ViewStyle,
  };
}

// Forward ref wrapper ------------------------------------------------
const Dropdown = React.forwardRef(DropdownInner) as <
  T extends DropdownItem = DropdownItem
>(
  p: DropdownProps<T> & { ref?: React.Ref<DropdownRef<T>> }
) => React.ReactElement;

export default Dropdown;

// Styles --------------------------------------------------------------
const styles = StyleSheet.create({
  triggerBase: {
    borderWidth: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  panel: {
    zIndex: 1000,
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  loadingWrap: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWrap: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
});
