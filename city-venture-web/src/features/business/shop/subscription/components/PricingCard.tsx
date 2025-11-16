import React from "react";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import { Box, Chip, Divider } from "@mui/joy";
import { Check, Crown, Sparkles } from "lucide-react";

interface PricingCardProps {
  id: string;
  name: string;
  price: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  isPremium?: boolean;
  bookingSystem: boolean;
  promotionTools: boolean;
  visibilityBoost: boolean;
  publication: boolean;
  billingCycle: "monthly" | "yearly";
  isCurrentPlan: boolean;
  onUpgrade: (planId: string) => void;
  keyFeatures: Array<{
    key: keyof Pick<PricingCardProps, 'bookingSystem' | 'promotionTools' | 'visibilityBoost' | 'publication'>;
    label: string;
    icon: React.ReactNode;
  }>;
}

const PricingCard: React.FC<PricingCardProps> = ({
  id,
  name,
  price,
  yearlyPrice,
  description,
  features,
  isPopular,
  isPremium,
  bookingSystem,
  promotionTools,
  visibilityBoost,
  publication,
  billingCycle,
  isCurrentPlan,
  onUpgrade,
  keyFeatures,
}) => {
  const displayPrice = billingCycle === "monthly" ? price : yearlyPrice;
  
  const calculateSavings = () => {
    if (billingCycle === "yearly" && price > 0) {
      const monthlyCost = price * 12;
      const savings = monthlyCost - yearlyPrice;
      const percentage = ((savings / monthlyCost) * 100).toFixed(0);
      return { savings, percentage };
    }
    return null;
  };

  const savings = calculateSavings();

  const featureValues = {
    bookingSystem,
    promotionTools,
    visibilityBoost,
    publication,
  };

  return (
    <Container
      elevation={isPopular || isPremium ? 3 : 1}
      padding="0"
      gap="0"
      style={{
        position: "relative",
        border: isPopular ? "2px solid #3B82F6" : isPremium ? "2px solid #8B5CF6" : undefined,
      }}
    >
      {/* Popular/Premium Badge */}
      {(isPopular || isPremium) && (
        <Box
          sx={{
            position: "absolute",
            top: "-12px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1,
          }}
        >
          <Chip
            color={isPremium ? "warning" : "primary"}
            startDecorator={isPremium ? <Crown size={14} /> : <Sparkles size={14} />}
            size="sm"
          >
            {isPremium ? "Premium" : "Most Popular"}
          </Chip>
        </Box>
      )}

      <Box sx={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Plan Header */}
        <Box>
          <Typography.CardTitle size="normal">{name}</Typography.CardTitle>
          <Typography.CardSubTitle size="xs" sx={{ marginTop: "4px" }}>
            {description}
          </Typography.CardSubTitle>
        </Box>

        {/* Price */}
        <Box>
          {id === "enterprise" ? (
            <Typography.Header size="md" color="primary">
              Custom
            </Typography.Header>
          ) : (
            <>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <Typography.Header size="md" color="primary">
                  ₱{displayPrice.toLocaleString()}
                </Typography.Header>
                <Typography.Body size="sm" color="default">
                  /{billingCycle === "monthly" ? "mo" : "yr"}
                </Typography.Body>
              </Box>
              {savings && (
                <Typography.Body size="xs" color="success" sx={{ marginTop: "4px" }}>
                  Save ₱{savings.savings.toLocaleString()} ({savings.percentage}%)
                </Typography.Body>
              )}
            </>
          )}
        </Box>

        <Divider />

        {/* Key Features */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {keyFeatures.map((feature) => (
            <Box
              key={feature.key}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                opacity: featureValues[feature.key] ? 1 : 0.3,
              }}
            >
              {feature.icon}
              <Typography.Body size="xs">{feature.label}</Typography.Body>
              {featureValues[feature.key] && <Check size={16} color="#10B981" />}
            </Box>
          ))}
        </Box>

        <Divider />

        {/* Features List */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          {features.map((feature, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}
            >
              <Check size={16} color="#10B981" style={{ marginTop: "2px", flexShrink: 0 }} />
              <Typography.Body size="xs">{feature}</Typography.Body>
            </Box>
          ))}
        </Box>

        {/* Action Button */}
        <Box sx={{ marginTop: "auto" }}>
          {isCurrentPlan ? (
            <Button colorScheme="secondary" variant="outlined" fullWidth disabled>
              Current Plan
            </Button>
          ) : id === "enterprise" ? (
            <Button colorScheme="primary" variant="solid" fullWidth onClick={() => onUpgrade(id)}>
              Contact Sales
            </Button>
          ) : (
            <Button
              colorScheme={isPremium ? "warning" : "primary"}
              variant="solid"
              fullWidth
              onClick={() => onUpgrade(id)}
            >
              Upgrade Now
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default PricingCard;
