import Button from '@/components/Button';
import { useRef, useState } from 'react';
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
};

const ScrollableTab = ({ tabs, onTabChange, initialIndex = 0 }: Props) => {
  const [tabIndex, setTabIndex] = useState(initialIndex);
  const scrollRef = useRef<ScrollView>(null);

  const onTabPress = (index: number) => {
    setTabIndex(index);
    scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * index, animated: false });
    if (onTabChange) onTabChange(tabs[index], index); // ✅ notify parent
  };

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
          variant={tabIndex === i ? 'solid' : 'solid'}
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
  },
});
