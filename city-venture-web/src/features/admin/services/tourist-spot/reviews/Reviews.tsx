import * as React from "react";
import { useParams } from "react-router-dom";
import PageContainer from "@/src/components/PageContainer";
import NoDataFound from "@/src/components/NoDataFound";
import Container from "@/src/components/Container";
import { Box, Button, Grid, CircularProgress } from "@mui/joy";
import FilterListIcon from "@mui/icons-material/FilterList";
import ReplyIcon from "@mui/icons-material/Reply";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import RatingsOverview from "@/src/components/feedback/RatingsOverview";
import StatCard from "@/src/components/feedback/StatCard";
import ReviewCard, { type Review } from "@/src/components/feedback/ReviewCard";
import DynamicTab from "@/src/components/ui/DynamicTab";
import { ListChecks, Star } from "lucide-react";
import FeedbackServices from "@/src/services/feedback/FeedbackServices";
import { useTouristSpot } from "@/src/context/TouristSpotContext";

const transformReview = (apiReview: any): Review => {
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
    text: apiReview.message || "",
    images: apiReview.photos?.map((p: any) => p.photo_url) || [],
    reply: apiReview.replies?.[0]
      ? {
          text: apiReview.replies[0].message,
          updatedAt: apiReview.replies[0].updated_at || apiReview.replies[0].created_at,
        }
      : undefined,
  };
};

const TouristSpotReviews: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { selectedTouristSpotId } = useTouristSpot();
  const spotId = selectedTouristSpotId || id;
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState("all");

  React.useEffect(() => {
    const fetchReviews = async () => {
      if (!spotId) {
        setError("No tourist spot ID provided");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const apiReviews = await FeedbackServices.getReviewsByTypeAndEntityId("tourist_spot", spotId);
        const transformed = apiReviews.map(transformReview);
        setReviews(transformed);
      } catch (err) {
        console.error("Error fetching tourist spot reviews:", err);
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

  const activeFilter = React.useMemo(() => {
    if (["1","2","3","4","5"].includes(activeTab)) return Number(activeTab);
    return "All";
  }, [activeTab]);

  const filtered = React.useMemo(
    () => reviews.filter((r) => (activeFilter === "All" ? true : r.rating === Number(activeFilter))),
    [reviews, activeFilter]
  );

  const distribution = React.useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<1|2|3|4|5, number>;
    reviews.forEach((r) => { counts[r.rating] += 1; });
    return counts;
  }, [reviews]);

  const average = reviews.length
    ? parseFloat((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(2))
    : 0;

  const reviewsWithReplies = reviews.filter((r) => r.reply).length;
  const responseRate = reviews.length > 0 ? Math.round((reviewsWithReplies / reviews.length) * 100) : 0;
  const positiveReviews = reviews.filter((r) => r.rating >= 4).length;
  const negativeReviews = reviews.filter((r) => r.rating <= 2).length;

  const handleSaveReply = async (reviewId: string, text: string) => {
    try {
      const replies = await FeedbackServices.getRepliesByReviewId(reviewId);
      if (replies.length > 0) {
        await FeedbackServices.updateReply(replies[0].id, { message: text });
      } else {
        await FeedbackServices.createReply({ review_and_rating_id: reviewId, message: text, responder_id: "tourism-admin" });
      }
      setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, reply: { text, updatedAt: new Date().toISOString() } } : r));
    } catch (err) {
      console.error("Error saving reply:", err);
      alert("Failed to save reply");
    }
  };

  const handleDeleteReply = async (reviewId: string) => {
    try {
      const replies = await FeedbackServices.getRepliesByReviewId(reviewId);
      if (replies.length > 0) await FeedbackServices.deleteReply(replies[0].id);
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, reply: undefined } : r)));
    } catch (err) {
      console.error("Error deleting reply:", err);
      alert("Failed to delete reply");
    }
  };

  return (
    <PageContainer style={{ padding: 16 }}>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
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
              <RatingsOverview totalReviews={reviews.length} distribution={distribution} average={average} />
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
                percentage={reviews.length ? Math.round((positiveReviews / reviews.length) * 100) : 0}
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
                percentage={reviews.length ? Math.round((negativeReviews / reviews.length) * 100) : 0}
                color="danger"
                showProgress
                total={reviews.length}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Container elevation={2} direction="row" justify="space-between" align="center">
              <DynamicTab
                padding={0}
                tabs={tabs}
                activeTabId={activeTab}
                onChange={(tabId) => setActiveTab(String(tabId))}
              />
              <Button variant="outlined" startDecorator={<FilterListIcon fontSize="small" />}>Filter</Button>
            </Container>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filtered.length === 0 && (
                <NoDataFound icon="database" title="No Reviews Yet" message="Once guests start leaving feedback, you can view & respond here." />
              )}
              {filtered.map((rev, idx) => (
                <ReviewCard
                  key={rev.id || idx}
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

export default TouristSpotReviews;
