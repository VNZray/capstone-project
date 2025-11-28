import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
import NoDataFound from "@/src/components/NoDataFound";
import { Add } from "@mui/icons-material";
import { Input } from "@mui/joy";
import {
  ListChecks,
  PauseCircle,
  PlayCircle,
  Search,
  TimerOff,
} from "lucide-react";
import PromoCard from "./components/PromoCard";
import type { PromoStatus } from "./components/PromoCard";
import { useEffect, useMemo, useState } from "react";
import Typography from "@/src/components/Typography";
import { useNavigate } from "react-router-dom";
import DynamicTab from "@/src/components/ui/DynamicTab";
import IconButton from "@/src/components/IconButton";
import { useBusiness } from "@/src/context/BusinessContext";
import * as PromotionService from "@/src/services/PromotionService";
import type { Promotion } from "@/src/types/Promotion";
import Button from "@/src/components/Button";

type Status = "All" | "Active" | "Paused" | "Expired";

const ManagePromotion = () => {
  const [status, setStatus] = useState<Status>("All");
  const [query, setQuery] = useState("");
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const { businessDetails } = useBusiness();

  const tabs = [
    { id: "all", label: "All", icon: <ListChecks size={16} /> },
    { id: "active", label: "Active", icon: <PlayCircle size={16} /> },
    { id: "paused", label: "Paused", icon: <PauseCircle size={16} /> },
    { id: "expired", label: "Expired", icon: <TimerOff size={16} /> },
  ];

  // Fetch promotions by business ID
  useEffect(() => {
    const fetchPromotions = async () => {
      if (!businessDetails?.id) return;

      setLoading(true);
      try {
        const data = await PromotionService.fetchPromotionsByBusinessId(
          businessDetails.id
        );
        setPromos(data);
      } catch (error) {
        console.error("Error fetching promotions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, [businessDetails?.id]);

  // Convert API Promotion to PromoCard compatible format
  const getPromoStatus = (promo: Promotion): PromoStatus => {
    if (!promo.is_active) return "PAUSED";
    const now = new Date();
    const start = new Date(promo.start_date);
    const end = promo.end_date ? new Date(promo.end_date) : null;

    if (end && now > end) return "EXPIRED";
    if (now < start) return "SCHEDULED";
    return "ACTIVE";
  };

  const getPromoType = (
    promo: Promotion
  ): "discount_coupon" | "promo_code" | "room_discount" => {
    if (promo.promo_type === 3) return "promo_code";
    if (promo.promo_type === 2) return "room_discount";
    return "discount_coupon";
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;

    try {
      await PromotionService.deletePromotion(id);
      setPromos((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting promotion:", error);
      alert("Failed to delete promotion");
    }
  };

  const handleStatusChange = async (id: string, nextStatus: PromoStatus) => {
    try {
      const isActive = nextStatus === "ACTIVE";
      await PromotionService.updatePromotion(id, { is_active: isActive });
      setPromos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: isActive } : p))
      );
    } catch (error) {
      console.error("Error updating promotion status:", error);
      alert("Failed to update promotion status");
    }
  };

  const filteredPromos = useMemo(() => {
    return promos.filter((p) => {
      const promoStatus = getPromoStatus(p);
      if (status !== "All") {
        if (status === "Active" && promoStatus !== "ACTIVE") return false;
        if (status === "Paused" && promoStatus !== "PAUSED") return false;
        if (status === "Expired" && promoStatus !== "EXPIRED") return false;
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
            <Typography.Header>Manage Promotion</Typography.Header>
          </div>

          <IconButton
            onClick={() => navigate("/business/create-promotion")}
            size="lg"
            floating
            floatPosition="bottom-right"
            hoverEffect="rotate"
          >
            <Add />
          </IconButton>
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

        {/* Tabs */}
        <DynamicTab
          tabs={tabs}
          activeTabId={activeTab}
          onChange={(tabId) => {
            setActiveTab(String(tabId));
            setStatus(
              tabId === "all"
                ? "All"
                : tabId === "active"
                ? "Active"
                : tabId === "paused"
                ? "Paused"
                : tabId === "expired"
                ? "Expired"
                : "All"
            );
          }}
        />
      </Container>

      {/* No Data / No Search Results / Promo Cards */}
      {loading ? (
        <NoDataFound
          icon={"database"}
          title={"Loading..."}
          message={"Fetching promotions, please wait."}
        />
      ) : promos.length === 0 ? (
        <NoDataFound
          icon={"database"}
          title={"No Promotions"}
          message={
            "No promotions found. Create your first promotion to attract more guests."
          }
        >
          <Button
            onClick={() => navigate("/business/create-promotion")}
            startDecorator={<Add />}
            size="lg"
            variant="solid"
          >
            Create Promotion
          </Button>
        </NoDataFound>
      ) : filteredPromos.length === 0 ? (
        <NoDataFound
          icon={"search"}
          title={"No Search Results"}
          message={`No promotions match "${query}". Try a different search term or filter.`}
        />
      ) : (
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
              description={p.description || ""}
              startDate={p.start_date}
              endDate={p.end_date || ""}
              promoCode={p.promo_code || undefined}
              promoType={getPromoType(p)}
              discountValue={p.discount_percentage || undefined}
              status={getPromoStatus(p)}
              image={p.image_url || undefined}
              usageLimit={p.usage_limit || undefined}
              usedCount={p.used_count}
              onEdit={(id) => navigate(`/business/edit-promotion/${id}`)}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default ManagePromotion;
