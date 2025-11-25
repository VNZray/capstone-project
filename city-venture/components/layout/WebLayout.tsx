import React from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { WebSidebar } from '@/components/navigation/WebSidebar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type WebLayoutProps = {
  children: React.ReactNode;
};

export const WebLayout: React.FC<WebLayoutProps> = ({ children }) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  // Breakpoint for switching to desktop layout
  const isDesktop = width >= 768;

  if (!isDesktop) {
    return <View style={{ flex: 1 }}>{children}</View>;
  }

  return (
    <View style={styles.container}>
      <WebSidebar />
      <View style={[styles.content, { paddingTop: insets.top }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    height: '100%',
    overflow: 'hidden', // Ensure content scrolls within this view
  },
});
