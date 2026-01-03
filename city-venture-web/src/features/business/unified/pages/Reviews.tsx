/**
 * Unified Reviews Page
 * Reviews management - shared across all business types
 * Dynamically fetches reviews based on business type
 */

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import NoDataFound from "@/src/components/NoDataFound";
import PageContainer from "@/src/components/PageContainer";
import { Box, Button, Grid, CircularProgress } from "@mui/joy";
import RatingsOverview from "@/src/components/feedback/RatingsOverview";
import StatCard from "@/src/components/feedback/StatCard";
import ReviewCard, { type Review } from "@/src/components/feedback/ReviewCard";
import Container from "@/src/components/Container";
import FilterListIcon from "@mui/icons-material/FilterList";
import ReplyIcon from "@mui/icons-material/Reply";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import { ListChecks, Star } from "lucide-react";
import DynamicTab from "@/src/components/ui/DynamicTab";
import FeedbackServices from "@/src/services/feedback/FeedbackServices";
import type { ReviewWithAuthor } from "@/src/types/Feedback";
import { useBusiness } from "@/src/context/BusinessContext";

// Helper function to transform API reviews to component format
const transformReview = (apiReview: ReviewWithAuthor): Review => {
  const fullName = apiReview.tourist
    ? `${apiReview.tourist.first_name} ${apiReview.tourist.middle_name || ""} ${apiReview.tourist.last_name}`.trim()
    : "Anonymous";

  return {
    id: apiReview.id,
    user: {
      name: fullName,
      avatar: apiReview.user?.user_profile,
      verified: false,
    },
    rating: apiReview.rating as 1 | 2 | 3 | 4 | 5,
    createdAt: apiReview.created_at,
    text: apiReview.message,
    images: apiReview.photos?.map((p) => p.photo_url) || [],
    reply: apiReview.replies?.[0]
      ? {
          text: apiReview.replies[0].message,
          updatedAt: apiReview.replies[0].updated_at || apiReview.replies[0].created_at,
        }
      : undefined,
  };
};

