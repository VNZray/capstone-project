import Button from '@/components/Button';
import { useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Tab = {
  key: string;
  label: string;
  icon: string;
};

type TabSize = 'small' | 'medium' | 'large';

type Props = {
  tabs: Tab[];
  onTabChange?: (tab: Tab, index: number) => void;
  initialIndex?: number;
  size?: TabSize; // controls button + icon sizing
  fullWidth?: boolean; // make all tabs share width equally
};

const SIZE_MAP: Record<TabSize, { buttonSize: 'small' | 'medium' | 'large'; padding: number; iconSize: number }> = {
  small: { buttonSize: 'small',  padding: 6,  iconSize: 14 },
  medium: { buttonSize: 'medium', padding: 11, iconSize: 16 },
  large: { buttonSize: 'large',  padding: 14, iconSize: 18 },
};

const Tabs = ({ tabs, onTabChange, initialIndex = 0, size = 'medium', fullWidth = true }: Props) => {
  const [tabIndex, setTabIndex] = useState(initialIndex);
  const scrollRef = useRef<ScrollView>(null);
  const sizing = SIZE_MAP[size];

  const onTabPress = (index: number) => {
    setTabIndex(index);
    scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * index, animated: false });
    if (onTabChange) onTabChange(tabs[index], index);
  };

  return (
    <View style={styles.container}>
      {tabs.map((t, i) => (
        <Button
          elevation={2}
          style={fullWidth ? { flex: 1 } : undefined}
          startIcon={t.icon}
          key={t.key}
          onPress={() => onTabPress(i)}
          label={t.label}
          size={sizing.buttonSize}
          padding={sizing.padding}
          iconSize={sizing.iconSize}
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
