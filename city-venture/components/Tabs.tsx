import Button from '@/components/Button';
import { useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Tab = {
  key: string;
  label: string;
  icon: string;
};

type Props = {
  tabs: Tab[];
  onTabChange?: (tab: Tab, index: number) => void;
  initialIndex?: number;
};

const Tabs = ({ tabs, onTabChange, initialIndex = 0 }: Props) => {
  const [tabIndex, setTabIndex] = useState(initialIndex);
  const scrollRef = useRef<ScrollView>(null);

  const onTabPress = (index: number) => {
    setTabIndex(index);
    scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * index, animated: false });
    if (onTabChange) onTabChange(tabs[index], index);
  };

  return (
    <View style={styles.container}>
      {tabs.map((t, i) => (
        <Button
          elevation={3}
          style={{ flex: 1 }}
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
    </View>
  );
};

export default Tabs;

const styles = StyleSheet.create({
  container: {
    gap: 8,
    maxWidth: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
