import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input, Stack, FormControl, FormLabel } from "@mui/joy";
import { Mail, KeyRound, Lock, ArrowLeft, CheckCircle } from "lucide-react";
import PageContainer from "@/src/components/PageContainer";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import Alert from "@/src/components/Alert";
import "./styles/LoginStyle.css";

type Step = "email" | "otp" | "password" | "success";

const ForgetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({
    type: "error",
    title: "",
    message: "",
  });

  // OTP Timer
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  React.useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [otpTimer]);

  const showAlert = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string
  ) => {
    setAlertConfig({ type, title, message });
    setAlertOpen(true);
  };

  const handleSendOTP = async () => {
    setError("");
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      showAlert(
        "success",
        "OTP Sent",
        `Verification code has been sent to ${email}`
      );
      setCurrentStep("otp");
      setOtpTimer(60);
      setCanResend(false);
    } catch (err) {
      showAlert("error", "Error", "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      showAlert(
        "success",
        "OTP Resent",
        "A new verification code has been sent"
      );
      setOtpTimer(60);
      setCanResend(false);
    } catch (err) {
      showAlert("error", "Error", "Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError("");
    if (!otp || otp.length < 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      showAlert("success", "Verified", "OTP verified successfully");
      setCurrentStep("password");
    } catch (err) {
      showAlert("error", "Invalid OTP", "The code you entered is incorrect");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");

    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setCurrentStep("success");
    } catch (err) {
      showAlert(
        "error",
        "Error",
        "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <Container gap="1.5rem" animation="fade-in" animationDuration={400}>
      <Stack spacing={1}>
        <Typography.CardTitle>Forgot Password?</Typography.CardTitle>
        <Typography.Body size="sm" color="secondary">
          Enter your email address and we'll send you a verification code
        </Typography.Body>
      </Stack>

      <FormControl>
        <FormLabel>
          <Typography.Label size="sm">Email Address</Typography.Label>
        </FormLabel>
        <Input
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          startDecorator={<Mail size={20} />}
          size="lg"
          disabled={loading}
        />
      </FormControl>

      {error && (
        <Typography.Body size="sm" color="error">
          {error}
        </Typography.Body>
      )}

      <Button
        colorScheme="primary"
        onClick={handleSendOTP}
        loading={loading}
        fullWidth
        size="lg"
      >
        Send Verification Code
      </Button>

      <Link to="/login" style={{ textDecoration: "none" }}>
        <Button
          variant="plain"
          colorScheme="secondary"
          fullWidth
          startDecorator={<ArrowLeft size={18} />}
        >
          Back to Login
        </Button>
      </Link>
    </Container>
  );

  const renderOTPStep = () => (
    <Container gap="1.5rem" animation="slide-up" animationDuration={400}>
      <Stack spacing={1}>
        <Typography.CardTitle>Enter Verification Code</Typography.CardTitle>
        <Typography.Body size="sm" color="secondary">
          We've sent a 6-digit code to {email}
        </Typography.Body>
      </Stack>

      <FormControl>
        <FormLabel>
          <Typography.Label size="sm">OTP Code</Typography.Label>
        </FormLabel>
        <Input
          type="text"
          placeholder="000000"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          startDecorator={<KeyRound size={20} />}
          size="lg"
          disabled={loading}
          slotProps={{
            input: {
              style: {
                letterSpacing: "0.5em",
                fontSize: "1.2rem",
                textAlign: "center",
              },
            },
          }}
        />
      </FormControl>

      {error && (
        <Typography.Body size="sm" color="error">
          {error}
        </Typography.Body>
      )}

      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        alignItems="center"
      >
        <Typography.Body size="sm" color="secondary">
          Didn't receive the code?
        </Typography.Body>
        <Button
          variant="plain"
          colorScheme="primary"
          onClick={handleResendOTP}
          disabled={!canResend || loading}
          size="sm"
        >
          {canResend ? "Resend" : `Resend in ${otpTimer}s`}
        </Button>
      </Stack>

      <Button
        colorScheme="primary"
        onClick={handleVerifyOTP}
        loading={loading}
        fullWidth
        size="lg"
      >
        Verify Code
      </Button>

      <Button
        variant="outlined"
        colorScheme="secondary"
        onClick={() => setCurrentStep("email")}
        fullWidth
        startDecorator={<ArrowLeft size={18} />}
      >
        Change Email
      </Button>
    </Container>
  );

  const renderPasswordStep = () => (
    <Container gap="1.5rem" animation="slide-up" animationDuration={400}>
      <Stack spacing={1}>
        <Typography.CardTitle>Create New Password</Typography.CardTitle>
        <Typography.Body size="sm" color="secondary">
          Choose a strong password to secure your account
        </Typography.Body>
      </Stack>

      <FormControl>
        <FormLabel>
          <Typography.Label size="sm">New Password</Typography.Label>
        </FormLabel>
        <Input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          startDecorator={<Lock size={20} />}
          size="lg"
          disabled={loading}
        />
      </FormControl>

      <FormControl>
        <FormLabel>
          <Typography.Label size="sm">Confirm Password</Typography.Label>
        </FormLabel>
        <Input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          startDecorator={<Lock size={20} />}
          size="lg"
          disabled={loading}
        />
      </FormControl>

      {error && (
        <Typography.Body size="sm" color="error">
          {error}
        </Typography.Body>
      )}

      <Stack spacing={0.5}>
        <Typography.Body size="xs" color="secondary">
          Password must contain:
        </Typography.Body>
        <Typography.Body
          size="xs"
          color={newPassword.length >= 8 ? "success" : "secondary"}
        >
          • At least 8 characters
        </Typography.Body>
      </Stack>

      <Button
        colorScheme="primary"
        onClick={handleResetPassword}
        loading={loading}
        fullWidth
        size="lg"
      >
        Reset Password
      </Button>
    </Container>
  );

  const renderSuccessStep = () => (
    <Container gap="2rem" animation="zoom-in" animationDuration={500}>
      <Stack spacing={2} alignItems="center">
        <Container
          width="120px"
          height="120px"
          radius="50%"
          background="linear-gradient(135deg, #10b981 0%, #059669 100%)"
          align="center"
          justify="center"
          animation="bounce"
          animationDuration={600}
        >
          <CheckCircle size={64} color="white" />
        </Container>

        <Typography.CardTitle align="center">
          Password Reset Successful!
        </Typography.CardTitle>

        <Typography.Body size="sm" color="secondary" align="center">
          Your password has been successfully reset. You can now login with your
          new password.
        </Typography.Body>
      </Stack>

      <Button
        colorScheme="success"
        onClick={() => navigate("/login")}
        fullWidth
        size="lg"
      >
        Back to Login
      </Button>
    </Container>
  );

  const renderStep = () => {
    switch (currentStep) {
      case "email":
        return renderEmailStep();
      case "otp":
        return renderOTPStep();
      case "password":
        return renderPasswordStep();
      case "success":
        return renderSuccessStep();
      default:
        return renderEmailStep();
    }
  };

  return (
    <>
      <PageContainer padding={0} style={{ height: "100%", overflow: "hidden" }}>
        {/* Right Form Container */}
        <Container align="center" justify="center" height="100vh">
          <Container
            width="100%"
            style={{ maxWidth: "420px" }}
            padding="1.5rem"
            radius="16px"
            elevation={2}
          >
            {renderStep()}
          </Container>
        </Container>
      </PageContainer>

      <Alert
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        showCancel={false}
        confirmText="OK"
      />
    </>
  );
};

export default ForgetPassword;
