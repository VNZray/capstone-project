import { Colors } from '@/constants/color';
import { useColorScheme } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../themed-text';
import Container from '../Container';
import { IconSymbol } from '../ui/icon-symbol';
import { StatusBar } from 'expo-status-bar';

type Props = {
  background?: 'dark' | 'light' | 'primary' | 'secondary' | 'transparent';
  headerBackTitle?: string;
  backButton?: boolean;
  onPress?: () => void;
  title?: string;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
  bottomComponent?: React.ReactNode;
};

const findBackgroundColor = (
  background: Props['background'],
  isDark: boolean
) => {
  if (background === 'dark') {
    return '#0D1B2A';
  } else if (background === 'light') {
    return '#F8F9FA';
  } else if (background === 'primary') {
    return Colors.light.primary;
  } else if (background === 'secondary') {
    return Colors.light.secondary;
  } else {
    return background || (isDark ? '#0D1B2A' : '#F8F9FA');
  }
};

const findTextColor = (background: Props['background'], isDark: boolean) => {
  if (background === 'dark') {
    return '#FFFFFF';
  } else if (background === 'light') {
    return '#0D1B2A';
  } else if (background === 'primary') {
    return '#FFFFFF';
  } else if (background === 'secondary') {
    return '#FFFFFF';
  } else if (background === 'transparent') {
    return '#FFFFFF';
  } else {
    return isDark ? '#FFFFFF' : '#0D1B2A';
  }
};

export const AppHeader = (props: Props) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <SafeAreaView
      edges={['top']}
      style={{
        padding: 16,
        backgroundColor: findBackgroundColor(props.background, isDark),
        display: 'flex',
      }}
    >
      <StatusBar style={props.background === 'primary' ? 'light' : 'dark'} />
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flex: 1 }}>
          {props.backButton ? (
            <>
              {props.headerBackTitle === '' ? (
                <Pressable
                  onPress={() =>
                    props.onPress ? props.onPress() : router.back()
                  }
                  style={[
                    styles.backButton,
                    {
                      backgroundColor: findBackgroundColor(
                        props.background,
                        isDark
                      ),
                    },
                  ]}
                >
                  <IconSymbol name="arrow.backward" color={'white'} size={32} />
                </Pressable>
              ) : (
                <Pressable
                  onPress={() =>
                    props.onPress ? props.onPress() : router.back()
                  }
                >
                  <ThemedText
                    startIcon={
                      <Ionicons
                        name="arrow-back"
                        size={20}
                        color={findTextColor(props.background, isDark)}
                      />
                    }
                    style={{
                      color: findTextColor(props.background, isDark),
                    }}
                  >
                    {props.headerBackTitle}
                  </ThemedText>
                </Pressable>
              )}
            </>
          ) : (
            <>{props.leftComponent}</>
          )}
        </View>

        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          {props.title && (
            <ThemedText
              align="center"
              weight="medium"
              type="body-large"
              style={{ color: findTextColor(props.background, isDark) }}
            >
              {props.title}
            </ThemedText>
          )}
        </View>

        <View
          style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}
        >
          <>{props.rightComponent}</>
        </View>
      </View>

      {props.bottomComponent && (
        <View style={{ marginTop: 12 }}>{props.bottomComponent}</View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});
