import React, { useState } from "react";
import {
  Modal,
  ModalDialog,
  ModalClose,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Divider,
  Box,
  Stack,
} from "@mui/joy";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import Container from "@/src/components/Container";
import { CreditCard, Smartphone, Check, AlertCircle } from "lucide-react";

interface BillingModalProps {
  open: boolean;
  onClose: () => void;
  planName: string;
  planPrice: number;
  billingCycle: "monthly" | "yearly";
  onConfirm: (paymentMethod: string, paymentDetails: any) => void;
}

type PaymentMethod = "gcash" | "maya" | "credit";

const BillingModal: React.FC<BillingModalProps> = ({
  open,
  onClose,
  planName,
  planPrice,
  billingCycle,
  onConfirm,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("gcash");
  const [processing, setProcessing] = useState(false);

  // Credit Card Form State
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  // E-Wallet Form State
  const [mobileNumber, setMobileNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(" ").substring(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const formatMobileNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned.substring(0, 11);
  };

  const handlePayment = async () => {
    setProcessing(true);

    const paymentDetails = {
      paymentMethod,
      ...(paymentMethod === "credit"
        ? { cardNumber, cardName, expiryDate, cvv }
        : { mobileNumber, accountName }),
    };

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      onConfirm(paymentMethod, paymentDetails);
      resetForm();
    }, 2000);
  };

  const resetForm = () => {
    setCardNumber("");
    setCardName("");
    setExpiryDate("");
    setCvv("");
    setMobileNumber("");
    setAccountName("");
  };

  const isFormValid = () => {
    if (paymentMethod === "credit") {
      return (
        cardNumber.replace(/\s/g, "").length === 16 &&
        cardName.trim() !== "" &&
        expiryDate.length === 5 &&
        cvv.length === 3
      );
    } else {
      return mobileNumber.length === 11 && accountName.trim() !== "";
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          maxWidth: 600,
          width: "90%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <ModalClose />

        <Box >
          <Typography.CardTitle>Complete Your Upgrade</Typography.CardTitle>
          <Typography.CardSubTitle>
            You're upgrading to {planName} plan
          </Typography.CardSubTitle>
        </Box>

        <Divider />

        {/* Order Summary */}
        <Container elevation={0} padding="16px" gap="12px" background="#F9FAFB">
          <Typography.Label>Order Summary</Typography.Label>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography.Body size="xs">{planName} Plan</Typography.Body>
            <Typography.Body>
              ₱{planPrice.toLocaleString()}
            </Typography.Body>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography.Body size="xs">
              Billing Cycle
            </Typography.Body>
            <Typography.Body size="xs">
              {billingCycle === "monthly" ? "Monthly" : "Yearly"}
            </Typography.Body>
          </Box>

          <Divider />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography.Label>Total</Typography.Label>
            <Typography.CardTitle color="primary">
              ₱{planPrice.toLocaleString()}
            </Typography.CardTitle>
          </Box>
        </Container>

        {/* Payment Method Selection */}
        <Box>
          <Typography.Label sx={{ mb: 1}}>
            Select Payment Method
          </Typography.Label>

          <RadioGroup
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          >
            <Stack spacing={1}>
              <Container
                elevation={1}
                padding="16px"
                gap="8px"
                direction="row"
                align="center"
                onClick={() => setPaymentMethod("gcash")}
                cursor="pointer"
                style={{
                  border:
                    paymentMethod === "gcash"
                      ? "2px solid #3B82F6"
                      : "1px solid #E5E7EB",
                }}
              >
                <Radio value="gcash" />
                <Typography.Label>GCash</Typography.Label>
              </Container>

              <Container
                elevation={1}
                padding="16px"
                gap="8px"
                direction="row"
                align="center"
                onClick={() => setPaymentMethod("maya")}
                cursor="pointer"
                style={{
                  border:
                    paymentMethod === "maya"
                      ? "2px solid #3B82F6"
                      : "1px solid #E5E7EB",
                }}
              >
                <Radio value="maya" />
                <Typography.Label weight="semibold">Maya</Typography.Label>
              </Container>

              <Container
                elevation={1}
                padding="16px"
                gap="8px"
                direction="row"
                align="center"
                onClick={() => setPaymentMethod("credit")}
                cursor="pointer"
                style={{
                  border:
                    paymentMethod === "credit"
                      ? "2px solid #3B82F6"
                      : "1px solid #E5E7EB",
                }}
              >
                <Radio value="credit" />
                <Typography.Label weight="semibold">
                  Credit/Debit Card
                </Typography.Label>
              </Container>
            </Stack>
          </RadioGroup>
        </Box>

        {/* Payment Forms */}
        <Box sx={{ mt: 2 }}>
          {paymentMethod === "credit" ? (
            <Stack spacing={2}>
              <FormControl required>
                <FormLabel>Card Number</FormLabel>
                <Input
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(formatCardNumber(e.target.value))
                  }
                  startDecorator={<CreditCard size={18} />}
                />
              </FormControl>

              <FormControl required>
                <FormLabel>Cardholder Name</FormLabel>
                <Input
                  placeholder="JUAN DELA CRUZ"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                />
              </FormControl>

              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControl required sx={{ flex: 1 }}>
                  <FormLabel>Expiry Date</FormLabel>
                  <Input
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) =>
                      setExpiryDate(formatExpiryDate(e.target.value))
                    }
                  />
                </FormControl>

                <FormControl required sx={{ flex: 1 }}>
                  <FormLabel>CVV</FormLabel>
                  <Input
                    type="password"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) =>
                      setCvv(e.target.value.replace(/\D/g, "").substring(0, 3))
                    }
                  />
                </FormControl>
              </Box>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <FormControl required>
                <FormLabel>Mobile Number</FormLabel>
                <Input
                  placeholder="09123456789"
                  value={mobileNumber}
                  onChange={(e) =>
                    setMobileNumber(formatMobileNumber(e.target.value))
                  }
                  startDecorator={<Smartphone size={18} />}
                />
              </FormControl>

              <FormControl required>
                <FormLabel>Account Name</FormLabel>
                <Input
                  placeholder="Enter your account name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </FormControl>

              <Container
                elevation={0}
                padding="12px"
                gap="8px"
                background="#FEF3C7"
              >
                <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                  <AlertCircle
                    size={16}
                    color="#F59E0B"
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <Typography.Label size="xs">
                    You will be redirected to{" "}
                    {paymentMethod === "gcash" ? "GCash" : "Maya"} app to
                    complete the payment. Please ensure your account has
                    sufficient balance.
                  </Typography.Label>
                </Box>
              </Container>
            </Stack>
          )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            colorScheme="secondary"
            fullWidth
            onClick={onClose}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            variant="solid"
            colorScheme="primary"
            fullWidth
            onClick={handlePayment}
            disabled={!isFormValid() || processing}
            startDecorator={processing ? undefined : <Check size={18} />}
          >
            {processing
              ? "Processing..."
              : `Pay ₱${planPrice.toLocaleString()}`}
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default BillingModal;
