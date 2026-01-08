import * as React from "react";
import { useParams } from "react-router-dom";
import NoDataFound from "@/src/components/NoDataFound";
import PageContainer from "@/src/components/PageContainer";
import { Box, Button, Grid, CircularProgress } from "@mui/joy";
import RatingsOverview from "@/src/components/feedback/RatingsOverview";
import StatCard from "@/src/components/feedback/StatCard";
import ReviewCard, {
  type Review,
} from "@/src/components/feedback/ReviewCard";
import Container from "@/src/components/Container";
import FilterListIcon from "@mui/icons-material/FilterList";
import ReplyIcon from "@mui/icons-material/Reply";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import { useState, useEffect } from "react";
import { ListChecks, Star } from "lucide-react";
import DynamicTab from "@/src/components/ui/DynamicTab";
import FeedbackServices from "@/src/services/feedback/FeedbackServices";
import type { ReviewWithAuthor } from "@/src/types/Feedback";
import { useTouristSpot } from "@/src/context/TouristSpotContext";
import { useAuth } from "@/src/context/AuthContext";

// Helper function to transform API reviews to component format
const transformReview = (apiReview: ReviewWithAuthor): Review => {
  const fullName = apiReview.tourist
    ? `${apiReview.tourist.first_name} ${apiReview.tourist.middle_name || ""} ${
        apiReview.tourist.last_name
      }`.trim()
    : "Anonymous";

  return {
    id: apiReview.id,
    user: {
      name: fullName,
      avatar: apiReview.user?.user_profile,
      verified: false, // TODO: Add check-in verification logic
    },
    rating: apiReview.rating as 1 | 2 | 3 | 4 | 5,
    createdAt: apiReview.created_at,
    text: apiReview.message,
    images: apiReview.photos?.map((p) => p.photo_url) || [],
    reply: apiReview.replies?.[0]
      ? {
          id: apiReview.replies[0].id,
          text: apiReview.replies[0].message,
          updatedAt:
            apiReview.replies[0].updated_at || apiReview.replies[0].created_at,
        }
      : undefined,
  };
};

