import { ShopColors } from '@/constants/ShopColors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ShopCategoriesProps } from './types';

const ShopCategories: React.FC<ShopCategoriesProps> = ({
  categories,
  onCategoryPress,
  showViewAll = false,
  onViewAllPress,
}) => {
  const styles = StyleSheet.create({
    container: {
      marginBottom: 0, // Remove bottom margin - handled by parent
      backgroundColor: ShopColors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16, // Reduced from 20
      marginBottom: 8, // Reduced from 12
    },
    title: {
      fontSize: 18, // Reduced from 20 to match other sections
      fontFamily: 'Poppins-SemiBold',
      color: ShopColors.textPrimary,
    },
    list: {
      paddingHorizontal: 16, // Reduced from 20
      paddingBottom: 0, // Removed padding
      paddingTop: 0, // Removed padding
    },
    categoryCard: {
      backgroundColor: ShopColors.cardBackground,
      borderRadius: 10, // Reduced from 12
      padding: 8, // Reduced from 10
      marginRight: 10, // Reduced from 16
      alignItems: 'center',
      justifyContent: 'center',
      width: 75, // Reduced from 85
      height: 85, // Reduced from 95
      borderWidth: 1,
      borderColor: ShopColors.border,
      shadowColor: ShopColors.shadow,
      shadowOffset: { width: 0, height: 1 }, // Reduced shadow
      shadowOpacity: 0.06, // Lighter shadow
      shadowRadius: 2,
      elevation: 1,
    },
    iconContainer: {
      backgroundColor: ShopColors.accent + '15',
      borderRadius: 18, // Reduced from 20
      width: 36, // Reduced from 40
      height: 36, // Reduced from 40
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4, // Reduced from 6
    },
    categoryName: {
      fontSize: 10, // Reduced from 11
      fontFamily: 'Poppins-Medium',
      color: ShopColors.textPrimary,
      textAlign: 'center',
      lineHeight: 12, // Reduced from 14
      maxWidth: 65, // Reduced from 75
    },
    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    viewAllText: {
      fontSize: 14, // Reduced from 16 to match other sections
      fontFamily: 'Poppins-Medium',
      color: ShopColors.accent,
      marginRight: 4,
    },
  });

  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => onCategoryPress(item.id)}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={`Browse ${item.name} shops`}
      accessibilityRole="button"
    >
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon as any} size={20} color={ShopColors.accent} />
        {/* Reduced from 22 */}
      </View>
      <Text style={styles.categoryName} numberOfLines={2} ellipsizeMode="tail">
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Shop Categories</Text>
        </View>
        {showViewAll && onViewAllPress && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={onViewAllPress}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons
              name="chevron-forward"
              size={14} // Reduced from 16 to match other sections
              color={ShopColors.accent}
            />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ width: 0 }} />}
        getItemLayout={(data, index) => ({
          length: 87, // width (75) + marginRight (12)
          offset: 87 * index,
          index,
        })}
      />
    </View>
  );
};

export default ShopCategories;
