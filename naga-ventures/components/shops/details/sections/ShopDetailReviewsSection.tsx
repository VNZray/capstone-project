import { ShopColors } from '@/constants/ShopColors';
import type { ShopData, ShopReview } from '@/types/shop';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShopDetailRatingBreakdown, ShopDetailReviewCard } from '../elements';
import ReviewSubmittedModal from '../elements/ReviewSubmittedModal';
import WriteReviewModal from '../elements/WriteReviewModal';

interface ShopDetailReviewsSectionProps {
  shop: ShopData;
  onImagePress: (imageUrl: string) => void;
  onHelpfulPress: (reviewId: string) => void;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
type FilterOption = 'all' | '5' | '4' | '3' | '2' | '1' | 'photos'; // Removed 'verified'

const ShopDetailReviewsSection: React.FC<ShopDetailReviewsSectionProps> = ({
  shop,
  onImagePress,
  onHelpfulPress
}) => {
  const [reviews, setReviews] = useState<ShopReview[]>(shop.reviews || []);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isWriteReviewModalVisible, setIsWriteReviewModalVisible] = useState(false);
  const [isReviewSubmittedModalVisible, setIsReviewSubmittedModalVisible] = useState(false);
  
  // Get safe area insets for proper bottom padding
  const insets = useSafeAreaInsets();

  const { sortedReviews, reviewStats, averageRating, totalReviewCount } = useMemo(() => {
    let currentReviews = [...reviews];
    let filteredReviews = [...currentReviews];

    switch (filterBy) {
      case '5': case '4': case '3': case '2': case '1':
        filteredReviews = filteredReviews.filter(review => review.rating === parseInt(filterBy));
        break;
      case 'photos':
        filteredReviews = filteredReviews.filter(review => review.images && review.images.length > 0);
        break;
    }

    switch (sortBy) {
      case 'newest':
        filteredReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'oldest':
        filteredReviews.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'highest':
        filteredReviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filteredReviews.sort((a, b) => a.rating - b.rating);
        break;
      case 'helpful':
        filteredReviews.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
        break;
    }
    
    const totalReviews = currentReviews.length;
    const currentAverageRating = totalReviews > 0
      ? currentReviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews
      : 0;

    const currentRatingBreakdown = totalReviews > 0 ? currentReviews.reduce((acc, review) => {
        acc[review.rating as keyof typeof acc] = (acc[review.rating as keyof typeof acc] || 0) + 1;
        return acc;
      }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })
      : { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    const stats = {
      total: totalReviews,
      filtered: filteredReviews.length,
      ratingBreakdown: currentRatingBreakdown,
    };

    return { 
      sortedReviews: filteredReviews, 
      reviewStats: stats, 
      averageRating: currentAverageRating,
      totalReviewCount: totalReviews
    };
  }, [reviews, sortBy, filterBy]);

  const handleSortChange = useCallback((option: SortOption) => setSortBy(option), []);
  const handleFilterChange = useCallback((option: FilterOption) => setFilterBy(option), []);
  
  const openWriteReviewModal = () => setIsWriteReviewModalVisible(true);
  const closeWriteReviewModal = () => setIsWriteReviewModalVisible(false);

  const handleReviewSubmissionSuccess = () => {
    setIsReviewSubmittedModalVisible(true);
  };

