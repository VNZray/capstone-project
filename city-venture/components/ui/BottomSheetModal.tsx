import { ThemedText } from '@/components/themed-text';
import { card } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Container from '../Container';

type Props = {
  data?: object;
  isOpen: boolean;
  onClose: () => void;
  content?: ReactNode;
  bottomActionButton?: ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
  headerStyle?: StyleProp<ViewStyle>;
  actionStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  snapPoints?: (string | number)[];
  enableDynamicSizing?: boolean;
  keyboardBehavior?: 'extend' | 'fillParent' | 'interactive';
  keyboardBlurBehavior?: 'none' | 'restore';
  android_keyboardInputMode?: 'adjustPan' | 'adjustResize';
  index?: number;
  enablePanDownToClose?: boolean;
  closeButton?: boolean;
};

const BottomSheet: React.FC<Props> = ({
  data,
  isOpen,
  onClose,
  content,
  bottomActionButton,
  headerTitle,
  headerSubtitle,
  headerStyle,
  actionStyle,
  contentStyle,
  snapPoints: customSnapPoints,
  enableDynamicSizing = false,
  keyboardBehavior = 'interactive',
  keyboardBlurBehavior = 'restore',
  android_keyboardInputMode = 'adjustResize',
  index: initialIndex = 0,
  enablePanDownToClose = true,
  closeButton = true,
}) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const surface = isDark ? card.dark : card.light;
  const handleColor = isDark ? '#4B5563' : '#D1D5DB';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';

  // Snap points for different content heights
  const snapPoints = useMemo(
    () => customSnapPoints || ['92%'],
    [customSnapPoints]
  );

  // Present/dismiss modal based on isOpen prop
  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isOpen]);

  // Handle sheet changes
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  // Render backdrop
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={initialIndex}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      animateOnMount={true}
      enablePanDownToClose={enablePanDownToClose}
      enableDynamicSizing={enableDynamicSizing}
      keyboardBehavior={keyboardBehavior}
      keyboardBlurBehavior={keyboardBlurBehavior}
      android_keyboardInputMode={android_keyboardInputMode}
      backgroundStyle={[styles.sheetBackground, { backgroundColor: surface }]}
      handleIndicatorStyle={[
        styles.handleIndicator,
        { backgroundColor: handleColor },
      ]}
    >
      {(headerTitle || headerSubtitle || closeButton) && (
        <View style={[styles.headerContainer, headerStyle]}>
          <View style={styles.headerTextContainer}>
            {headerTitle && (
              <ThemedText
                type="card-title-medium"
                weight="semi-bold"
                style={{ marginBottom: headerSubtitle ? 4 : 0 }}
              >
                {headerTitle}
              </ThemedText>
            )}
            {headerSubtitle && (
              <ThemedText type="body-medium" style={{ color: subTextColor }}>
                {headerSubtitle}
              </ThemedText>
            )}
          </View>
          {closeButton && (
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={textColor} />
            </Pressable>
          )}
        </View>
      )}
      <BottomSheetScrollView
        contentContainerStyle={[styles.scrollContent, contentStyle]}
        showsVerticalScrollIndicator={false}
      >
        <Container padding={0} backgroundColor="transparent">
          {content}
        </Container>
      </BottomSheetScrollView>
      {bottomActionButton && (
        <View style={[styles.actionContainer, actionStyle]}>
          <Container backgroundColor="transparent">
            {bottomActionButton}
          </Container>
        </View>
      )}
    </BottomSheetModal>
  );
};

export default BottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 32 : 40,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  closeButton: {
    padding: 4,
    marginTop: -4,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  actionContainer: {
    paddingBottom: Platform.OS === 'ios' ? 10 : 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
});
