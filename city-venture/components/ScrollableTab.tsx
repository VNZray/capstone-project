import Button from '@/components/Button';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { scaled } from '@/utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Tab = {
  key: string;
  label: string;
  icon: string;
};

type Props = {
  tabs: Tab[];
  onTabChange?: (tab: Tab, index: number) => void; // callback
  initialIndex?: number; // optional initial tab
  activeKey?: string; // controlled active tab (optional)
  variant?: 'solid' | 'outlined' | 'soft' ;
};

const ScrollableTab = ({
  variant,
  tabs,
  onTabChange,
  initialIndex = 0,
  activeKey,
}: Props) => {
  const [tabIndex, setTabIndex] = useState(initialIndex);
  const scrollRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();

  const responsiveGap = scaled(8, { min: 6, max: 12, width });
  const responsivePadding = scaled(11, { min: 9, max: 13, width });
  const responsiveIconSize = scaled(16, { min: 14, max: 18, width });
  const responsiveVerticalPadding = scaled(16, { min: 12, max: 20, width });

  const onTabPress = (index: number) => {
    setTabIndex(index);
    scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * index, animated: false });
    if (onTabChange) onTabChange(tabs[index], index); // notify parent
  };

  // Sync internal tabIndex with external activeKey when provided
  useEffect(() => {
    if (!activeKey) return;
    const idx = tabs.findIndex((t) => t.key === activeKey);
    if (idx !== -1 && idx !== tabIndex) {
      setTabIndex(idx);
    }
  }, [activeKey, tabs, tabIndex]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, { gap: responsiveGap, paddingVertical: responsiveVerticalPadding }]}
    >
      {tabs.map((t, i) => (
        <Button
          elevation={2}
          startIcon={t.icon}
          key={t.key}
          onPress={() => onTabPress(i)}
          label={t.label}
          size="medium"
          padding={responsivePadding}
          iconSize={responsiveIconSize}
          variant={tabIndex === i ? 'solid' : variant}
          color={tabIndex === i ? 'primary' : 'white'}
        />
      ))}
    </ScrollView>
  );
};

export default ScrollableTab;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    overflow: 'visible',
  },
});
