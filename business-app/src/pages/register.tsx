import { useState } from "react";
import logo from "../assets/images/logo.png";
import Container from "../components/Container";
import Text from "../components/Text";
import "./RegisterStyle.css";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("Rayven");
  const [lastName, setLastName] = useState("Clores");
  const [email, setEmail] = useState("rayventzy@gmail.com");
  const [phoneNumber, setPhoneNumber] = useState("09876541234");
  const [password, setPassword] = useState("123456");
  const [confirmPassword, setConfirmPassword] = useState("123456");
  const [userType, setUserType] = useState<string[]>([]);
  const businessTypes = ["Accommodation", "Shop"];
  const [errorMessage, setErrorMessage] = useState("");
  const [agreePolicy, setAgreePolicy] = useState(false);

  const API_URL = "http://192.168.1.8:3000/api";

  const handleBusinessTypeChange = (type: string) => {
    setUserType((prev) => {
      let updated: string[];

      if (prev.includes(type) || prev.includes("Both")) {
        // Removing the current type
        updated = prev.includes("Both")
          ? [businessTypes.find((t) => t !== type)!]
          : prev.filter((t) => t !== type);
      } else {
        // Adding the current type
        updated = [...prev, type];
      }

      // If both selected → store as "Both"
      if (updated.includes("Accommodation") && updated.includes("Shop")) {
        return ["Both"];
      }

      return updated;
    });
  };

  const registerBusinessOwner = async () => {
    // Basic Validation
    if (!email || !password || password !== confirmPassword) {
      return setErrorMessage("Please check your credentials.");
    }

    if (!email.includes("@")) {
      return setErrorMessage("Please enter a valid email address.");
    }

    if (password.length < 6) {
      return setErrorMessage("Password must be at least 6 characters.");
    }

    if (!agreePolicy) {
      return setErrorMessage("You must agree to the terms and conditions.");
    }

    setErrorMessage(""); // clear any existing errors

    try {
      // Create Owner
      const ownerRes = await fetch(`${API_URL}/owner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone_number: phoneNumber.trim(),
          business_type: userType[0] || null,
        }),
      });

      if (!ownerRes.ok) {
        const { error } = await ownerRes.json();
        throw new Error(error || "Failed to register owner");
      }

      const ownerData = await ownerRes.json();
      const ownerId = ownerData.data?.owner?.id;
      alert(`Account created! ${ownerId}`);

      // Create User linked to Owner
      const userRes = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          phone_number: phoneNumber.trim(),
          password: password.trim(),
          role: "Owner",
          owner_id: ownerId,
        }),
      });

      if (!userRes.ok) {
        const { error } = await userRes.json();
        throw new Error(error || "Failed to create user");
      }

      const userData = await userRes.json();
      const userId = userData.data?.user?.id;
      alert(`User created! User ID: ${userId}`);

      navigate("/login");
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong. Please try again.");
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
              <div className="form-group">
                <label>
                  <Text variant="medium" color="dark">
                    First Name
                  </Text>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>
                  <Text variant="medium" color="dark">
                    Last Name
                  </Text>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            {/* Row 2 - Contact Info */}
            <div className="form-row">
              <div className="form-group">
                <label>
                  <Text variant="medium" color="dark">
                    Email
                  </Text>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label>
                  <Text variant="medium" color="dark">
                    Phone Number
                  </Text>
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Business Type */}
            <div className="form-group">
              <label>
                <Text variant="medium" color="dark">
                  Business Type
                </Text>
              </label>
              <div className="checkbox-group">
                {businessTypes.map((type) => (
                  <label key={type} className="checkbox-item color">
                    <input
                      type="checkbox"
                      checked={
                        userType.includes(type) || userType.includes("Both")
                      }
                      onChange={() => handleBusinessTypeChange(type)}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label>
                <Text variant="medium" color="dark">
                  Password
                </Text>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                <Text variant="medium" color="dark">
                  Confirm Password
                </Text>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Privacy Policy Agreement */}
          <div className="form-group" style={{ marginTop: 10 }}>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={agreePolicy}
                onChange={() => setAgreePolicy(!agreePolicy)}
              />
              <Text variant="normal" color="dark">
                I agree to the{" "}
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
                </Link>
                of Naga Venture.
              </Text>
            </label>
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
