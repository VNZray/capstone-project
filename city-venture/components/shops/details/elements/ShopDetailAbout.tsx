import type { BusinessProfileView } from '@/components/shops/details/types';
import { ShopColors } from '@/constants/color';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ShopDetailAboutProps {
  shop: BusinessProfileView;
}

const ShopDetailAbout: React.FC<ShopDetailAboutProps> = ({ shop }) => {
  const [expanded, setExpanded] = useState(false);

  if (!shop.description && !shop.story) {
    return null;
  }

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const content = shop.story || shop.description || '';
  // Show full text if short enough (e.g., < 150 chars), otherwise check expanded state
  const shouldTruncate = content.length > 200;
  const displayedContent = !shouldTruncate || expanded ? content : `${content.slice(0, 200)}...`;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="information-circle" size={20} color={ShopColors.accent} />
        <Text style={styles.cardTitle}>About Us</Text>
      </View>

      <Text style={styles.descriptionText}>
        {displayedContent}
      </Text>

      {shouldTruncate && (
        <TouchableOpacity onPress={toggleExpand} style={styles.expandButton}>
          <Text style={styles.expandButtonText}>
            {expanded ? 'Read Less' : 'Read More'}
          </Text>
          <Ionicons 
            name={expanded ? 'chevron-up' : 'chevron-down'} 
            size={16} 
            color={ShopColors.accent} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    lineHeight: 24,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 4,
    paddingVertical: 4,
  },
  expandButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.accent,
  },
});

export default ShopDetailAbout;

