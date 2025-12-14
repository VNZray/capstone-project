import { Colors, colors } from '@/constants/color';
import React, { createContext, useContext, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';

type TabContainerProps = {
  children: React.ReactNode;
  initialTab?: string;
  onTabChange?: (tab: string) => void;
  backgroundColor?: string;
};

type TabsContextType = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

type TabProps = {
  tab: string;
  label: string;
  activeTab?: string;
  backgroundColor?: string;
};

export const TabContainer = ({
  children,
  initialTab,
  onTabChange,
  backgroundColor,
}: TabContainerProps) => {
  // Find the first Tab child to set as default if initialTab is not provided
  let defaultTab = initialTab;
  if (!defaultTab) {
    React.Children.forEach(children, (child) => {
      if (
        React.isValidElement(child) &&
        (child.props as any).tab &&
        !defaultTab
      ) {
        defaultTab = (child.props as any).tab;
      }
    });
  }
  const [activeTab, setActiveTab] = useState(defaultTab || '');

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  return (
    <TabsContext.Provider
      value={{ activeTab, setActiveTab: handleSetActiveTab }}
    >
      <View
        style={[
          styles.tabsContainer,
          {
            backgroundColor: backgroundColor || 'white',
            borderBottomColor: '#E5E8EC',
          },
        ]}
      >
        {children}
      </View>
    </TabsContext.Provider>
  );
};

export const Tab: React.FC<TabProps> = (props) => {
  const tabsContext = useContext(TabsContext);
  if (!tabsContext) {
    throw new Error('Tab must be used within a TabContainer');
  }
  const { activeTab, setActiveTab } = tabsContext;
  const isActive = activeTab === props.tab;
  return (
    <Pressable
      style={[
        styles.tab,
        isActive && {
          borderBottomColor: props.backgroundColor || Colors.light.primary,
          borderBottomWidth: 2,
        },
      ]}
      onPress={() => setActiveTab(props.tab)}
      accessibilityState={{ selected: isActive }}
    >
      <ThemedText
        type="body-small"
        weight={isActive ? 'medium' : 'normal'}
        style={[{ color: isActive ? Colors.light.primary : 'black' }]}
      >
        {props.label}
      </ThemedText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
