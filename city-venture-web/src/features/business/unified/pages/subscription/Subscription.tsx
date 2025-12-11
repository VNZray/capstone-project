import { useState } from "react";
import PageContainer from "@/src/components/PageContainer";
import Typography from "@/src/components/Typography";
import Container from "@/src/components/Container";
import Button from "@/src/components/Button";
import DynamicTab from "@/src/components/ui/DynamicTab";
import PricingCard from "./components/PricingCard";
import BillingModal from "./components/BillingModal";
import { Box } from "@mui/joy";
import {
  Check,
  TrendingUp,
  Calendar,
  Bell,
  Eye,
} from "lucide-react";
import { colors } from "@/src/utils/Colors";

type BillingCycle = "monthly" | "yearly";

interface Plan {
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
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    yearlyPrice: 0,
    description: "Perfect for getting started with your business",
    bookingSystem: false,
    promotionTools: false,
    visibilityBoost: false,
    publication: false,
    features: [
      "Up to 5 listings",
      "Basic analytics",
      "Email support",
      "Standard visibility",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 999,
    yearlyPrice: 9990,
    description: "Complete solution with all premium features",
    isPremium: true,
    isPopular: true,
    bookingSystem: true,
    promotionTools: true,
    visibilityBoost: true,
    publication: true,
    features: [
      "Unlimited listings",
      "Real-time analytics dashboard",
      "24/7 priority support",
      "Online booking system",
      "Advanced promotion tools",
      "Featured in search results",
      "Visibility boost",
    ],
  },
];

const Subscription = () => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [currentPlan] = useState("basic");
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const keyFeatures = [
    { key: 'bookingSystem' as const, label: 'Booking System', icon: <Calendar size={20} /> },
    { key: 'promotionTools' as const, label: 'Promotion Tools', icon: <TrendingUp size={20} /> },
    { key: 'visibilityBoost' as const, label: 'Visibility Boost', icon: <Eye size={20} /> },
  ];

  const handleUpgrade = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      setBillingModalOpen(true);
    }
  };

  const handlePaymentConfirm = (paymentMethod: string, paymentDetails: any) => {
    console.log("Payment confirmed:", { paymentMethod, paymentDetails, plan: selectedPlan });
    // Here you would typically send this data to your backend
    alert(`Payment successful! You've upgraded to ${selectedPlan?.name} plan using ${paymentMethod.toUpperCase()}.`);
    setBillingModalOpen(false);
    setSelectedPlan(null);
  };

  return (
    <PageContainer padding="24px" gap="24px">
      {/* Header Section */}
      <Container gap="16px" padding="32px" elevation={0}>
        <Box sx={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
          <Typography.Header size="lg" align="center" color="primary">
            Choose Your Perfect Plan
          </Typography.Header>
          <Typography.Body size="normal" align="center" color="default" typography={{ marginTop: "12px" }}>
            Unlock powerful features to grow your business and reach more customers.
            Upgrade anytime as your needs evolve.
          </Typography.Body>
        </Box>

        {/* Billing Cycle Toggle */}
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: "24px" }}>
          <DynamicTab
            tabs={[
              { id: "monthly", label: "Monthly" },
              { id: "yearly", label: "Yearly (Save up to 17%)" },
            ]}
            activeTabId={billingCycle}
            onChange={(id) => setBillingCycle(id as BillingCycle)}
            colorScheme="primary"
            variant="filled"
            showIcons={false}
          />
        </Box>
      </Container>

      {/* Pricing Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
          },
          gap: "24px",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            {...plan}
            billingCycle={billingCycle}
            isCurrentPlan={currentPlan === plan.id}
            onUpgrade={handleUpgrade}
            keyFeatures={keyFeatures}
          />
        ))}
      </Box>

      {/* Billing Modal */}
      {selectedPlan && (
        <BillingModal
          open={billingModalOpen}
          onClose={() => {
            setBillingModalOpen(false);
            setSelectedPlan(null);
          }}
          planName={selectedPlan.name}
          planPrice={billingCycle === "monthly" ? selectedPlan.price : selectedPlan.yearlyPrice}
          billingCycle={billingCycle}
          onConfirm={handlePaymentConfirm}
        />
      )}

      {/* Feature Comparison Section */}
      <Container gap="24px" padding="32px" elevation={1} style={{ marginTop: "20px" }}>
        <Typography.Header size="normal" align="center">
          Compare All Features
        </Typography.Header>

        <Box
          sx={{
            overflowX: "auto",
            "& table": {
              width: "100%",
              borderCollapse: "collapse",
            },
            "& th, & td": {
              padding: "16px",
              textAlign: "left",
              borderBottom: "1px solid #E5E7EB",
            },
            "& th": {
              fontWeight: 600,
              backgroundColor: colors.primary,
            },
          }}
        >
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                {plans.map((plan) => (
                  <th key={plan.id} style={{ textAlign: "center" }}>
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Typography.Body size="sm" weight="semibold">Booking System</Typography.Body>
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} style={{ textAlign: "center" }}>
                    {plan.bookingSystem ? <Check size={20} color="#10B981" /> : "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <td>
                  <Typography.Body size="sm" weight="semibold">Promotion Tools</Typography.Body>
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} style={{ textAlign: "center" }}>
                    {plan.promotionTools ? <Check size={20} color="#10B981" /> : "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <td>
                  <Typography.Body size="sm" weight="semibold">Visibility Boost</Typography.Body>
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} style={{ textAlign: "center" }}>
                    {plan.visibilityBoost ? <Check size={20} color="#10B981" /> : "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <td>
                  <Typography.Body size="sm" weight="semibold">App Publication</Typography.Body>
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} style={{ textAlign: "center" }}>
                    {plan.publication ? <Check size={20} color="#10B981" /> : "—"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </Box>
      </Container>

      {/* FAQ Section */}
      <Container gap="20px" padding="32px" elevation={0}>
        <Typography.Header size="normal" align="center">
          Frequently Asked Questions
        </Typography.Header>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            gap: "20px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {[
            {
              question: "Can I change my plan anytime?",
              answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.",
            },
            {
              question: "What payment methods do you accept?",
              answer: "We accept all major credit cards, debit cards, and online payment platforms.",
            },
            {
              question: "Is there a refund policy?",
              answer: "Yes, we offer a 30-day money-back guarantee for all paid plans.",
            },
            {
              question: "Do yearly plans auto-renew?",
              answer: "Yes, but you can cancel anytime before the renewal date with no penalties.",
            },
          ].map((faq, index) => (
            <Container key={index} elevation={1} padding="20px" gap="12px">
              <Typography.CardTitle size="sm">{faq.question}</Typography.CardTitle>
              <Typography.Body size="sm" color="default">
                {faq.answer}
              </Typography.Body>
            </Container>
          ))}
        </Box>
      </Container>

      {/* CTA Section */}
      <Container
        gap="16px"
        padding="48px 32px"
        elevation={2}
        background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        style={{ textAlign: "center" }}
      >
        <Typography.CardTitle  typography={{ color: "#FFFFFF" }}>
          Still have questions?
        </Typography.CardTitle>
        <Typography.Body typography={{ color: "#F3F4F6" }}>
          Our team is here to help you choose the perfect plan for your business
        </Typography.Body>
        <Box sx={{ marginTop: "16px" }}>
          <Button
            colorScheme="secondary"
            variant="solid"
            size="lg"
            startDecorator={<Bell size={20} />}
          >
            Contact Support
          </Button>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default Subscription;
