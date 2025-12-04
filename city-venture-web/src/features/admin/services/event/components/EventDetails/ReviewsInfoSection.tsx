import React, { useState, useEffect } from "react";
import {
  Stack,
  Typography,
  Sheet,
  Chip,
  Avatar,
  IconButton,
  CircularProgress,
  Box,
  Divider,
  Select,
  Option,
} from "@mui/joy";
import {
  Star,
  ThumbsUp,
  Flag,
  Trash2,
  CheckCircle,
  XCircle,
  MessageSquare,
} from "lucide-react";
import Button from "@/src/components/Button";
import { apiService } from "@/src/utils/api";
import type { EventReview, ReviewStatus } from "@/src/types/Event";

interface ReviewsInfoSectionProps {
  eventId: string;
  onReviewsChange?: () => void;
}

const statusColors: Record<ReviewStatus, "success" | "warning" | "danger" | "neutral"> = {
  pending: "warning",
  approved: "success",
  flagged: "danger",
  hidden: "neutral",
};

const ReviewsInfoSection: React.FC<ReviewsInfoSectionProps> = ({
  eventId,
  onReviewsChange,
}) => {
  const [reviews, setReviews] = useState<EventReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== "all" ? { status: statusFilter } : undefined;
      const data = await apiService.getEventReviews(eventId, params);
      setReviews(data);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [eventId, statusFilter]);

  const handleUpdateStatus = async (reviewId: string, status: ReviewStatus) => {
    try {
      setActionLoading(reviewId);
      await apiService.updateEventReview(reviewId, { status });
      await loadReviews();
      onReviewsChange?.();
    } catch (error) {
      console.error("Failed to update review status:", error);
      alert("Failed to update review status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      setActionLoading(reviewId);
      await apiService.deleteEventReview(reviewId);
      await loadReviews();
      onReviewsChange?.();
    } catch (error) {
      console.error("Failed to delete review:", error);
      alert("Failed to delete review");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return (
      <Stack direction="row" spacing={0.25}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            fill={star <= rating ? "#fbbf24" : "transparent"}
            color={star <= rating ? "#fbbf24" : "#d1d5db"}
          />
        ))}
      </Stack>
    );
  };

  const getReviewerName = (review: EventReview) => {
    if (review.user_first_name || review.user_last_name) {
      return `${review.user_first_name || ""} ${review.user_last_name || ""}`.trim();
    }
    return review.user_email || "Anonymous";
  };

  const getInitials = (review: EventReview) => {
    const name = getReviewerName(review);
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Sheet sx={{ p: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography
            fontFamily="poppins"
            level="title-lg"
            fontWeight={700}
            sx={{ color: "#1e293b" }}
          >
            Reviews
          </Typography>
          <Chip size="sm" variant="soft" color="neutral">
            {reviews.length}
          </Chip>
        </Stack>

        <Select
          size="sm"
          value={statusFilter}
          onChange={(_, value) => setStatusFilter(value || "all")}
          sx={{ minWidth: 120 }}
        >
          <Option value="all">All</Option>
          <Option value="pending">Pending</Option>
          <Option value="approved">Approved</Option>
          <Option value="flagged">Flagged</Option>
          <Option value="hidden">Hidden</Option>
        </Select>
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size="sm" />
        </Box>
      ) : reviews.length === 0 ? (
        <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
          <MessageSquare size={32} color="#9ca3af" />
          <Typography level="body-md" sx={{ color: "text.tertiary" }}>
            No reviews yet
          </Typography>
        </Stack>
      ) : (
        <Stack spacing={2} divider={<Divider />}>
          {reviews.map((review) => (
            <Box key={review.id}>
              <Stack direction="row" spacing={2}>
                <Avatar size="sm" sx={{ bgcolor: "primary.500" }}>
                  {getInitials(review)}
                </Avatar>

                <Stack spacing={0.5} flex={1}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Stack spacing={0.25}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography level="body-sm" fontWeight={600}>
                          {getReviewerName(review)}
                        </Typography>
                        {review.is_verified_attendee && (
                          <Chip
                            size="sm"
                            variant="soft"
                            color="success"
                            startDecorator={<CheckCircle size={10} />}
                          >
                            Verified
                          </Chip>
                        )}
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {renderStars(review.rating)}
                        <Typography level="body-xs" sx={{ color: "#9ca3af" }}>
                          {formatDate(review.created_at)}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Chip
                      size="sm"
                      variant="soft"
                      color={statusColors[review.status]}
                    >
                      {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                    </Chip>
                  </Stack>

                  {review.review_text && (
                    <Typography level="body-sm" sx={{ color: "#374151", mt: 0.5 }}>
                      {review.review_text}
                    </Typography>
                  )}

                  {/* Review Photos */}
                  {review.photos && review.photos.length > 0 && (
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      {review.photos.map((photo) => (
                        <Box
                          key={photo.id}
                          component="img"
                          src={photo.file_url}
                          alt="Review photo"
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: "8px",
                            objectFit: "cover",
                          }}
                        />
                      ))}
                    </Stack>
                  )}

                  {/* Action Buttons */}
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {review.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="soft"
                          colorScheme="success"
                          startDecorator={<CheckCircle size={14} />}
                          onClick={() => handleUpdateStatus(review.id, "approved")}
                          loading={actionLoading === review.id}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="soft"
                          colorScheme="error"
                          startDecorator={<XCircle size={14} />}
                          onClick={() => handleUpdateStatus(review.id, "hidden")}
                          loading={actionLoading === review.id}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {review.status === "approved" && (
                      <Button
                        size="sm"
                        variant="soft"
                        colorScheme="warning"
                        startDecorator={<Flag size={14} />}
                        onClick={() => handleUpdateStatus(review.id, "flagged")}
                        loading={actionLoading === review.id}
                      >
                        Flag
                      </Button>
                    )}

                    {(review.status === "flagged" || review.status === "hidden") && (
                      <Button
                        size="sm"
                        variant="soft"
                        colorScheme="success"
                        startDecorator={<CheckCircle size={14} />}
                        onClick={() => handleUpdateStatus(review.id, "approved")}
                        loading={actionLoading === review.id}
                      >
                        Restore
                      </Button>
                    )}

                    <IconButton
                      size="sm"
                      variant="plain"
                      color="danger"
                      onClick={() => handleDeleteReview(review.id)}
                      disabled={actionLoading === review.id}
                    >
                      <Trash2 size={14} />
                    </IconButton>

                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      sx={{ ml: "auto" }}
                    >
                      <ThumbsUp size={12} color="#9ca3af" />
                      <Typography level="body-xs" sx={{ color: "#9ca3af" }}>
                        {review.helpful_count || 0}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Sheet>
  );
};

export default ReviewsInfoSection;