  const handleReviewSubmitData = (rating: number, comment: string, images: ImagePicker.ImagePickerAsset[]) => {
    const newReview: ShopReview = {
      id: `review_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId: 'currentUser_malzafre',
      userName: 'malzafre (You)',
      userAvatar: undefined, 
      rating,
      comment,
      date: new Date('2025-06-06T08:11:58Z').toISOString(), // Current date and time
      images: images.map(img => img.uri),
      helpfulCount: 0,
      isVerifiedPurchase: false,
      response: undefined,
    };
    setReviews(prevReviews => [newReview, ...prevReviews]);
  };

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'newest': return 'Newest First';
      case 'oldest': return 'Oldest First';
      case 'highest': return 'Highest Rating';
      case 'lowest': return 'Lowest Rating';
      case 'helpful': return 'Most Helpful';
    }
  };
  
  const getFilterLabel = (option: FilterOption) => {
    switch (option) {
      case 'all': return 'All Reviews';
      case 'photos': return 'With Photos';
      default: return `${option} Stars`;
    }
  };

  // Render filter options as horizontal scrollable sections
  const renderSortOptions = () => (
    <View style={styles.filterOptionsContainer}>
      {(['newest', 'helpful', 'highest', 'lowest', 'oldest'] as SortOption[]).map(option => (
        <TouchableOpacity 
          key={option} 
          style={[styles.filterOption, sortBy === option && styles.filterOptionActive]} 
          onPress={() => handleSortChange(option)}
        >
          <Text style={[styles.filterOptionText, sortBy === option && styles.filterOptionTextActive]}>
            {getSortLabel(option)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFilterOptions = () => (
    <View style={styles.filterOptionsContainer}>
      {(['all', '5', '4', '3', '2', '1', 'photos'] as FilterOption[]).map(option => (
        <TouchableOpacity 
          key={option} 
          style={[styles.filterOption, filterBy === option && styles.filterOptionActive]} 
          onPress={() => handleFilterChange(option)}
        >
          <Text style={[styles.filterOptionText, filterBy === option && styles.filterOptionTextActive]}>
            {getFilterLabel(option)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Header component for FlatList
  const renderHeader = () => (
    <>
      {/* Summary Section */}
      <View style={styles.summarySection}>
        <View style={styles.summaryHeader}>
          <Text style={styles.sectionTitle}>Customer Reviews</Text>
          <TouchableOpacity style={styles.writeReviewButton} onPress={openWriteReviewModal}>
            <Ionicons name="create" size={14} color="#FFFFFF" />
            <Text style={styles.writeReviewButtonText}>Write Review</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.reviewsSummary}>
          <View style={styles.reviewsSummaryLeft}>
            <Text style={styles.reviewsAverageRating}>{averageRating.toFixed(1)}</Text>
            <View style={styles.reviewsStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name="star"
                  size={16}
                  color={star <= averageRating ? ShopColors.warning : ShopColors.border}
                />
              ))}
            </View>
            <Text style={styles.reviewsCount}>Based on {totalReviewCount} reviews</Text>
          </View>
          <View style={styles.reviewsSummaryRight}>
            <ShopDetailRatingBreakdown 
              ratingBreakdown={reviewStats.ratingBreakdown} 
              totalRatings={totalReviewCount} 
            />
          </View>
        </View>
      </View>

      {/* Filters Section */}
      <View style={styles.filtersSection}>
        <View style={styles.filtersHeader}>
          <TouchableOpacity style={styles.filtersToggle} onPress={() => setShowFilters(!showFilters)}>
            <Ionicons name="options" size={16} color={ShopColors.accent} />
            <Text style={styles.filtersToggleText}>Filters & Sort</Text>
            <Ionicons name={showFilters ? "chevron-up" : "chevron-down"} size={16} color={ShopColors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.resultCount}>{reviewStats?.filtered ?? 0} of {reviewStats?.total ?? 0} reviews</Text>
        </View>
        {showFilters && (
          <View style={styles.filtersContent}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterGroupTitle}>Sort by</Text>
              {renderSortOptions()}
            </View>
            <View style={styles.filterGroup}>
              <Text style={styles.filterGroupTitle}>Filter by</Text>
              {renderFilterOptions()}
            </View>
          </View>
        )}
      </View>
    </>
  );

  // Empty state component
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={48} color={ShopColors.textSecondary} />
      <Text style={styles.emptyStateTitle}>No Reviews Yet</Text>
      <Text style={styles.emptyStateText}>Be the first to share your experience!</Text>
      <TouchableOpacity style={styles.writeReviewButton} onPress={openWriteReviewModal}>
        <Ionicons name="create" size={16} color="#FFFFFF" />
        <Text style={styles.writeReviewButtonText}>Write a Review</Text>
      </TouchableOpacity>
    </View>
  );

  // No results component
  const renderNoResults = () => (
    <View style={styles.noResultsState}>
      <Ionicons name="search-outline" size={32} color={ShopColors.textSecondary} />
      <Text style={styles.noResultsTitle}>No Reviews Found</Text>
      <Text style={styles.noResultsText}>No reviews match your current filters. Try adjusting.</Text>
      <TouchableOpacity style={styles.clearFiltersButton} onPress={() => { setFilterBy('all'); setSortBy('newest'); }}>
        <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
      </TouchableOpacity>
    </View>
  );

  // Footer component with proper spacing for tab navigator
  const renderFooter = () => (
    <View style={[styles.listFooter, { paddingBottom: Math.max(insets.bottom + 20, 80) }]} />
  );

  if (totalReviewCount === 0) {
    return (
      <>
        {renderEmptyState()}
        <WriteReviewModal
          visible={isWriteReviewModalVisible}
          onClose={closeWriteReviewModal}
          onSubmit={handleReviewSubmitData}
          shopName={shop.name}
          onSubmissionSuccess={handleReviewSubmissionSuccess}
        />
        <ReviewSubmittedModal
          visible={isReviewSubmittedModalVisible}
          onClose={() => setIsReviewSubmittedModalVisible(false)}
          shopName={shop.name}
        />
      </>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedReviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ShopDetailReviewCard 
            review={item} 
            onImagePress={onImagePress} 
            onHelpfulPress={onHelpfulPress} 
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={sortedReviews.length === 0 && totalReviewCount > 0 ? renderNoResults : null}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        // Additional padding to ensure content doesn't get cut off
        contentInsetAdjustmentBehavior="automatic"
      />
      
      <WriteReviewModal
        visible={isWriteReviewModalVisible}
        onClose={closeWriteReviewModal}
        onSubmit={handleReviewSubmitData}
        shopName={shop.name}
        onSubmissionSuccess={handleReviewSubmissionSuccess}
      />
      <ReviewSubmittedModal
        visible={isReviewSubmittedModalVisible}
        onClose={() => setIsReviewSubmittedModalVisible(false)}
        shopName={shop.name}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ShopColors.background,
  },
  flatListContent: {
    flexGrow: 1,
  },
  listFooter: {
    // Dynamic bottom padding based on safe area + tab navigator height
    // Will be calculated in renderFooter function
  },
  summarySection: {
    backgroundColor: ShopColors.cardBackground,
    marginBottom: 8,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: ShopColors.border,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ShopColors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  writeReviewButtonText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  reviewsSummary: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  reviewsSummaryLeft: {
    alignItems: 'center',
    marginRight: 24,
  },
  reviewsAverageRating: {
    fontSize: 36,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
  },
  reviewsStars: {
    flexDirection: 'row',
    marginVertical: 4,
    gap: 2,
  },
  reviewsCount: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    textAlign: 'center',
  },
  reviewsSummaryRight: {
    flex: 1,
  },
  filtersSection: {
    backgroundColor: ShopColors.cardBackground,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: ShopColors.border,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filtersToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filtersToggleText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.accent,
  },
  resultCount: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
  filtersContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: ShopColors.border,
    gap: 16,
  },
  filterGroup: {
    marginTop: 16,
  },
  filterGroupTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
    marginBottom: 8,
  },
  filterOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow wrapping instead of horizontal scroll
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: ShopColors.background,
    borderWidth: 1,
    borderColor: ShopColors.border,
  },
  filterOptionActive: {
    backgroundColor: ShopColors.accent,
    borderColor: ShopColors.accent,
  },
  filterOptionText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textPrimary,
  },
  filterOptionTextActive: {
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    backgroundColor: ShopColors.background,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  noResultsState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noResultsTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },
  noResultsText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  clearFiltersButton: {
    backgroundColor: ShopColors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  clearFiltersButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
});

export default React.memo(ShopDetailReviewsSection);