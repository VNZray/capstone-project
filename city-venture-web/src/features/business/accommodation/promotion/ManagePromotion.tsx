import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
// Removed unused import 'Text'
import NoDataFound from "@/src/components/NoDataFound";
import { Add } from "@mui/icons-material";
import { Button, Input } from "@mui/joy";
import { Search } from "lucide-react";
import StatusFilter from "./components/StatusFilter";
import PromoCard from "./components/PromoCard";
import type { PromoStatus } from "./components/PromoCard";
// import AddPromoModal from "./components/AddPromoModal"; // disabled: use full Promotion Form page instead
import { useMemo, useState } from "react";
import ResponsiveText from "@/src/components/ResponsiveText";
import { useNavigate } from "react-router-dom";

type Status = "All" | "Active" | "Paused" | "Expired";

interface StaticPromo {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  promoCode?: string;
  promoType: "DISCOUNT" | "CODE" | "BOGO" | "FREE_TRIAL";
  discountValue?: number;
  status: PromoStatus; // internal mapping (Active -> ACTIVE etc.)
  image?: string;
  usageLimit?: number;
  usedCount?: number;
  appliesToAll?: boolean;
  roomIds?: string[];
}

// Initial mock data (converted to state on mount)
const initialPromos: StaticPromo[] = [
  {
    id: "promo_1",
    title: "Summer Splash 20% Off",
    description: "Enjoy 20% off on all deluxe rooms booked before June ends.",
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
    promoType: "DISCOUNT",
    discountValue: 20,
    status: "ACTIVE",
    image: "https://picsum.photos/seed/promo1/640/360",
    usageLimit: 500,
    usedCount: 120,
    appliesToAll: true,
  },
  {
    id: "promo_2",
    title: "Weekend FLASH CODE",
    description: "Use code WEEKND50 to get ₱500 off on stays over ₱3000.",
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    promoType: "CODE",
    promoCode: "WEEKND50",
    status: "SCHEDULED",
    image: "https://picsum.photos/seed/promo2/640/360",
    usageLimit: 300,
    usedCount: 0,
    appliesToAll: false,
    roomIds: ["room_1", "room_3", "room_4"],
  },
  {
    id: "promo_3",
    title: "Stay 2 Nights Get 1",
    description: "BOGO special for extended bookings (Sun-Thu).",
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    promoType: "BOGO",
    status: "EXPIRED",
    image: "https://picsum.photos/seed/promo3/640/360",
    usageLimit: 200,
    usedCount: 180,
    appliesToAll: false,
    roomIds: ["room_2"],
  },
  {
    id: "promo_4",
    title: "Trial Access Lounge",
    description:
      "Get free trial access to premium lounge for first-time guests.",
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    promoType: "FREE_TRIAL",
    status: "PAUSED", // demonstration of paused
    image: "https://picsum.photos/seed/promo4/640/360",
    usageLimit: 100,
    usedCount: 100,
    appliesToAll: true,
  },
];

const ManagePromotion = () => {
  const [status, setStatus] = useState<Status>("All");
  const [query, setQuery] = useState("");
  const [promos] = useState<StaticPromo[]>(initialPromos);
  const navigate = useNavigate();

  // const [addOpen, setAddOpen] = useState(false);
  // const handlePromoAdded = () => {
  //   // For demonstration append a synthetic promo (would replace with API response)
  //   setPromos((prev) => [
  //     {
  //       id: `promo_${Date.now()}`,
  //       title: "New Promotion",
  //       description: "Recently added promotion placeholder.",
  //       startDate: new Date().toISOString().slice(0,10),
  //       endDate: new Date(Date.now()+ 1000*60*60*24*7).toISOString().slice(0,10),
  //       promoType: "DISCOUNT",
  //       discountValue: 10,
  //       status: "ACTIVE",
  //       usageLimit: 100,
  //       usedCount: 0,
  //       appliesToAll: false,
  //       roomIds: ["room_5", "room_1"],
  //     },
  //     ...prev,
  //   ]);
  //   setAddOpen(false);
  // };

  const filteredPromos = useMemo(() => {
    return promos.filter((p) => {
      if (status !== "All") {
        if (status === "Active" && p.status !== "ACTIVE") return false;
        if (status === "Paused" && p.status !== "PAUSED") return false;
        if (status === "Expired" && p.status !== "EXPIRED") return false;
      }
      if (query && !p.title.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
  }, [status, query, promos]);

  return (
    <PageContainer>
      <Container gap="0" padding="0" elevation={3}>
        <Container
          direction="row"
          justify="space-between"
          align="center"
          padding="16px 16px 0 16px"
          style={{ flexWrap: "wrap", rowGap: 12, columnGap: 12 }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flex: 1,
              minWidth: 240,
            }}
          >
            <ResponsiveText type="title-small" weight="bold">
              Manage Promotion
            </ResponsiveText>
          </div>

          <Button
            startDecorator={<Add />}
            size="lg"
            color="primary"
            // onClick={() => setAddOpen(true)}
            onClick={() => navigate("/business/create-promotion")}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Create Promo
          </Button>
        </Container>

        {/* Search + Filter */}
        <Container
          padding="20px 20px 0 20px"
          direction="row"
          justify="space-between"
          align="center"
        >
          <Input
            startDecorator={<Search />}
            placeholder="Search promotions"
            size="lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            fullWidth
          />
        </Container>

        <StatusFilter active={status} onChange={setStatus} />
      </Container>
      {filteredPromos.length === 0 && (
        <NoDataFound
          icon={query.trim() ? "search" : "database"}
          title={query.trim() ? "No Results Found" : "No Promotions"}
          message={
            query.trim()
              ? `No promotions match "${query}". Try a different search term or filter.`
              : "No promotions found."
          }
        />
      )}

      {/* Promo cards grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
          gap: 20,
        }}
      >
        {filteredPromos.map((p) => (
          <PromoCard
            key={p.id}
            id={p.id}
            title={p.title}
            description={p.description}
            startDate={p.startDate}
            endDate={p.endDate}
            promoCode={p.promoCode}
            promoType={p.promoType}
            discountValue={p.discountValue}
            status={p.status}
            image={p.image}
            usageLimit={p.usageLimit}
            usedCount={p.usedCount}
            appliesToAll={p.appliesToAll}
            roomCount={p.appliesToAll ? undefined : p.roomIds?.length || 0}
            onEdit={(id) => console.log("Edit", id)}
            onDelete={(id) => console.log("Delete", id)}
            onStatusChange={(id, next) =>
              console.log("Status change", id, next)
            }
            onClick={(id) => console.log("Open details", id)}
          />
        ))}
      </div>
      {/** AddPromoModal removed in favor of full Promotion Form navigation */}
      {/**
      <AddPromoModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={handlePromoAdded}
      />
      */}
    </PageContainer>
  );
};

export default ManagePromotion;
