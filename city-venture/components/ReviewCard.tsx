import Container from '@/components/Container';
import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';
import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

type Review = {
  id: string;
  user: {
    name: string;
    avatar?: string;
    isVerified?: boolean;
    role?: 'tourist' | 'owner';
    isCurrentUser?: boolean;
  };
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  likes: number;
  dislikes: number;
  youLiked?: boolean;
  youDisliked?: boolean;
  replies?: Array<{
    id: string;
    user: { name: string; role?: 'tourist' | 'owner' };
    comment: string;
    createdAt: string;
  }>;
};

type ReviewCardProps = {
  item: Review;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleLike: (type: 'like' | 'dislike') => void;
  canReply: boolean;
  onReply?: () => void;
  onShare?: () => void;
};

const ReviewCard = ({
  item,
  expanded,
  onToggleExpand,
  onToggleLike,
  canReply,
  onReply,
  onShare,
}: ReviewCardProps) => {
  const isLong = item.comment.length > 160;
  const displayComment = isLong && !expanded ? item.comment.slice(0, 160) + '…' : item.comment;

  return (
    <Container padding={14} gap={16}>
      <View style={styles.reviewHeader}>
        <View style={styles.avatarWrap}>
          {item.user.avatar ? (
            <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: '#4B5563' }]} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText type="body-medium" weight="semi-bold">
            {item.user.isCurrentUser ? 'You' : item.user.name}
          </ThemedText>
          <View style={styles.inline}>
            {item.user.isVerified && (
              <View style={styles.verifiedBadge}>
                <FontAwesome5 name="check" size={10} color="#fff" />
                <ThemedText
                  type="label-extra-small"
                  lightColor="#fff"
                  darkColor="#fff"
                  style={{ marginLeft: 4 }}
                >
                  Verified
                </ThemedText>
              </View>
            )}
            <ThemedText type="label-extra-small" style={{ marginLeft: 6 }}>
              {new Date(item.createdAt).toLocaleDateString()}
            </ThemedText>
          </View>
        </View>
        <View style={styles.inline}>
          <FontAwesome5 name="star" size={14} color="#FFC107" solid />
          <ThemedText type="label-small" style={{ marginLeft: 4 }}>
            {item.rating.toFixed(1)}
          </ThemedText>
        </View>
      </View>
      
      <ThemedText type="body-small">
        {displayComment}
      </ThemedText>
      
      {/* Review Images */}
      {item.images && item.images.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.imageScrollView}
          contentContainerStyle={styles.imageContainer}
        >
          {item.images.map((imageUri, index) => (
            <Pressable
              key={index}
              onPress={() => console.log('View full image:', imageUri)}
              style={styles.imageWrapper}
            >
              <Image 
                source={{ uri: imageUri }} 
                style={styles.reviewImage}
                resizeMode="cover"
              />
              {item.images!.length > 1 && index === 0 && (
                <View style={styles.imageCounter}>
                  <ThemedText type="label-extra-small" lightColor="#fff" darkColor="#fff">
                    +{item.images!.length - 1}
                  </ThemedText>
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>
      )}
      
      {isLong && (
        <Pressable style={styles.readMoreBtn} onPress={onToggleExpand}>
          <ThemedText type="link-small" weight="semi-bold">
            {expanded ? 'Show less' : 'Read more'}
          </ThemedText>
        </Pressable>
      )}
      
      {/* Actions */}
      <View style={[styles.inline, { gap: 16 }]}>
        <Pressable style={styles.actionBtn} onPress={() => onToggleLike('like')}>
          <FontAwesome5
            name="thumbs-up"
            size={14}
            color={item.youLiked ? colors.success : '#888'}
          />
          <ThemedText type="label-small" style={{ marginLeft: 6 }}>
            {item.likes}
          </ThemedText>
        </Pressable>
        
        <Pressable style={styles.actionBtn} onPress={() => onToggleLike('dislike')}>
          <FontAwesome5
            name="thumbs-down"
            size={14}
            color={item.youDisliked ? colors.error : '#888'}
          />
          <ThemedText type="label-small" style={{ marginLeft: 6 }}>
            {item.dislikes}
          </ThemedText>
        </Pressable>
        
        <Pressable style={styles.actionBtn} onPress={onShare}>
          <FontAwesome5 name="share" size={14} color={colors.primary} />
          <ThemedText type="label-small" style={{ marginLeft: 6 }}>
            Share
          </ThemedText>
        </Pressable>
        
        {canReply && (
          <Pressable style={styles.actionBtn} onPress={onReply}>
            <FontAwesome5 name="reply" size={14} color={colors.secondary} />
            <ThemedText type="label-small" style={{ marginLeft: 6 }}>
              Reply
            </ThemedText>
          </Pressable>
        )}
      </View>
      
      {/* Replies */}
      {!!item.replies?.length && (
        <View style={{ gap: 10 }}>
          {item.replies.map((rep) => (
            <View key={rep.id} style={styles.replyWrap}>
              <View style={styles.inline}>
                <FontAwesome5
                  name="level-down-alt"
                  size={12}
                  color={colors.secondary}
                />
                <ThemedText
                  type="label-small"
                  weight="semi-bold"
                  style={{ marginLeft: 6 }}
                >
                  {rep.user.name}
                </ThemedText>
                <ThemedText
                  type="label-extra-small"
                  style={{ marginLeft: 8 }}
                >
                  {new Date(rep.createdAt).toLocaleDateString()}
                </ThemedText>
              </View>
              <ThemedText type="body-small" style={{ marginTop: 4 }}>
                {rep.comment}
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </Container>
  );
};

export default ReviewCard;

const styles = StyleSheet.create({
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatarWrap: {
    marginRight: 4,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 50,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyWrap: {
    marginLeft: 16,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: colors.secondary,
  },
  readMoreBtn: {
    alignSelf: 'flex-start',
  },
  imageScrollView: {
    marginVertical: 8,
  },
  imageContainer: {
    gap: 8,
  },
  imageWrapper: {
    position: 'relative',
  },
  reviewImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});