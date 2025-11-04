import Container from '@/components/Container';
import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';
import { moderateScale } from '@/utils/responsive';
import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

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
  canReply: boolean;
  onReply?: () => void;
  canDelete?: boolean;
  onDelete?: () => void;
};

const ReviewCard = ({
  item,
  expanded,
  onToggleExpand,
  canReply,
  onReply,
  canDelete,
  onDelete,
}: ReviewCardProps) => {
  const commentStr = item.comment ?? '';
  const isLong = commentStr.length > 160;
  const displayComment = isLong && !expanded ? commentStr.slice(0, 160) + '…' : commentStr;
  const { width } = useWindowDimensions();
  const AVATAR = moderateScale(42, 0.55, width);
  const GAP = moderateScale(12, 0.55, width);
  const IMAGE_W = moderateScale(120, 0.5, width);
  const IMAGE_H = moderateScale(80, 0.5, width);
  const ratingNum = Number.isFinite((item as any)?.rating)
    ? Number((item as any).rating)
    : 0;

  return (
    <Container padding={moderateScale(14, 0.55, width)} gap={GAP}>
      <View style={[styles.reviewHeader, { gap: GAP }]}>
        <View style={[styles.avatarWrap]}>
          {item.user.avatar ? (
            <Image
              source={{ uri: item.user.avatar }}
              style={{ width: AVATAR, height: AVATAR, borderRadius: 50 }}
            />
          ) : (
            <View
              style={{
                width: AVATAR,
                height: AVATAR,
                borderRadius: 50,
                backgroundColor: '#4B5563',
              }}
            />
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
            {ratingNum.toFixed(1)}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="body-small">{displayComment}</ThemedText>

      {/* Review Images */}
      {item.images && item.images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imageScrollView}
          contentContainerStyle={[
            styles.imageContainer,
            { gap: moderateScale(8, 0.5, width) },
          ]}
        >
          {item.images.map((imageUri, index) => (
            <Pressable
              key={imageUri || String(index)}
              onPress={() => console.log('View full image:', imageUri)}
              style={styles.imageWrapper}
            >
              <Image
                source={{ uri: imageUri }}
                style={{
                  width: IMAGE_W,
                  height: IMAGE_H,
                  borderRadius: moderateScale(8, 0.5, width),
                }}
                resizeMode="cover"
              />
              {item.images!.length > 1 && index === 0 && (
                <View style={styles.imageCounter}>
                  <ThemedText
                    type="label-extra-small"
                    lightColor="#fff"
                    darkColor="#fff"
                  >
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
      {(canReply || canDelete) && (
        <View style={[styles.inline, { gap: 16 }]}>
          {canReply && (
            <Pressable style={styles.actionBtn} onPress={onReply}>
              <FontAwesome5 name="reply" size={14} color={colors.secondary} />
              <ThemedText type="label-small" style={{ marginLeft: 6 }}>
                Reply
              </ThemedText>
            </Pressable>
          )}
          {canDelete && (
            <Pressable style={styles.actionBtn} onPress={onDelete}>
              <FontAwesome5 name="trash" size={14} color={colors.error || '#EF4444'} />
              <ThemedText type="label-small" style={{ marginLeft: 6 }}>
                Delete
              </ThemedText>
            </Pressable>
          )}
        </View>
      )}

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
                <ThemedText type="label-extra-small" style={{ marginLeft: 8 }}>
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
