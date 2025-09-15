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
import "./LoginUnified.css";
import { insertTourism } from "@/src/services/TourismService";
import axios from "axios";
import api from "@/src/services/api";


const Register = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("Rayven");
  const [lastName, setLastName] = useState("Clores");
  const [position, setPosition] = useState("Tourism");

  const [email, setEmail] = useState("admin@gmail.com");
  const [phoneNumber, setPhoneNumber] = useState("09876541231");
  const [password, setPassword] = useState("123456");
  const [confirmPassword, setConfirmPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const data = {
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    email: email.trim(),
    phone_number: phoneNumber.trim(),
    position: position.trim(),
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

  const registerBusinessOwner = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Step 1: Create Tourism record
      const tourismResponse = await insertTourism(data);
      const tourism_id = tourismResponse.id;

      console.log("Tourism created:", tourismResponse);

      // Create User linked to Owner
      const userResponse = await axios.post(`${api}/users`, {
        email: email.trim(),
        phone_number: phoneNumber.trim(),
        password: password.trim(),
        role: "Tourism",
        tourism_id: tourism_id,
      });
      const userId = userResponse.data?.id;

      alert(`User created! User ID: ${userId}`);

      alert("✅ Registration successful! Please log in.");
      navigate("/login");
    } catch (err: any) {
      console.error(err);
      // Backend duplicate account error handling
      if (err.response?.status === 400 || err.response?.status === 409) {
        const errorMessage = err.response?.data?.error || "";
        const errorCode = err.response?.data?.code || "";

        console.log("Backend error:", errorCode, errorMessage);

        if (errorCode === "ER_DUP_ENTRY") {
          // check which field is duplicated
          if (errorMessage.toLowerCase().includes("email")) {
            setErrors((prev) => ({
              ...prev,
              email: "This email is already registered.",
            }));
          } else if (errorMessage.toLowerCase().includes("phone")) {
            setErrors((prev) => ({
              ...prev,
              phoneNumber: "This phone number is already registered.",
            }));
          } else {
            setErrors((prev) => ({ ...prev, email: "Duplicate entry found." }));
          }
        } else {
          alert(errorMessage || "Registration error occurred.");
        }
      } else {
        alert("❌ Registration failed. Please try again later.");
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
        <Card className="ul-card" variant="outlined" sx={{ borderRadius: 18, p: 3, boxShadow: "sm", maxWidth: 600 }}>
          {/* Header */}
          <div className="ul-card-header" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={logo} alt="City Venture" width={36} height={36} style={{ borderRadius: 8 }} />
            <div>
              <Typography level="h4" fontWeight={800}>
                Create your admin account
              </Typography>
              <Typography textAlign="center" level="body-sm" sx={{ color: "#6B7280" }}>
                Tourism admin registration
              </Typography>
            </div>
          </div>

          {/* Form fields grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginTop: 12 }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(1, minmax(0, 1fr))", gap: 12, marginTop: 12 }}>
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
                    aria-label={showPassword ? "Hide password" : "Show password"}
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
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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
            <label style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <Checkbox
                size="md"
                checked={agreePolicy}
                onChange={() => setAgreePolicy(!agreePolicy)}
                sx={{ mt: "2px" }}
              />
              <Typography level="body-sm" sx={{ color: "text.primary" }}>
                I agree to the {" "}
                <Link to="/terms-and-conditions" target="_blank" className="ul-link">
                  Terms and Conditions
                </Link>{" "}
                and {" "}
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
            <Button size="lg" fullWidth loading={loading} onClick={registerBusinessOwner}>
              Sign Up
            </Button>
          </div>

          <Divider sx={{ my: 2 }} />

          {/* Footer */}
          <div className="ul-footer">
            <Typography textAlign="center" level="body-sm">
              Already have an account? {" "}
              <Link to="/login" className="ul-link">Sign in</Link>
            </Typography>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
