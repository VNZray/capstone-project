import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle, useColorScheme } from 'react-native';
import { card } from '@/constants/color';

type MainContentCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

const MainContentCard: React.FC<MainContentCardProps> = ({ children, style }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const surface = colorScheme === 'dark' ? card.dark : card.light;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: surface,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
  },
});

export default MainContentCard;
