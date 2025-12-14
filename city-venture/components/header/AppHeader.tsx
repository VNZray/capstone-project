import { Colors } from '@/constants/color';
import { useColorScheme } from '@/hooks';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../themed-text';
import AndroidHeaderButton from './AndroidHeaderButton';
import HeaderButton from './HeaderButton';
import CustomIonIcon from '../ui/CustomIonIcon';

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
  } else if (background === 'transparent') {
    return 'transparent';
  } else {
    return background || (isDark ? '#0D1B2A' : '#F8F9FA');
  }
};

const findTextColor = (background: Props['background'], isDark: boolean) => {
  if (background === 'dark' || background === 'transparent') {
    return '#FFFFFF';
  } else if (background === 'light') {
    return '#0D1B2A';
  } else if (background === 'primary') {
    return '#FFFFFF';
  } else if (background === 'secondary') {
    return '#FFFFFF';
  } else {
    return isDark ? '#FFFFFF' : '#0D1B2A';
  }
};

export const AppHeader = (props: Props) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const isTransparent = props.background === 'transparent';

  const handleBackPress = () => {
    router.back();
  };

  const headerContent = (
    <>
      <StatusBar
        style={
          props.background === 'primary' || props.background === 'transparent'
            ? 'light'
            : 'auto'
        }
      />
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
              {props.headerBackTitle ? (
                <TouchableOpacity
                  onPress={() =>
                    props.onPress ? props.onPress() : router.back()
                  }
                >
                  <ThemedText
                    startIcon={
                      <CustomIonIcon
                        name="arrow-back"
                        size={24}
                        color={findTextColor(props.background, isDark)}
                      />
                    }
                    style={{
                      color: findTextColor(props.background, isDark),
                    }}
                  >
                    {props.headerBackTitle}
                  </ThemedText>
                </TouchableOpacity>
              ) : (
                <>
                  {Platform.OS === 'ios' ? (
                    <HeaderButton
                      isTransparent={isTransparent}
                      icon="arrow-back"
                      onPress={handleBackPress}
                      iconColor={findTextColor(props.background, isDark)}
                    />
                  ) : (
                    <AndroidHeaderButton
                      isTransparent={isTransparent}
                      icon="arrow-back"
                      onPress={handleBackPress}
                      iconColor={findTextColor(props.background, isDark)}
                    />
                  )}
                </>
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
    </>
  );

  // Use BlurView for transparent background
  if (isTransparent) {
    return (
      <BlurView
        tint="systemChromeMaterialDark"
        intensity={15}
        style={styles.blurContainer}
      >
        <SafeAreaView edges={['top']} style={styles.transparentHeader}>
          {headerContent}
        </SafeAreaView>
      </BlurView>
    );
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={{
        padding: 16,
        backgroundColor: findBackgroundColor(props.background, isDark),
        display: 'flex',
      }}
    >
      {headerContent}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  transparentHeader: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // translucent black
  },
});
