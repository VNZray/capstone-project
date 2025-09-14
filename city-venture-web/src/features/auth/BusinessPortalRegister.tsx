import { useState } from "react";
import logo from "@/src/assets/images/logo.png";
import Container from "../../components/Container";
import Text from "../../components/Text";
import "./RegisterStyle.css";
import { Link, useNavigate } from "react-router-dom";
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Checkbox,
  Input,
} from "@mui/joy";
import axios from "axios";
import api from "../../services/api";
import { insertOwner } from "@/src/services/OwnerService";
import { insertData } from "../../services/Service";

const Register = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("Rayven");
  const [lastName, setLastName] = useState("Clores");
  const [email, setEmail] = useState("rayvenclores@gmail.com");
  const [phoneNumber, setPhoneNumber] = useState("09876541231");
  const [password, setPassword] = useState("123456");
  const [confirmPassword, setConfirmPassword] = useState("123456");
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [businessType, setBusinessType] = useState<BusinessType>(null);
  type BusinessType = "Accommodation" | "Shop" | "Both" | null;
  const [errors, setErrors] = useState<Record<string, string>>({});

  const newOwner = {
    first_name: firstName,
    last_name: lastName,
    email: email,
    phone_number: phoneNumber,
    business_type: businessType || "",
    age: "25",
    owner_profile: "",
    gender: "Male",
    birthday: "2000-01-01",
    address_id: null,
  };

  const newAddress = {
    barangay: 6,
    municipality: 24,
    province: 20,
  };

  const handleBusinessTypeChange = (type: BusinessType) => {
    if (businessType === type) {
      // uncheck → reset to null
      setBusinessType(null);
    } else if (
      businessType &&
      businessType !== type &&
      businessType !== "Both"
    ) {
      // if other one already checked → set Both
      setBusinessType("Both");
    } else if (businessType === "Both") {
      // if currently Both and clicking one → switch to the other
      setBusinessType(type);
    } else {
      // normal selection
      setBusinessType(type);
    }
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

    if (!businessType) {
      newErrors.businessType = "Please select at least one business type.";
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

      // insert address first
      const addressRes = await insertData(newAddress, "address");
      const addressId = addressRes.id;
      // Create Owner
      const ownerResponse = await insertOwner({...newOwner, address_id: addressId});
      const ownerId = ownerResponse.id;

      alert(`Account created! Owner ID: ${ownerId}`);

      // Create User linked to Owner
      const userResponse = await axios.post(`${api}/users`, {
        email: email.trim(),
        phone_number: phoneNumber.trim(),
        password: password.trim(),
        role: "Owner",
        owner_id: ownerId,
      });

      const userId = userResponse.data?.id;

      alert(`User created! User ID: ${userId}`);

      navigate("/business/login");
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
      } else {
        alert("Unexpected error occurred.");
      }
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

          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Text variant="title" color="dark" style={{ marginBottom: 6 }}>
              Sign Up
            </Text>
          </div>

          <div className="form-fields">
            {/* Row 1 - Name */}
            <div className="form-row">
              <FormControl>
                <FormLabel>First Name</FormLabel>
                <Input
                  size="lg"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Placeholder"
                />
                <FormHelperText>{errors.firstName}</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel> Last Name</FormLabel>
                <Input
                  size="lg"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                <FormHelperText>{errors.lastName}</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  size="lg"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
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

            {/* Business Type */}
            <div className="form-group">
              <FormLabel>Business Owned</FormLabel>
              <Checkbox
                label="Accommodation"
                checked={
                  businessType === "Accommodation" || businessType === "Both"
                }
                onChange={() => handleBusinessTypeChange("Accommodation")}
              />
              <Checkbox
                label="Shop"
                checked={businessType === "Shop" || businessType === "Both"}
                onChange={() => handleBusinessTypeChange("Shop")}
              />
              <FormHelperText>{errors.businessType}</FormHelperText>
            </div>

            {/* Password */}
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                size="lg"
                type="password"
                value={phoneNumber}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FormHelperText>{errors.password}</FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                size="lg"
                type="password"
                value={phoneNumber}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <FormHelperText>{errors.confirmPassword}</FormHelperText>
            </FormControl>
          </div>

          {/* Privacy Policy Agreement */}
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
                </Link>
                and
                <Link to="/privacy-policy" target="_blank" className="link">
                  Privacy Policy
                </Link>
                of Naga Venture.
              </Text>
            </label>
            <FormHelperText>{errors.agreePolicy}</FormHelperText>
          </div>

          {/* Register Button */}
          <div style={{ marginTop: 20 }}>
            <button className="login-button" onClick={registerBusinessOwner}>
              <Text variant="bold" color="white">
                Sign Up
              </Text>
            </button>
          </div>

          {/* Sign Up Link */}
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
