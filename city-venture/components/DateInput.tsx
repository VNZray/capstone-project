// Clean rebuilt DateInput (modal-only)
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
  Alert,
  FlatList,
  ListRenderItem,
  Modal,
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
import Button from './Button';
import { ThemedText } from './themed-text';

export type DateInputMode = 'single' | 'range';

export interface DateInputProps {
  mode?: DateInputMode;
  value?: Date | null;
  defaultValue?: Date | null;
  rangeValue?: { start: Date | null; end: Date | null };
  defaultRangeValue?: { start: Date | null; end: Date | null };
  onChange?: (date: Date | null) => void;
  onRangeChange?: (range: { start: Date | null; end: Date | null }) => void;
  label?: string;
  placeholder?: string;
  rangePlaceholder?: { start?: string; end?: string };
  /** Allow editing the range placeholders independently (when no dates selected yet or partially selected) */
  editableRangePlaceholder?: boolean;
  /** Controlled values for editable range placeholders */
  rangePlaceholderValue?: { start?: string; end?: string };
  /** Callback when either range placeholder value changes */
  onRangePlaceholderValueChange?: (value: {
    start?: string;
    end?: string;
  }) => void;
  minDate?: Date;
  maxDate?: Date;
  disablePast?: boolean;
  disableFuture?: boolean;
  disabledDates?: (date: Date) => boolean;
  disablePastNavigation?: boolean;
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  clearable?: boolean;
  closeOnSelect?: boolean;
  color?: keyof typeof colors;
  elevation?: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: 'solid' | 'outlined' | 'soft';
  size?: 'small' | 'medium' | 'large';
  /** Show days from previous/next month to fill the grid */
  showAdjacentMonths?: boolean;
  /** Selection appearance for single date */
  selectionVariant?: 'filled' | 'outline';
  /** When true (single mode) show a Done button instead of closing immediately */
  requireConfirmation?: boolean;
  /** Map of date (yyyy-mm-dd) => status string (reserved | unavailable | occupied) */
  dateStatuses?: Record<string, 'reserved' | 'unavailable' | 'occupied'>;
  /** Enable showing status dots / legend in SINGLE mode (previously only range). Parent must also pass dateStatuses. */
  enableSingleStatusVisuals?: boolean;
  /** Provide booked room info per date; used to render a list below calendar */
  bookedRoomsByDate?: Record<
    string,
    { id: string | number; name: string; status?: string }[]
  >;
  /** Show legend for statuses */
  showStatusLegend?: boolean;
  /** Show booked rooms section for selected single date or range endpoints */
  showBookedRooms?: boolean;
  style?: StyleProp<ViewStyle>;
  triggerStyle?: StyleProp<ViewStyle>;
  triggerTextStyle?: StyleProp<TextStyle>;
  panelStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  errorText?: string;
  helperText?: string;
  testID?: string;
  /** Allow editing placeholder text (when no date / range selected) */
  editablePlaceholder?: boolean;
  /** Controlled value of editable placeholder (falls back to placeholder prop) */
  placeholderValue?: string;
  /** Callback when editable placeholder text changes */
  onPlaceholderValueChange?: (text: string) => void;
  /** Message to show in an alert when a user attempts to complete a range that overlaps a status (reserved/unavailable/occupied). If omitted no alert is shown. */
  overlapAlertMessage?: string;
}

export interface DateInputRef {
  open: () => void;
  close: () => void;
  toggle: () => void;
  clear: () => void;
  getValue: () => Date | { start: Date | null; end: Date | null } | null;
}