const TouristSpotReviews: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { selectedTouristSpotId } = useTouristSpot();
  const { user } = useAuth();
  const spotId = selectedTouristSpotId || id;
  
  const [activeFilter, setActiveFilter] = React.useState<string | number>(
    "All"
  );
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch reviews from database
  useEffect(() => {
    const fetchReviews = async () => {
      if (!spotId) {
        setError("No tourist spot ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const apiReviews = await FeedbackServices.getEnrichedReviews(
          spotId,
          "tourist_spot"
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
  }, [spotId]);

  const tabs = [
    { id: "all", label: "All", icon: <ListChecks size={16} /> },
    { id: "1", label: "1", icon: <Star size={16} /> },
    { id: "2", label: "2", icon: <Star size={16} /> },
    { id: "3", label: "3", icon: <Star size={16} /> },
    { id: "4", label: "4", icon: <Star size={16} /> },
    { id: "5", label: "5", icon: <Star size={16} /> },
  ];

  const filtered = React.useMemo(
    () =>
      reviews.filter((r) =>
        !activeFilter || activeFilter === "All"
          ? true
          : r.rating === Number(activeFilter)
      ),
    [reviews, activeFilter]
  );

  const distribution = React.useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<
      1 | 2 | 3 | 4 | 5,
      number
    >;
    reviews.forEach((r) => (counts[r.rating as 1 | 2 | 3 | 4 | 5] += 1));
    return counts;
  }, [reviews]);

  const handleSaveReply = async (reviewId: string, text: string) => {
    try {
      const responderId = user?.id;
      if (!responderId) {
        alert("You must be logged in to reply.");
        return;
      }

      // Check if reply already exists
      const review = reviews.find((r) => r.id === reviewId);
      if (review?.reply?.id) {
        // Update existing reply
        await FeedbackServices.updateReply(review.reply.id, { message: text });
        
        // Update local state
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId && r.reply
              ? {
                  ...r,
                  reply: { ...r.reply, text, updatedAt: new Date().toISOString() },
                }
              : r
          )
        );
      } else {
        // Create new reply
        const newReply = await FeedbackServices.createReply({
          review_and_rating_id: reviewId,
          message: text,
          responder_id: responderId,
        });

        // Update local state
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  reply: { 
                    id: newReply.id,
                    text: newReply.message, 
                    updatedAt: newReply.created_at 
                  },
                }
              : r
          )
        );
      }
    } catch (err) {
      console.error("Error saving reply:", err);
      alert("Failed to save reply");
    }
  };

  const handleDeleteReply = async (reviewId: string) => {
    try {
      const review = reviews.find((r) => r.id === reviewId);
      if (review?.reply?.id) {
        await FeedbackServices.deleteReply(review.reply.id);
        
        // Update local state
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, reply: undefined } : r))
        );
      }
    } catch (err) {
      console.error("Error deleting reply:", err);
      alert("Failed to delete reply");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    
    try {
      await FeedbackServices.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      console.error("Error deleting review:", err);
      alert("Failed to delete review");
    }
  };

  const average = reviews.length
    ? parseFloat(
        (
          reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        ).toFixed(2)
      )
    : 0;

  // Calculate statistics
  const reviewsWithReplies = reviews.filter((r) => r.reply).length;
  const responseRate =
    reviews.length > 0
      ? Math.round((reviewsWithReplies / reviews.length) * 100)
      : 0;
  const positiveReviews = reviews.filter((r) => r.rating >= 4).length;
  const negativeReviews = reviews.filter((r) => r.rating <= 2).length;

  return (
    <PageContainer style={{ padding: 16 }}>
      {/* Loading State */}
      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 400,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && !loading && (
        <NoDataFound
          icon="database"
          title="Error Loading Reviews"
          message={error}
        />
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Unified layout: Overview card spans top, filters below, list follows */}
          <Grid container spacing={2}>
            <Grid xs={12} sm={6} md={6} lg={3} xl={3}>
              <RatingsOverview
                totalReviews={reviews.length}
                distribution={distribution}
                average={average}
              />
            </Grid>

            <Grid xs={12} sm={6} md={6} lg={3} xl={3}>
              {" "}
              {/* Statistics Cards */}
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
              {" "}
              <StatCard
                icon={<ThumbUpIcon sx={{ fontSize: 22 }} />}
                label="Positive Reviews"
                value={positiveReviews.toString()}
                percentage={
                  reviews.length > 0
                    ? Math.round((positiveReviews / reviews.length) * 100)
                    : 0
                }
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
                percentage={
                  reviews.length > 0
                    ? Math.round((negativeReviews / reviews.length) * 100)
                    : 0
                }
                color="danger"
                showProgress
                total={reviews.length}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Container
              elevation={2}
              direction="row"
              justify="space-between"
              align="center"
            >
              {/* Tabs */}
              <DynamicTab
                padding={0}
                tabs={tabs}
                activeTabId={activeTab}
                onChange={(tabId) => {
                  setActiveTab(String(tabId));
                  setActiveFilter(
                    tabId === "1"
                      ? 1
                      : tabId === "2"
                      ? 2
                      : tabId === "3"
                      ? 3
                      : tabId === "4"
                      ? 4
                      : tabId === "5"
                      ? 5
                      : "All"
                  );
                }}
              />

              <Button
                variant="outlined"
                startDecorator={<FilterListIcon fontSize="small" />}
              >
                Filter
              </Button>
            </Container>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {filtered.length === 0 && (
                <NoDataFound
                  icon="database"
                  title="No Reviews Yet"
                  message="Once guests start leaving feedback, you can view & respond here."
                />
              )}
              {filtered.map((rev) => (
                <ReviewCard
                  key={rev.id}
                  review={rev}
                  onSaveReply={(text: string) => handleSaveReply(rev.id, text)}
                  onDeleteReply={() => handleDeleteReply(rev.id)}
                  onDeleteReview={() => handleDeleteReview(rev.id)}
                />
              ))}
            </Box>
          </Box>
        </>
      )}
    </PageContainer>
  );
};

export default TouristSpotReviews;