import PageContainer from '@/components/PageContainer';
import { ThemedText } from '@/components/themed-text';
import { card, colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import type { Review } from '@/types/ReviewAndRating';

const Ratings = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user } = useAuth();

  return (
    <PageContainer style={{ paddingTop: 0 }}>
      {/* Summary */}
      <ThemedText>Review and Ratings</ThemedText>
    </PageContainer>
  );
};

export default Ratings;

const styles = StyleSheet.create({
  
});