// Helpers
function startOfDay(d: Date) {
  const nd = new Date(d);
  nd.setHours(0, 0, 0, 0);
  return nd;
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function isBefore(a: Date, b: Date) {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}
function isAfter(a: Date, b: Date) {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}
// Format date in local timezone (YYYY-MM-DD) to avoid UTC off-by-one issues when using toISOString()
function formatLocalYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function formatYMD(date: Date | null, placeholder: string) {
  return date ? formatLocalYMD(date) : placeholder;
}
interface DayCellData {
  date: Date;
  inCurrentMonth: boolean;
}
function buildCalendar(
  year: number,
  month: number,
  firstDayOfWeek: number,
  fillSix = true
): DayCellData[][] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const daysInMonth = last.getDate();
  const grid: DayCellData[][] = [];
  const offset = (first.getDay() - firstDayOfWeek + 7) % 7; // leading blanks
  let week: DayCellData[] = [];
  // previous month days
  for (let i = 0; i < offset; i++) {
    const d = new Date(year, month, 1 - (offset - i));
    week.push({ date: d, inCurrentMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    week.push({ date: new Date(year, month, day), inCurrentMonth: true });
    if (week.length === 7) {
      grid.push(week);
      week = [];
    }
  }
  // trailing next month
  if (week.length) {
    let add = 1;
    while (week.length < 7) {
      week.push({
        date: new Date(year, month + 1, add++),
        inCurrentMonth: false,
      });
    }
    grid.push(week);
  }
  if (fillSix && grid.length < 6) {
    const lastRow = grid[grid.length - 1];
    const lastDate = lastRow[lastRow.length - 1].date;
    let cursor = 1;
    while (grid.length < 6) {
      const newWeek: DayCellData[] = [];
      for (let i = 0; i < 7; i++)
        newWeek.push({
          date: new Date(
            lastDate.getFullYear(),
            lastDate.getMonth() + 1,
            cursor++
          ),
          inCurrentMonth: false,
        });
      grid.push(newWeek);
    }
  }
  return grid;
}
function getElevation(
  level: 1 | 2 | 3 | 4 | 5 | 6 | undefined
): ViewStyle | undefined {
  if (!level) return undefined;
  const ios: Record<number, ViewStyle> = {
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
  return Platform.select<ViewStyle>({
    ios: ios[level],
    android: android[level],
    default: android[level],
  });
}

const DateInput = React.forwardRef<DateInputRef, DateInputProps>(
  (
    {
      mode = 'single',
      value,
      defaultValue = null,
      rangeValue,
      defaultRangeValue = { start: null, end: null },
      onChange,
      onRangeChange,
      label,
      placeholder = 'Select date',
      rangePlaceholder = { start: 'Start date', end: 'End date' },
      editableRangePlaceholder = false,
      rangePlaceholderValue,
      onRangePlaceholderValueChange,
      minDate,
      maxDate,
      disablePast,
      disableFuture,
      disabledDates,
      disablePastNavigation = false,
      firstDayOfWeek = 0,
      clearable = true,
      closeOnSelect = true,
      color = 'primary',
      elevation = 2,
      variant = 'outlined',
      size = 'small',
      showAdjacentMonths = true,
      selectionVariant = 'outline',
      requireConfirmation = false,
      dateStatuses,
      enableSingleStatusVisuals = false,
      bookedRoomsByDate,
      showStatusLegend = true,
      showBookedRooms = true,
      style,
      triggerStyle,
      triggerTextStyle,
      panelStyle,
      disabled,
      errorText,
      helperText,
      testID,
      editablePlaceholder = false,
      placeholderValue,
      onPlaceholderValueChange,
      overlapAlertMessage = 'Selected range overlaps unavailable / reserved / occupied dates.',
    },
    ref
  ) => {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const accent = colors[color] || colors.primary;
    const statusColors = {
      reserved: '#F28C28', // orange
      unavailable: '#D7263D', // red
      occupied: colors.secondary, // secondary brand color
    } as const;
    const surface = isDark ? card.dark : card.light;
    const borderColor = isDark ? '#2A3142' : '#D8DFEA';
    const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
    const subTextColor = isDark ? '#9BA1A6' : '#6B7280';

    const [open, setOpen] = useState(false);
    const [internalDate, setInternalDate] = useState<Date | null>(
      defaultValue !== undefined && defaultValue !== null
        ? defaultValue
        : new Date()
    );
    const [internalRange, setInternalRange] = useState<{
      start: Date | null;
      end: Date | null;
    }>(defaultRangeValue);
    // Picker mode (single mode only): none | month | year
    const [pickerMode, setPickerMode] = useState<'none' | 'month' | 'year'>(
      'none'
    );

    const controlledSingle = value !== undefined;
    const controlledRange = rangeValue !== undefined;
    const currentDate = controlledSingle
      ? value ?? new Date()
      : internalDate ?? new Date();
    const currentRange = controlledRange ? rangeValue! : internalRange;

    const base =
      currentDate || currentRange.start || currentRange.end || new Date();
    const [navYear, setNavYear] = useState(base.getFullYear());
    const [navMonth, setNavMonth] = useState(base.getMonth());

    const sizeCfg = useMemo(() => {
      switch (size) {
        case 'small':
          return { h: 40, font: 13, pad: 10 };
        case 'large':
          return { h: 54, font: 16, pad: 16 };
        default:
          return { h: 48, font: 14, pad: 14 };
      }
    }, [size]);
    function variantStyles() {
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
    }
    const elevationStyle = useMemo(() => getElevation(elevation), [elevation]);

    const matrix = useMemo(
      () => buildCalendar(navYear, navMonth, firstDayOfWeek, true),
      [navYear, navMonth, firstDayOfWeek]
    );
    const monthLabel = useMemo(
      () =>
        new Date(navYear, navMonth, 1).toLocaleString(undefined, {
          month: 'long',
          year: 'numeric',
        }),
      [navYear, navMonth]
    );
    const monthName = useMemo(
      () =>
        new Date(navYear, navMonth, 1).toLocaleString(undefined, {
          month: 'long',
        }),
      [navYear, navMonth]
    );

    const monthNames = useMemo(
      () =>
        Array.from({ length: 12 }).map((_, i) =>
          new Date(2024, i, 1).toLocaleString(undefined, { month: 'short' })
        ),
      []
    );
    // Year list: current year descending (no future years)
    const YEARS_BACK = 60; // how many past years to list
    const years = useMemo(() => {
      const current = new Date().getFullYear();
      const arr: number[] = [];
      for (let y = current; y >= current - YEARS_BACK; y--) arr.push(y);
      return arr; // descending order
    }, []);
    const yearListRef = useRef<FlatList<number> | null>(null);
    useEffect(() => {
      if (pickerMode === 'year') {
        // Scroll so current year (first item) is visible; no need to center.
        const idx = years.indexOf(navYear);
        if (idx > 10) {
          // Only scroll if selected year isn't near top for smoother feel.
          setTimeout(() => {
            yearListRef.current?.scrollToIndex({ index: idx, animated: false });
          }, 30);
        }
      }
    }, [pickerMode, navYear, years]);
    const renderYearItem: ListRenderItem<number> = ({ item }) => {
      const active = item === navYear;
      return (
        <Pressable
          onPress={() => {
            setNavYear(item);
            setPickerMode('none');
          }}
          style={[styles.yearScrollItem, active && { backgroundColor: accent }]}
        >
          <ThemedText
            type="body-medium"
            weight="medium"
            style={[
              styles.yearScrollText,
              {
                color: active ? '#fff' : textColor,
                fontWeight: active ? '700' : '500',
              },
            ]}
          >
            {item}
          </ThemedText>
        </Pressable>
      );
    };

    const isDisabledDate = useCallback(
      (d: Date) => {
        if (minDate && isBefore(d, minDate)) return true;
        if (maxDate && isAfter(d, maxDate)) return true;
        if (disablePast && isBefore(d, new Date())) return true;
        if (disableFuture && isAfter(d, new Date())) return true;
        if (disabledDates && disabledDates(d)) return true;
        return false;
      },
      [minDate, maxDate, disablePast, disableFuture, disabledDates]
    );

    const displayLabel = useMemo(() => {
      if (mode === 'single') return formatYMD(currentDate, placeholder);
      const start = formatYMD(
        currentRange.start,
        rangePlaceholder.start || 'Start date'
      );
      const end = formatYMD(
        currentRange.end,
        rangePlaceholder.end || 'End date'
      );
      return `${start} → ${end}`;
    }, [mode, currentDate, currentRange, placeholder, rangePlaceholder]);

    const goPrevMonth = () => {
      if (disablePastNavigation && (disablePast || minDate)) {
        const boundary = minDate || new Date();
        const prevMonthEnd = new Date(navYear, navMonth, 0);
        if (isBefore(prevMonthEnd, startOfDay(boundary))) return; // block
      }
      let m = navMonth - 1;
      let y = navYear;
      if (m < 0) {
        m = 11;
        y--;
      }
      setNavMonth(m);
      setNavYear(y);
    };
    const goNextMonth = () => {
      let m = navMonth + 1;
      let y = navYear;
      if (m > 11) {
        m = 0;
        y++;
      }
      setNavMonth(m);
      setNavYear(y);
    };

    // In React Native setTimeout returns a number.
    const longPressTimeout = useRef<number | null>(null);
    const handleNavPressIn = (dir: 'prev' | 'next') => {
      longPressTimeout.current = setTimeout(() => {
        // Jump a year
        if (dir === 'prev') {
          setNavYear((y) => y - 1);
        } else {
          setNavYear((y) => y + 1);
        }
      }, 420); // hold ~0.4s
    };
    const handleNavPressOut = (dir: 'prev' | 'next') => {
      if (longPressTimeout.current !== null) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = null;
      }
    };

    const isInRange = (d: Date) => {
      if (mode !== 'range') return false;
      const { start, end } = currentRange;
      return !!(start && end && !isBefore(d, start) && !isAfter(d, end));
    };
    const isRangeStart = (d: Date) =>
      mode === 'range' &&
      !!currentRange.start &&
      isSameDay(d, currentRange.start!);
    const isRangeEnd = (d: Date) =>
      mode === 'range' && !!currentRange.end && isSameDay(d, currentRange.end!);

    const handleSelectDay = (day: Date, inCurrentMonth: boolean) => {
      if (isDisabledDate(day)) return;
      // If user selects adjacent month day, navigate to that month first for continuity
      if (!inCurrentMonth) {
        setNavYear(day.getFullYear());
        setNavMonth(day.getMonth());
      }
      // Normalize to midday to mitigate potential DST / timezone boundary issues
      const normalized = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        12,
        0,
        0,
        0
      );
      if (mode === 'single') {
        if (!controlledSingle) setInternalDate(normalized);
        onChange?.(normalized);
        if (closeOnSelect && !requireConfirmation) setOpen(false);
      } else {
        const { start, end } = currentRange;
        if (!start || (start && end)) {
          const next = { start: normalized, end: null };
          if (!controlledRange) setInternalRange(next);
          onRangeChange?.(next);
        } else if (start && !end) {
          // Determine range direction
          let rangeStart = start;
          let rangeEnd = normalized;
          if (isBefore(normalized, start)) {
            rangeStart = normalized;
            rangeEnd = start;
          }
          // Validate the proposed inclusive range does not overlap any status dates
          if (dateStatuses) {
            const blocked: Array<'unavailable' | 'reserved' | 'occupied'> = [
              'unavailable',
              'reserved',
              'occupied',
            ];
            const cursor = new Date(
              rangeStart.getFullYear(),
              rangeStart.getMonth(),
              rangeStart.getDate()
            );
            let invalid = false;
            while (!invalid && cursor.getTime() <= rangeEnd.getTime()) {
              const ymd = formatLocalYMD(cursor);
              const st = dateStatuses[ymd];
              if (st && blocked.includes(st)) invalid = true;
              cursor.setDate(cursor.getDate() + 1);
            }
            if (invalid) {
              // Reject this selection & optionally alert user
              if (overlapAlertMessage) {
                Alert.alert('Invalid Range', overlapAlertMessage);
              }
              return;
            }
          }
          const next = { start: rangeStart, end: rangeEnd };
          if (!controlledRange) setInternalRange(next);
          onRangeChange?.(next);
        }
      }
    };

    const clear = () => {
      if (mode === 'single') {
        if (!controlledSingle) setInternalDate(null);
        onChange?.(null);
      } else {
        const empty = { start: null, end: null };
        if (!controlledRange) setInternalRange(empty);
        onRangeChange?.(empty);
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        open: () => setOpen(true),
        close: () => setOpen(false),
        toggle: () => setOpen((o) => !o),
        clear,
        getValue: () =>
          mode === 'single' ? currentDate || null : currentRange,
      }),
      [mode, currentDate, currentRange]
    );

    const prevDisabled = useMemo(() => {
      if (!(disablePastNavigation && (disablePast || minDate))) return false;
      const boundary = minDate || new Date();
      const prevMonthEnd = new Date(navYear, navMonth, 0);
      return isBefore(prevMonthEnd, startOfDay(boundary));
    }, [disablePastNavigation, disablePast, minDate, navYear, navMonth]);

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
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={() => !disabled && setOpen((o) => !o)}
          style={({ pressed }) => [
            styles.trigger,
            {
              minHeight: sizeCfg.h,
              paddingHorizontal: sizeCfg.pad,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
            variantStyles(),
            elevationStyle,
            disabled && { opacity: 0.6 },
            pressed && !disabled && { opacity: 0.85 },
            triggerStyle,
          ]}
        >
          {editablePlaceholder &&
          ((mode === 'single' && !currentDate) ||
            (mode === 'range' && !currentRange.start && !currentRange.end)) ? (
            <RNTextInput
              value={placeholderValue !== undefined ? placeholderValue : ''}
              onChangeText={(t) => onPlaceholderValueChange?.(t)}
              placeholder={placeholder}
              placeholderTextColor={subTextColor}
              style={[
                {
                  flex: 1,
                  color: textColor,
                  fontSize: sizeCfg.font,
                  padding: 0,
                },
                triggerTextStyle,
              ]}
            />
          ) : mode === 'range' && editableRangePlaceholder ? (
            <View
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
            >
              {currentRange.start ? (
                <Text
                  style={[
                    {
                      color: textColor,
                      fontSize: sizeCfg.font,
                      flexShrink: 1,
                    },
                    triggerTextStyle,
                  ]}
                  numberOfLines={1}
                >
                  {formatYMD(
                    currentRange.start,
                    rangePlaceholder.start || 'Start date'
                  )}
                </Text>
              ) : (
                <RNTextInput
                  value={rangePlaceholderValue?.start ?? ''}
                  onChangeText={(t) =>
                    onRangePlaceholderValueChange?.({
                      start: t,
                      end: rangePlaceholderValue?.end,
                    })
                  }
                  placeholder={rangePlaceholder.start || 'Start date'}
                  placeholderTextColor={subTextColor}
                  style={[
                    {
                      flex: 1,
                      color: textColor,
                      fontSize: sizeCfg.font,
                      padding: 0,
                      marginRight: 4,
                    },
                    triggerTextStyle,
                  ]}
                />
              )}
              <Text
                style={{
                  color: subTextColor,
                  marginHorizontal: 4,
                  fontSize: sizeCfg.font,
                }}
              >
                →
              </Text>
              {currentRange.end ? (
                <Text
                  style={[
                    {
                      color: textColor,
                      fontSize: sizeCfg.font,
                      flexShrink: 1,
                    },
                    triggerTextStyle,
                  ]}
                  numberOfLines={1}
                >
                  {formatYMD(
                    currentRange.end,
                    rangePlaceholder.end || 'End date'
                  )}
                </Text>
              ) : (
                <RNTextInput
                  value={rangePlaceholderValue?.end ?? ''}
                  onChangeText={(t) =>
                    onRangePlaceholderValueChange?.({
                      start: rangePlaceholderValue?.start,
                      end: t,
                    })
                  }
                  placeholder={rangePlaceholder.end || 'End date'}
                  placeholderTextColor={subTextColor}
                  style={[
                    {
                      flex: 1,
                      color: textColor,
                      fontSize: sizeCfg.font,
                      padding: 0,
                      marginLeft: 4,
                    },
                    triggerTextStyle,
                  ]}
                />
              )}
            </View>
          ) : (
            <Text
              numberOfLines={1}
              style={[
                {
                  flex: 1,
                  color:
                    displayLabel.includes('Select') ||
                    displayLabel.includes('Start')
                      ? subTextColor
                      : textColor,
                  fontSize: sizeCfg.font,
                },
                triggerTextStyle,
              ]}
            >
              {displayLabel}
            </Text>
          )}
          {clearable &&
            ((mode === 'single' && currentDate) ||
              (mode === 'range' &&
                (currentRange.start || currentRange.end))) && (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  clear();
                }}
                hitSlop={10}
                style={({ pressed }) => [
                  { padding: 4, borderRadius: 4 },
                  pressed && { opacity: 0.55 },
                ]}
              >
                <FontAwesome5
                  name="times-circle"
                  size={16}
                  color={subTextColor}
                />
              </Pressable>
            )}
          <FontAwesome5
            name="calendar-alt"
            size={16}
            color={subTextColor}
            style={{ marginLeft: 8 }}
          />
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
          <View
            pointerEvents="box-none"
            style={[StyleSheet.absoluteFill, styles.centerWrap]}
          >
            <View
              style={[
                styles.panel,
                styles.centeredModal,
                getElevation(5),
                { backgroundColor: surface, borderColor },
                panelStyle,
              ]}
            >
              <View style={styles.modalHeaderBar}>
                <View style={styles.modalHeaderSpacer} />
              </View>
              <View style={[styles.header, { borderColor }]}>
                <Pressable
                  onPress={goPrevMonth}
                  onPressIn={() => handleNavPressIn('prev')}
                  onPressOut={() => handleNavPressOut('prev')}
                  hitSlop={12}
                  style={[styles.navCircle, prevDisabled && { opacity: 0.35 }]}
                  disabled={prevDisabled}
                >
                  <FontAwesome5
                    name="chevron-left"
                    size={14}
                    color={textColor}
                  />
                </Pressable>
                {mode === 'single' ? (
                  <View style={styles.monthYearWrap}>
                    <Pressable
                      style={styles.monthYearPress}
                      onPress={() =>
                        setPickerMode((m) => (m === 'month' ? 'none' : 'month'))
                      }
                    >
                      <ThemedText
                        type="body-medium"
                        weight="medium"
                        style={[styles.monthYearText, { color: textColor }]}
                      >
                        {monthName}
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      style={styles.monthYearPress}
                      onPress={() =>
                        setPickerMode((m) => (m === 'year' ? 'none' : 'year'))
                      }
                    >
                      <ThemedText
                        type="body-medium"
                        weight="medium"
                        style={[
                          styles.monthYearText,
                          { textAlign: 'center', color: textColor },
                        ]}
                      >
                        {navYear}
                      </ThemedText>
                    </Pressable>
                  </View>
                ) : (
                  <ThemedText
                    type="label-medium"
                    weight="semi-bold"
                    style={{ color: textColor }}
                  >
                    {monthLabel}
                  </ThemedText>
                )}
                <Pressable
                  onPress={goNextMonth}
                  onPressIn={() => handleNavPressIn('next')}
                  onPressOut={() => handleNavPressOut('next')}
                  hitSlop={12}
                  style={styles.navCircle}
                >
                  <FontAwesome5
                    name="chevron-right"
                    size={14}
                    color={textColor}
                  />
                </Pressable>
              </View>
              <View style={[styles.divider, { borderColor }]} />
              {mode === 'single' && pickerMode === 'none' && (
                <View style={styles.quickBar}>
                  <Pressable
                    style={styles.quickBtn}
                    onPress={() => {
                      const raw = startOfDay(new Date());
                      const today = new Date(
                        raw.getFullYear(),
                        raw.getMonth(),
                        raw.getDate(),
                        12,
                        0,
                        0,
                        0
                      );
                      setNavYear(today.getFullYear());
                      setNavMonth(today.getMonth());
                      if (!controlledSingle) setInternalDate(today);
                      onChange?.(today);
                      if (closeOnSelect && !requireConfirmation) setOpen(false);
                    }}
                  >
                    <Text style={styles.quickBtnText}>Today</Text>
                  </Pressable>
                  <Pressable
                    style={styles.quickBtn}
                    onPress={() => setPickerMode('month')}
                  >
                    <Text style={styles.quickBtnText}>Months</Text>
                  </Pressable>
                  <Pressable
                    style={styles.quickBtn}
                    onPress={() => setPickerMode('year')}
                  >
                    <Text style={styles.quickBtnText}>Years</Text>
                  </Pressable>
                </View>
              )}
              {pickerMode === 'month' && mode === 'single' ? (
                <View style={styles.monthPickerGrid}>
                  {monthNames.map((m, i) => {
                    const active = i === navMonth;
                    return (
                      <Pressable
                        key={m}
                        onPress={() => {
                          setNavMonth(i);
                          setPickerMode('none');
                        }}
                        style={[
                          styles.monthItem,
                          active && { backgroundColor: accent },
                        ]}
                      >
                        <Text
                          style={[
                            styles.monthItemText,
                            {
                              color: active ? '#fff' : textColor,
                              fontWeight: active ? '700' : '500',
                            },
                          ]}
                        >
                          {m}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : pickerMode === 'year' && mode === 'single' ? (
                <View style={styles.yearScrollWrap}>
                  <FlatList
                    ref={yearListRef}
                    data={years}
                    keyExtractor={(y) => String(y)}
                    renderItem={renderYearItem}
                    getItemLayout={(_, index) => ({
                      index,
                      length: 48,
                      offset: 48 * index,
                    })}
                    style={{ maxHeight: 250 }}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              ) : (
                <>
                  <View style={styles.weekdaysRow}>
                    {Array.from({ length: 7 }).map((_, i) => {
                      const dayIndex = (firstDayOfWeek + i) % 7;
                      const lbl = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][dayIndex];
                      return (
                        <Text
                          key={i}
                          style={[styles.weekday, { color: subTextColor }]}
                        >
                          {lbl}
                        </Text>
                      );
                    })}
                  </View>
                  <View style={styles.daysWrap}>
                    {matrix.map((week, wi) => (
                      <View key={wi} style={styles.weekRow}>
                        {week.map((cell, di) => {
                          const { date: d, inCurrentMonth } = cell;
                          if (!showAdjacentMonths && !inCurrentMonth)
                            return (
                              <View key={di} style={styles.dayCellEmpty} />
                            );
                          const ymd = formatLocalYMD(d);
                          const dayStatus = dateStatuses?.[ymd];
                          // Block selection for any status (unavailable, reserved, occupied)
                          const disabledDay =
                            dayStatus === 'unavailable' ||
                            dayStatus === 'reserved' ||
                            dayStatus === 'occupied' ||
                            isDisabledDate(d) ||
                            (!inCurrentMonth && !showAdjacentMonths);
                          const selectedSingle =
                            mode === 'single' &&
                            currentDate &&
                            isSameDay(d, currentDate);
                          const inRange = isInRange(d) && inCurrentMonth;
                          const startR = isRangeStart(d) && inCurrentMonth;
                          const endR = isRangeEnd(d) && inCurrentMonth;
                          // Visual styles
                          const isSelectedEdge =
                            selectedSingle || startR || endR;
                          let bg = 'transparent';
                          let outline: ViewStyle | undefined;
                          if (mode === 'single' && selectedSingle) {
                            if (selectionVariant === 'filled') bg = accent;
                            else
                              outline = { borderWidth: 2, borderColor: accent };
                          } else if (mode === 'range') {
                            if (isSelectedEdge) bg = accent;
                            else if (inRange)
                              bg = isDark ? '#223047' : '#E3EDF8';
                          }
                          const showStatusVisuals = mode === 'range';
                          const showSingleStatus =
                            mode === 'single' &&
                            enableSingleStatusVisuals &&
                            !!dateStatuses;
                          if (
                            (showStatusVisuals || showSingleStatus) &&
                            !isSelectedEdge &&
                            !inRange &&
                            dayStatus
                          ) {
                            // subtle background tint ONLY for unavailable (keep other statuses just dots)
                            if (dayStatus === 'unavailable') {
                              bg =
                                statusColors.unavailable +
                                (isDark ? '33' : '22');
                            }
                          }
                          const txtColor =
                            isSelectedEdge &&
                            (selectionVariant === 'filled' || mode === 'range')
                              ? '#fff'
                              : disabledDay
                              ? subTextColor + '55'
                              : inCurrentMonth
                              ? textColor
                              : subTextColor + '88';
                          const radiusStyle: ViewStyle =
                            startR && endR
                              ? { borderRadius: 20 }
                              : startR
                              ? {
                                  borderTopLeftRadius: 20,
                                  borderBottomLeftRadius: 20,
                                }
                              : endR
                              ? {
                                  borderTopRightRadius: 20,
                                  borderBottomRightRadius: 20,
                                }
                              : { borderRadius: 20 };
                          return (
                            <Pressable
                              key={di}
                              disabled={disabledDay}
                              onPress={() => handleSelectDay(d, inCurrentMonth)}
                              style={({ pressed }) => [
                                styles.dayCell,
                                radiusStyle,
                                outline,
                                {
                                  backgroundColor: bg,
                                  opacity: disabledDay ? 0.4 : 1,
                                },
                                pressed && !disabledDay && { opacity: 0.85 },
                              ]}
                            >
                              <View style={styles.dayInner}>
                                <Text
                                  style={{
                                    color: txtColor,
                                    fontSize: 13,
                                    fontWeight: '600',
                                  }}
                                >
                                  {d.getDate()}
                                </Text>
                                {(showStatusVisuals || showSingleStatus) &&
                                  dayStatus &&
                                  !isSelectedEdge && (
                                    <View
                                      style={[
                                        styles.statusDot,
                                        {
                                          backgroundColor:
                                            statusColors[dayStatus],
                                        },
                                      ]}
                                    />
                                  )}
                              </View>
                            </Pressable>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                </>
              )}
              {(mode === 'range' ||
                (mode === 'single' && enableSingleStatusVisuals)) &&
                showStatusLegend && (
                  <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendSwatch,
                          { backgroundColor: statusColors.unavailable },
                        ]}
                      />
                      <Text
                        style={[styles.legendText, { color: subTextColor }]}
                      >
                        Not Available
                      </Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendSwatch,
                          { backgroundColor: statusColors.reserved },
                        ]}
                      />
                      <Text
                        style={[styles.legendText, { color: subTextColor }]}
                      >
                        Reserved
                      </Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendSwatch,
                          { backgroundColor: statusColors.occupied },
                        ]}
                      />
                      <Text
                        style={[styles.legendText, { color: subTextColor }]}
                      >
                        Occupied
                      </Text>
                    </View>
                  </View>
                )}
              {showBookedRooms &&
                mode === 'single' &&
                currentDate &&
                (() => {
                  const key = formatLocalYMD(currentDate);
                  const rooms = bookedRoomsByDate?.[key];
                  if (!rooms || rooms.length === 0) return null;
                  return (
                    <View style={styles.bookedWrap}>
                      <Text style={[styles.bookedTitle, { color: textColor }]}>
                        Booked Rooms ({rooms.length})
                      </Text>
                      {rooms.map((r) => (
                        <View key={r.id} style={styles.bookedItem}>
                          <View
                            style={[
                              styles.bookedDot,
                              {
                                backgroundColor: r.status
                                  ? (statusColors as any)[r.status] || accent
                                  : accent,
                              },
                            ]}
                          />
                          <Text
                            style={[styles.bookedName, { color: subTextColor }]}
                          >
                            {r.name}
                          </Text>
                        </View>
                      ))}
                    </View>
                  );
                })()}
              {showBookedRooms &&
                mode === 'range' &&
                currentRange.start &&
                currentRange.end &&
                (() => {
                  const days: string[] = [];
                  const s = startOfDay(currentRange.start);
                  const e = startOfDay(currentRange.end);
                  for (
                    let d = new Date(s);
                    !isAfter(d, e);
                    d.setDate(d.getDate() + 1)
                  )
                    days.push(formatLocalYMD(d));
                  const aggregated: Record<string, number> = {};
                  days.forEach((k) => {
                    const list = bookedRoomsByDate?.[k];
                    if (list) aggregated[k] = list.length;
                  });
                  const keys = Object.keys(aggregated);
                  if (!keys.length) return null;
                  return (
                    <View style={styles.bookedWrap}>
                      <Text style={[styles.bookedTitle, { color: textColor }]}>
                        Booked Rooms in Range
                      </Text>
                      {keys.map((k) => (
                        <View key={k} style={styles.bookedItem}>
                          <Text
                            style={[styles.bookedName, { color: subTextColor }]}
                          >
                            {k}: {aggregated[k]}
                          </Text>
                        </View>
                      ))}
                    </View>
                  );
                })()}
              {(mode === 'range' || requireConfirmation) && (
                <View style={[styles.footerBar, { borderColor }]}>
                  {mode === 'range' && (
                    <Button
                      variant="soft"
                      color="secondary"
                      label="Clear"
                      onPress={() => {
                        clear();
                      }}
                    />
                  )}
                  <Button
                    variant="solid"
                    color="primary"
                    label={mode === 'range' ? 'Apply' : 'Done'}
                    onPress={() => setOpen(false)}
                  />
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>
    );
  }
);

export default DateInput;

const styles = StyleSheet.create({
  trigger: { borderWidth: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  panel: {
    borderWidth: 1,
    borderRadius: 24,
    paddingBottom: 8,
    overflow: 'hidden',
  },
  centeredModal: { maxWidth: 350, width: '92%', alignSelf: 'center' },
  centerWrap: { justifyContent: 'center', alignItems: 'center' },
  modalHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingTop: 6,
  },
  modalHeaderSpacer: { flex: 1 },
  closeBtn: { padding: 6 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
  },
  navCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  divider: { borderBottomWidth: 1, marginHorizontal: 16, marginBottom: 4 },
  weekdaysRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 2,
  },
  weekday: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600' },
  daysWrap: { paddingHorizontal: 6, paddingTop: 4, paddingBottom: 6 },
  weekRow: { flexDirection: 'row' },
  dayCellEmpty: { flex: 1, padding: 6 },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    margin: 2,
    borderRadius: 20,
    minHeight: 40,
  },
  dayInner: { alignItems: 'center', justifyContent: 'center' },
  statusDot: { marginTop: 2, width: 6, height: 6, borderRadius: 3 },
  footerBar: {
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 6,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendSwatch: { width: 12, height: 12, borderRadius: 3 },
  legendText: { fontSize: 11 },
  bookedWrap: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 },
  bookedTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  bookedItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  bookedDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  bookedName: { fontSize: 12 },
  monthYearWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthYearPress: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  monthYearText: { fontSize: 16, fontWeight: '600' },
  monthPickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  monthItem: {
    width: '25%',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginBottom: 8,
  },
  monthItemText: { fontSize: 13 },
  yearPickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  yearItem: {
    width: '33.33%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginBottom: 8,
  },
  yearItemText: { fontSize: 14 },
  quickBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 2,
  },
  quickBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 6,
  },
  quickBtnText: { fontSize: 12, fontWeight: '600' },
  yearPagerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  yearPagerBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  yearPagerLabel: { fontSize: 13, fontWeight: '600' },
  yearScrollWrap: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 8,
  },
  yearScrollItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearScrollText: { fontSize: 14 },
});
