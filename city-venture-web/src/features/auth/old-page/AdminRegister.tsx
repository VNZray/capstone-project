import { useState } from "react";
import logo from "@/src/assets/images/logo.png";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  FormControl,
  FormLabel,
  FormHelperText,
  Checkbox,
  Input,
  Typography,
  IconButton,
  Divider,
} from "@mui/joy";
import EmailRounded from "@mui/icons-material/EmailRounded";
import PhoneIphoneRounded from "@mui/icons-material/PhoneIphoneRounded";
import PersonRounded from "@mui/icons-material/PersonRounded";
import LockRounded from "@mui/icons-material/LockRounded";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axios from "axios";
import type { Tourism } from "@/src/types/Tourism";
import type { User } from "@/src/types/User";
import { insertData } from "@/src/services/Service";
import { useAuth } from "@/src/context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("Rayven");
  const [lastName, setLastName] = useState("Clores");
  const position = "Tourism";

  const [email, setEmail] = useState("admin@gmail.com");
  const [phoneNumber, setPhoneNumber] = useState("09876541231");
  const [password, setPassword] = useState("123456");
  const [confirmPassword, setConfirmPassword] = useState("123456");
  const age = 25;
  const gender = "Male";
  const birthdate = "2000-01-01";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();

  const newUser: User = {
    email: email,
    phone_number: phoneNumber,
    password: password,
    user_role_id: 1,
    is_active: false,
    is_verified: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    otp: null,
  };

  const newTourism: Tourism = {
    first_name: firstName,
    last_name: lastName,
    age: age.toString(),
    gender: gender,
    birthdate: birthdate,
    position: position,
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required.";
    if (!lastName.trim()) newErrors.lastName = "Last name is required.";

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!email.includes("@")) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
    } else if (!/^[0-9]{10,15}$/.test(phoneNumber)) {
      newErrors.phoneNumber = "Enter a valid phone number.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!agreePolicy) {
      newErrors.agreePolicy = "You must agree to the terms and conditions.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const registerAdmin = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // insert user first
      const userRes = await insertData(newUser, "users");
      const userId = userRes.id;

      // insert address
      // Create Tourism
      const tourismResponse = await insertData(
        {
          ...newTourism,
          user_id: userId,
        },
        "tourism"
      );

      const tourismId = tourismResponse.id;

      alert(`Account created! Tourism ID: ${tourismId}`);
      alert(`User created! User ID: ${userId}`);

      await login(email, password);

      if (user?.role_name === "Admin") {
        navigate("/tourism/dashboard");
      }
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
      } else {
        alert("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ul-wrapper">
      {/* Left hero - keep image consistent with Register, add overlay and content like UnifiedLogin */}
      <div
        className="ul-hero"
        style={{
          backgroundImage:
            'url("https://i0.wp.com/nagayon.com/wp-content/uploads/2024/08/oragon-monument-by-colline.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="ul-hero-overlay" />
        <div className="ul-hero-content">
          <img src={logo} alt="City Venture" className="ul-logo" />
          <Typography level="h2" sx={{ color: "#fff", fontWeight: 800 }}>
            City Venture
          </Typography>
          <Typography level="body-lg" sx={{ color: "#E5E7EB" }}>
            Navigate with Ease — Your Ultimate City Directory
          </Typography>
        </div>
      </div>

      {/* Right form column */}
      <div className="ul-form-col">
        <Card
          className="ul-card"
          variant="outlined"
          sx={{ borderRadius: 18, p: 3, boxShadow: "sm", maxWidth: 600 }}
        >
          {/* Header */}
          <div
            className="ul-card-header"
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <img
              src={logo}
              alt="City Venture"
              width={36}
              height={36}
              style={{ borderRadius: 8 }}
            />
            <div>
              <Typography level="h4" fontWeight={800}>
                Create your admin account
              </Typography>
              <Typography
                textAlign="center"
                level="body-sm"
                sx={{ color: "#6B7280" }}
              >
                Tourism admin registration
              </Typography>
            </div>
          </div>

          {/* Form fields grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
              marginTop: 12,
            }}
          >
            <FormControl required>
              <FormLabel>First Name</FormLabel>
              <Input
                size="lg"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                startDecorator={<PersonRounded fontSize="small" />}
                color={errors.firstName ? "danger" : "neutral"}
              />
              <FormHelperText>{errors.firstName}</FormHelperText>
            </FormControl>

            <FormControl required>
              <FormLabel>Last Name</FormLabel>
              <Input
                size="lg"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                startDecorator={<PersonRounded fontSize="small" />}
                color={errors.lastName ? "danger" : "neutral"}
              />
              <FormHelperText>{errors.lastName}</FormHelperText>
            </FormControl>

            <FormControl required>
              <FormLabel>Email</FormLabel>
              <Input
                size="lg"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startDecorator={<EmailRounded fontSize="small" />}
                placeholder="you@example.com"
                color={errors.email ? "danger" : "neutral"}
              />
              <FormHelperText>{errors.email}</FormHelperText>
            </FormControl>

            <FormControl required>
              <FormLabel>Phone Number</FormLabel>
              <Input
                size="lg"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                startDecorator={<PhoneIphoneRounded fontSize="small" />}
                placeholder="09xxxxxxxxx"
                color={errors.phoneNumber ? "danger" : "neutral"}
              />
              <FormHelperText>{errors.phoneNumber}</FormHelperText>
            </FormControl>
          </div>

          {/* Passwords */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
              gap: 12,
              marginTop: 12,
            }}
          >
            <FormControl required>
              <FormLabel>Password</FormLabel>
              <Input
                size="lg"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                startDecorator={<LockRounded fontSize="small" />}
                endDecorator={
                  <IconButton
                    variant="plain"
                    color="neutral"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                }
                color={errors.password ? "danger" : "neutral"}
              />
              <FormHelperText>{errors.password}</FormHelperText>
            </FormControl>

            <FormControl required>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                size="lg"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                startDecorator={<LockRounded fontSize="small" />}
                endDecorator={
                  <IconButton
                    variant="plain"
                    color="neutral"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                }
                color={errors.confirmPassword ? "danger" : "neutral"}
              />
              <FormHelperText>{errors.confirmPassword}</FormHelperText>
            </FormControl>
          </div>

          {/* Terms & Privacy */}
          <div style={{ marginTop: 12 }}>
            <label
              style={{ display: "flex", alignItems: "flex-start", gap: 8 }}
            >
              <Checkbox
                size="md"
                checked={agreePolicy}
                onChange={() => setAgreePolicy(!agreePolicy)}
                sx={{ mt: "2px" }}
              />
              <Typography level="body-sm" sx={{ color: "text.primary" }}>
                I agree to the{" "}
                <Link
                  to="/terms-and-conditions"
                  target="_blank"
                  className="ul-link"
                >
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy-policy" target="_blank" className="ul-link">
                  Privacy Policy
                </Link>{" "}
                of City Venture.
              </Typography>
            </label>
            <FormHelperText>{errors.agreePolicy}</FormHelperText>
          </div>

          {/* Submit */}
          <div style={{ marginTop: 12 }}>
            <Button
              size="lg"
              fullWidth
              loading={loading}
              onClick={registerAdmin}
            >
              Sign Up
            </Button>
          </div>

          <Divider sx={{ my: 2 }} />

          {/* Footer */}
          <div className="ul-footer">
            <Typography textAlign="center" level="body-sm">
              Already have an account?{" "}
              <Link to="/login" className="ul-link">
                Sign in
              </Link>
            </Typography>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
