import Button from '@/components/Button';
import { useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { scaled } from '@/utils/responsive';

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
  const { width } = useWindowDimensions();
  const sizing = SIZE_MAP[size];

  const responsiveGap = scaled(8, { min: 6, max: 12, width });
  const responsivePadding = scaled(sizing.padding, { min: sizing.padding * 0.8, max: sizing.padding * 1.2, width });
  const responsiveIconSize = scaled(sizing.iconSize, { min: sizing.iconSize * 0.85, max: sizing.iconSize * 1.15, width });

  const onTabPress = (index: number) => {
    setTabIndex(index);
    scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * index, animated: false });
    if (onTabChange) onTabChange(tabs[index], index);
  };

  return (
    <View style={[styles.container, { gap: responsiveGap }]}>
      {tabs.map((t, i) => (
        <Button
          elevation={2}
          style={fullWidth ? { flex: 1 } : undefined}
          startIcon={t.icon}
          key={t.key}
          onPress={() => onTabPress(i)}
          label={t.label}
          size={sizing.buttonSize}
          padding={responsivePadding}
          iconSize={responsiveIconSize}
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
    maxWidth: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
