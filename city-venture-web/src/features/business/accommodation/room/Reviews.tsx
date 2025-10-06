import * as React from "react";
import PageContainer from "@/src/components/PageContainer";
import { Box, Typography, Sheet, Button } from "@mui/joy";
import RatingsOverview from "./components/RatingsOverview";
import StatCard from "./components/StatCard";
import ReviewFilterTabs from "./components/ReviewFilterTabs";
import type { ReviewFilterValue } from "./components/ReviewFilterTabs";
import ReviewCard, { type Review } from "./components/ReviewCard";
import Container from "@/src/components/Container";
import FilterListIcon from "@mui/icons-material/FilterList";
import ReplyIcon from "@mui/icons-material/Reply";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
// Mock reviews (would be fetched via API)
// Added likes & dislikes counts for unified tourist/business style action bar
const mockReviews: Review[] = [
  {
    id: "r1",
    user: {
      name: "Alicia Mendoza",
      avatar: "https://i.pravatar.cc/120?img=32",
      verified: true,
    },
    rating: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    text: "Absolutely loved our stay! Rooms were clean and the staff was incredibly friendly. Will definitely come back during the festival week!",
    images: ["https://picsum.photos/seed/rev1/640/400"],
    liked: true,
    likes: 12,
    dislikes: 0,
    reply: {
      text: "Thank you so much Alicia! We’re thrilled you enjoyed your stay — hope to host you again soon.",
      updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
  },
  {
    id: "r2",
    user: {
      name: "Brian Cruz",
      avatar: "https://i.pravatar.cc/120?img=15",
      verified: false,
    },
    rating: 4,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    text: "Great location and welcoming staff. The Wi‑Fi was a bit spotty late at night but overall experience was solid.",
    images: [],
    liked: false,
    likes: 3,
    dislikes: 1,
  },
  {
    id: "r3",
    user: {
      name: "Chen Li",
      avatar: "https://i.pravatar.cc/120?img=54",
      verified: true,
    },
    rating: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    text: "Rooms were okay, but there was noise from the street. Staff tried to accommodate with a room change the next day.",
    images: [
      "https://picsum.photos/seed/rev3/400/260",
      "https://picsum.photos/seed/rev33/400/260",
    ],
    liked: false,
    likes: 0,
    dislikes: 2,
  },
];

const Reviews: React.FC = () => {
  const [activeFilter, setActiveFilter] =
    React.useState<ReviewFilterValue | null>("All");
  const [reviews, setReviews] = React.useState<Review[]>(mockReviews);

  const filtered = React.useMemo(
    () =>
      reviews.filter((r) =>
        !activeFilter || activeFilter === "All"
          ? true
          : r.rating === activeFilter
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

  const handleToggleLike = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, liked: !r.liked } : r))
    );
  };

  const handleSaveReply = (id: string, text: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              reply: { text, updatedAt: new Date().toISOString() },
            }
          : r
      )
    );
  };

  const handleDeleteReply = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, reply: undefined } : r))
    );
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
    <PageContainer style={{ padding: 0 }}>
      {/* Unified layout: Overview card spans top, filters below, list follows */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Container direction="row" padding="0">
          <RatingsOverview
            totalReviews={reviews.length}
            distribution={distribution}
            average={average}
          />
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
        </Container>

        <Container
          elevation={2}
          direction="row"
          justify="space-between"
          align="center"
        >
          <ReviewFilterTabs
            active={activeFilter}
            counts={distribution}
            onChange={setActiveFilter}
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
            <Sheet
              variant="soft"
              color="neutral"
              sx={{ p: 4, borderRadius: 12, textAlign: "center" }}
            >
              <Typography level="h4" sx={{ mb: 1 }}>
                No reviews yet
              </Typography>
              <Typography level="body-sm" sx={{ opacity: 0.8 }}>
                Once guests start leaving feedback, you can view & respond here.
              </Typography>
            </Sheet>
          )}
          {filtered.map((rev) => (
            <ReviewCard
              key={rev.id}
              review={rev}
              onToggleLike={() => handleToggleLike(rev.id)}
              onSaveReply={(text: string) => handleSaveReply(rev.id, text)}
              onDeleteReply={() => handleDeleteReply(rev.id)}
            />
          ))}
        </Box>
      </Box>
    </PageContainer>
  );
};

export default Reviews;
