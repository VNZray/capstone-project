import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import Typography from "@mui/joy/Typography";
import Chip from "@mui/joy/Chip";
import LinearProgress from "@mui/joy/LinearProgress";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
import Input from "@mui/joy/Input";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import PageContainer from "@/src/components/PageContainer";

const ratingData = [
  { stars: 5, count: 856, percent: 69 },
  { stars: 4, count: 248, percent: 20 },
  { stars: 3, count: 87, percent: 7 },
  { stars: 2, count: 31, percent: 2 },
  { stars: 1, count: 25, percent: 2 },
];

const Reviews = () => {
  return (
    <PageContainer>
      {/* Summary Cards */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Card
          variant="outlined"
          sx={{ flex: 1, p: 2, alignItems: "center", display: "flex", gap: 2 }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
            }}
          >
            <Chip
              color="warning"
              variant="soft"
              sx={{ mb: 1, fontSize: 24, p: 1.5 }}
            >
              ★
            </Chip>
            <Typography level="h2">4.8</Typography>
            <Typography level="body-sm" sx={{ color: "neutral.600" }}>
              Overall Rating
            </Typography>
            <Typography level="body-xs" sx={{ color: "neutral.500" }}>
              Based on 1,247 reviews
            </Typography>
            <Typography level="body-xs" sx={{ color: "success.500", mt: 0.5 }}>
              +0.3 from last month
            </Typography>
          </Box>
        </Card>
        <Card
          variant="outlined"
          sx={{ flex: 1, p: 2, alignItems: "center", display: "flex", gap: 2 }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
            }}
          >
            <Chip
              color="primary"
              variant="soft"
              sx={{ mb: 1, fontSize: 24, p: 1.5 }}
            >
              💬
            </Chip>
            <Typography level="h2">1,247</Typography>
            <Typography level="body-sm" sx={{ color: "neutral.600" }}>
              Total Reviews
            </Typography>
            <Typography level="body-xs" sx={{ color: "neutral.500" }}>
              All time reviews
            </Typography>
            <Typography level="body-xs" sx={{ color: "success.500", mt: 0.5 }}>
              +42 this month
            </Typography>
          </Box>
        </Card>
        <Card
          variant="outlined"
          sx={{ flex: 1, p: 2, alignItems: "center", display: "flex", gap: 2 }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
            }}
          >
            <Chip
              color="success"
              variant="soft"
              sx={{ mb: 1, fontSize: 24, p: 1.5 }}
            >
              ↩
            </Chip>
            <Typography level="h2">94%</Typography>
            <Typography level="body-sm" sx={{ color: "neutral.600" }}>
              Response Rate
            </Typography>
            <Typography level="body-xs" sx={{ color: "neutral.500" }}>
              Average response time
            </Typography>
            <Typography level="body-xs" sx={{ color: "primary.500", mt: 0.5 }}>
              2.3 hours
            </Typography>
          </Box>
        </Card>
        <Card
          variant="outlined"
          sx={{ flex: 1, p: 2, alignItems: "center", display: "flex", gap: 2 }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
            }}
          >
            <Chip
              color="success"
              variant="soft"
              sx={{ mb: 1, fontSize: 24, p: 1.5 }}
            >
              👍
            </Chip>
            <Typography level="h2">89%</Typography>
            <Typography level="body-sm" sx={{ color: "neutral.600" }}>
              Positive Reviews
            </Typography>
            <Typography level="body-xs" sx={{ color: "neutral.500" }}>
              4-5 star ratings
            </Typography>
            <Typography level="body-xs" sx={{ color: "success.500", mt: 0.5 }}>
              +5% improvement
            </Typography>
          </Box>
        </Card>
      </Box>

      {/* Rating Breakdown */}
      <Card variant="soft" sx={{ p: 3, mb: 3 }}>
        <Typography level="h3" sx={{ mb: 2 }}>
          Rating Breakdown
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {ratingData.map((r) => (
            <Box
              key={r.stars}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Chip
                color="warning"
                variant="soft"
                sx={{ fontSize: 18, px: 1.2 }}
              >
                ★
              </Chip>
              <Typography level="body-md" sx={{ width: 24 }}>
                {r.stars}
              </Typography>
              <Box sx={{ flex: 1, mx: 1 }}>
                <LinearProgress
                  determinate
                  value={r.percent}
                  color="warning"
                  sx={{ height: 8, borderRadius: 6, bgcolor: "neutral.200" }}
                />
              </Box>
              <Typography
                level="body-md"
                sx={{ width: 40, textAlign: "right" }}
              >
                {r.count}
              </Typography>
              <Typography
                level="body-md"
                sx={{ width: 40, textAlign: "right", color: "neutral.500" }}
              >
                {r.percent}%
              </Typography>
            </Box>
          ))}
        </Box>
      </Card>

      {/* Filter Tabs, Search, Sort */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Tabs
          defaultValue={0}
          sx={{ bgcolor: "transparent", p: 0, minHeight: 0 }}
        >
          <TabList>
            <Tab value={0} variant="solid" color="primary">
              All Reviews (1247)
            </Tab>
            <Tab value={1} variant="plain">
              Needs Reply (23)
            </Tab>
            <Tab value={2} variant="plain">
              5 Stars (856)
            </Tab>
            <Tab value={3} variant="plain">
              4 Stars (248)
            </Tab>
            <Tab value={4} variant="plain">
              3 Stars (87)
            </Tab>
            <Tab value={5} variant="plain">
              1-2 Stars (56)
            </Tab>
          </TabList>
        </Tabs>
        <Input placeholder="Search reviews..." sx={{ width: 240 }} />
        <Select defaultValue="newest" sx={{ width: 160 }}>
          <Option value="newest">Newest First</Option>
          <Option value="oldest">Oldest First</Option>
          <Option value="highest">Highest Rated</Option>
          <Option value="lowest">Lowest Rated</Option>
        </Select>
      </Box>

      {/* ...existing code for review list can go here... */}
    </PageContainer>
  );
};

export default Reviews;
