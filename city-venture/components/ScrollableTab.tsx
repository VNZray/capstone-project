import Button from '@/components/Button';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Tab = {
  key: string;
  label: string;
  icon: string;
};

type Props = {
  tabs: Tab[];
  onTabChange?: (tab: Tab, index: number) => void; // ✅ callback
  initialIndex?: number; // ✅ optional initial tab
  activeKey?: string; // ✅ controlled active tab (optional)
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

  const onTabPress = (index: number) => {
    setTabIndex(index);
    scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * index, animated: false });
    if (onTabChange) onTabChange(tabs[index], index); // ✅ notify parent
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
      contentContainerStyle={styles.container}
    >
      {tabs.map((t, i) => (
        <Button
          elevation={2}
          startIcon={t.icon}
          key={t.key}
          onPress={() => onTabPress(i)}
          label={t.label}
          size="medium"
          padding={11}
          iconSize={16}
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
    gap: 8,
    paddingVertical: 16,
    overflow: 'visible',
  },
});
