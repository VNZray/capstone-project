import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useFonts } from 'expo-font';
import {
  Platform,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewStyle,
} from 'react-native';

type TabSwitcherTab = {
  key: string;
  label: string;
};

type TabSwitcherProps = {
  tabs: TabSwitcherTab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  color?: string; // Text color for inactive tab
  active?: string; // Background/text color for active tab
  style?: ViewStyle; // Container style
  tabStyle?: ViewStyle; // Style for individual tabs
  textStyle?: TextStyle; // Style for tab labels
  shadow?: boolean; // Enable/disable shadow
  borderRadius?: number; // Customize corner radius
  tabPadding?: number; // Padding for each tab
  tabSpacing?: number; // Spacing between tabs
  themeOverride?: 'light' | 'dark'; // Optional override of theme
};

const TabSwitcher = ({
  tabs,
  activeTab,
  onTabChange,
  color = '#333',
  active = '#0A1B47',
  style,
  tabStyle,
  textStyle,
  shadow = true,
  borderRadius = 6,
  tabPadding = 10,
  tabSpacing = 10,
  themeOverride,
}: TabSwitcherProps) => {
  const colorScheme = themeOverride ?? useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const borderColor = colorScheme === 'dark' ? '#F8F8F8' : active;

  const [fontsLoaded] = useFonts({
    'Poppins-Black': require('@/assets/fonts/Poppins/Poppins-Black.ttf'),
    'Poppins-Regular': require('@/assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins/Poppins-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const isWeb = Platform.OS === 'web';

  return (
    <View style={[styles.tabsContainer, { gap: tabSpacing }, style]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            style={[
              {
                flex: 1,
                padding:
                  Platform.OS === 'android' ? tabPadding / 2 : tabPadding,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius,
                backgroundColor: isActive
                  ? active
                  : isWeb
                  ? '#fff'
                  : themeColors.background,
                borderWidth: isActive ? 0.5 : 0,
                borderColor: isActive ? active : 'transparent',

                ...(shadow && !isWeb
                  ? {
                      // Android / iOS shadows
                      shadowColor: isActive ? active : borderColor,
                      shadowOpacity: 0.2,
                      shadowOffset: { width: 4, height: 4 },
                      shadowRadius: 3,
                      elevation: isActive ? 6 : 4,
                    }
                  : {
                      // Web box-shadow
                      boxShadow: isActive
                        ? `0px 0px 0px ${active}`
                        : `0px 0px 4px rgba(0,0,0,0.4)`,
                    }),
              },
              tabStyle,
            ]}
          >
            <ThemedText
              type="tabText"
              style={[
                {
                  color: isActive ? '#fff' : color,
                },
                textStyle,
              ]}
            >
              {tab.label}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default TabSwitcher;
