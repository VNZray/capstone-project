import { useState } from "react";
import logo from "../assets/images/logo.png";
import Container from "../components/Container";
import Text from "../components/Text";
import "./RegisterStyle.css";
import { Link, useNavigate } from "react-router-dom";
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Checkbox,
  Input,
} from "@mui/joy";
import { insertTourism } from "@/src/services/TourismService";
import axios from "axios";
import api from "../services/api";

type BusinessType = "Accommodation" | "Shop" | "Both" | null;

const Register = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("Rayven");
  const [lastName, setLastName] = useState("Clores");
  const [position, setPosition] = useState("Manager");

  const [email, setEmail] = useState("admin@gmail.com");
  const [phoneNumber, setPhoneNumber] = useState("09876541231");
  const [password, setPassword] = useState("123456");
  const [confirmPassword, setConfirmPassword] = useState("123456");
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

  const newUser = {
    email: email,
    phone_number: phoneNumber,
    role: "Owner",
    password: password,
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
    <div className="register-container">
      <div className="left-container">
        <img
          src="https://i0.wp.com/nagayon.com/wp-content/uploads/2024/08/oragon-monument-by-colline.jpg"
          alt="Background"
          className="background-image"
        />
      </div>

      <div className="right-container">
        <Container elevation={3} padding="40px" radius="0.5rem" width="600px">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo" />
            <Text variant="header-title" color="dark">
              City Venture
            </Text>
          </div>

          <Text variant="title" color="dark" style={{ marginBottom: 6 }}>
            Sign Up
          </Text>

          <div className="form-fields">
            {/* Row 1 - Name */}
            <div className="form-row">
              <FormControl>
                <FormLabel>First Name</FormLabel>
                <Input
                  size="lg"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <FormHelperText>{errors.firstName}</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Last Name</FormLabel>
                <Input
                  size="lg"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                <FormHelperText>{errors.lastName}</FormHelperText>
              </FormControl>
            </div>

            {/* Row 2 - Email + Phone */}
            <div className="form-row">
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  size="lg"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <FormHelperText>{errors.email}</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  size="lg"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <FormHelperText>{errors.phoneNumber}</FormHelperText>
              </FormControl>
            </div>

            {/* Passwords */}
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                size="lg"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FormHelperText>{errors.password}</FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                size="lg"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <FormHelperText>{errors.confirmPassword}</FormHelperText>
            </FormControl>
          </div>

          {/* Privacy Policy */}
          <div className="form-group" style={{ marginTop: 10 }}>
            <label
              style={{ display: "flex", alignItems: "flex-start", gap: 8 }}
            >
              <Checkbox
                size="md"
                checked={agreePolicy}
                onChange={() => setAgreePolicy(!agreePolicy)}
                sx={{ mt: "2px" }}
              />
              <Text variant="normal" color="dark">
                I agree to the
                <Link
                  to="/terms-and-conditions"
                  target="_blank"
                  className="link"
                >
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy-policy" target="_blank" className="link">
                  Privacy Policy
                </Link>{" "}
                of City Venture.
              </Text>
            </label>
            <FormHelperText>{errors.agreePolicy}</FormHelperText>
          </div>

          {/* Register Button */}
          <div style={{ marginTop: 20 }}>
            <button
              className="login-button"
              onClick={registerBusinessOwner}
              disabled={loading}
            >
              <Text justify="center" variant="bold" color="white">
                {loading ? "Registering..." : "Sign Up"}
              </Text>
            </button>
          </div>

          {/* Sign In Link */}
          <div className="signup-row">
            <Text variant="normal" color="dark">
              Already have an Account?
            </Text>
            <Link to="/login" className="link">
              <Text variant="medium" color="secondary-color">
                Sign In
              </Text>
            </Link>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default Register;