const Reviews: React.FC = () => {
  const { selectedBusinessId, businessDetails } = useBusiness();
  const [activeFilter, setActiveFilter] = useState<string | number>("All");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Determine business type for API call
  const businessType = useMemo(() => {
    if (!businessDetails) return "business";
    return businessDetails.hasBooking ? "accommodation" : "shop";
  }, [businessDetails]);

  // Fetch reviews from database
  useEffect(() => {
    const fetchReviews = async () => {
      if (!selectedBusinessId) {
        setError("No business ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const apiReviews = await FeedbackServices.getBusinessReviews(
          selectedBusinessId,
          businessType
        );
        const transformedReviews = apiReviews.map(transformReview);
        setReviews(transformedReviews);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [selectedBusinessId, businessType]);

  const tabs = [
    { id: "all", label: "All", icon: <ListChecks size={16} /> },
    { id: "1", label: "1", icon: <Star size={16} /> },
    { id: "2", label: "2", icon: <Star size={16} /> },
    { id: "3", label: "3", icon: <Star size={16} /> },
    { id: "4", label: "4", icon: <Star size={16} /> },
    { id: "5", label: "5", icon: <Star size={16} /> },
  ];

  const filtered = useMemo(
    () =>
      reviews.filter((r) =>
        !activeFilter || activeFilter === "All"
          ? true
          : r.rating === Number(activeFilter)
      ),
    [reviews, activeFilter]
  );

  const distribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
    reviews.forEach((r) => (counts[r.rating as 1 | 2 | 3 | 4 | 5] += 1));
    return counts;
  }, [reviews]);

  const handleSaveReply = async (reviewId: string, text: string) => {
    try {
      const responderId = "temp-owner-id"; // TODO: Get from auth context

      const review = reviews.find((r) => r.id === reviewId);
      if (review?.reply) {
        const replies = await FeedbackServices.getRepliesByReviewId(reviewId);
        if (replies.length > 0) {
          await FeedbackServices.updateReply(replies[0].id, { message: text });
        }
      } else {
        await FeedbackServices.createReply({
          review_and_rating_id: reviewId,
          message: text,
          responder_id: responderId,
        });
      }

      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, reply: { text, updatedAt: new Date().toISOString() } }
            : r
        )
      );
    } catch (err) {
      console.error("Error saving reply:", err);
      alert("Failed to save reply");
    }
  };

  const handleDeleteReply = async (reviewId: string) => {
    try {
      const replies = await FeedbackServices.getRepliesByReviewId(reviewId);
      if (replies.length > 0) {
        await FeedbackServices.deleteReply(replies[0].id);
      }
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, reply: undefined } : r))
      );
    } catch (err) {
      console.error("Error deleting reply:", err);
      alert("Failed to delete reply");
    }
  };

  const average = reviews.length
    ? parseFloat((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(2))
    : 0;

  const reviewsWithReplies = reviews.filter((r) => r.reply).length;
  const responseRate = reviews.length > 0 ? Math.round((reviewsWithReplies / reviews.length) * 100) : 0;
  const positiveReviews = reviews.filter((r) => r.rating >= 4).length;
  const negativeReviews = reviews.filter((r) => r.rating <= 2).length;

  return (
    <PageContainer style={{ padding: 16 }}>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
          <CircularProgress />
        </Box>
      )}

      {error && !loading && (
        <NoDataFound icon="database" title="Error Loading Reviews" message={error} />
      )}

      {!loading && !error && (
        <>
          <Grid container spacing={2}>
            <Grid xs={12} sm={6} md={6} lg={3} xl={3}>
              <RatingsOverview
                totalReviews={reviews.length}
                distribution={distribution}
                average={average}
              />
            </Grid>

            <Grid xs={12} sm={6} md={6} lg={3} xl={3}>
              <StatCard
                icon={<ReplyIcon sx={{ fontSize: 22 }} />}
                label="Response Rate"
                value={`${reviewsWithReplies}`}
                percentage={responseRate}
                color="primary"
                showProgress
                total={reviews.length}
              />
            </Grid>

            <Grid xs={12} sm={6} md={6} lg={3} xl={3}>
              <StatCard
                icon={<ThumbUpIcon sx={{ fontSize: 22 }} />}
                label="Positive Reviews"
                value={positiveReviews.toString()}
                percentage={reviews.length > 0 ? Math.round((positiveReviews / reviews.length) * 100) : 0}
                color="success"
                showProgress
                total={reviews.length}
              />
            </Grid>

            <Grid xs={12} sm={6} md={6} lg={3} xl={3}>
              <StatCard
                icon={<ThumbDownIcon sx={{ fontSize: 22 }} />}
                label="Negative Reviews"
                value={negativeReviews.toString()}
                percentage={reviews.length > 0 ? Math.round((negativeReviews / reviews.length) * 100) : 0}
                color="danger"
                showProgress
                total={reviews.length}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Container elevation={2} direction="row" justify="space-between" align="center">
              <DynamicTab
                padding={0}
                tabs={tabs}
                activeTabId={activeTab}
                onChange={(tabId) => {
                  setActiveTab(String(tabId));
                  setActiveFilter(
                    tabId === "1" ? 1 :
                    tabId === "2" ? 2 :
                    tabId === "3" ? 3 :
                    tabId === "4" ? 4 :
                    tabId === "5" ? 5 : "All"
                  );
                }}
              />
              <Button variant="outlined" startDecorator={<FilterListIcon fontSize="small" />}>
                Filter
              </Button>
            </Container>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {filtered.length === 0 && (
                <NoDataFound
                  icon="database"
                  title="No Reviews Yet"
                  message="Once customers start leaving feedback, you can view & respond here."
                />
              )}
              {filtered.map((rev) => (
                <ReviewCard
                  key={rev.id}
                  review={rev}
                  onSaveReply={(text: string) => handleSaveReply(rev.id, text)}
                  onDeleteReply={() => handleDeleteReply(rev.id)}
                />
              ))}
            </Box>
          </Box>
        </>
      )}
    </PageContainer>
  );
};

export default Reviews;

