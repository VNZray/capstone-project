import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';

type ResponsiveContainerProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  maxWidth?: number;
};

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  style,
  maxWidth = 1200,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.content, { maxWidth }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  content: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
});
