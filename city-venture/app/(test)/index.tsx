import Button from '@/components/Button';
import Container from '@/components/Container';
import PageContainer from '@/components/PageContainer';
import { ThemedText } from '@/components/themed-text';
import BottomSheet from '@/components/ui/BottomSheetModal';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TestPage = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const snapPoints = ['90%'];

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };
  return (
    <SafeAreaView>
      <PageContainer align="center" justify="center">
        <Text>TestPage</Text>
        <Button label="Test" onPress={handleOpen} />
      </PageContainer>

      <BottomSheet
        isOpen={isOpen}
        onClose={handleClose}
        headerTitle="Test Bottom Sheet"
        content={
          <Container backgroundColor="transparent">
            <ThemedText dynamicTypeRamp="title1">
              This is a test bottom sheet content.
            </ThemedText>

            <ThemedText dynamicTypeRamp="title1">
              Height: {snapPoints[0]}
            </ThemedText>
          </Container>
        }
        snapPoints={snapPoints}
        closeButton={false}
        bottomActionButton={
          <View>
            <Button size="large" label="Close" onPress={handleClose} />
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default TestPage;

const styles = StyleSheet.create({});
