import { useState } from "react";
import PageContainer from "@/src/components/PageContainer";
import Text from "@/src/components/Text";
import { useAuth } from "@/src/context/AuthContext";
import {
  Box,
  Card,
  CardContent,
  Switch,
  Typography,
  Divider,
  Select,
  Option,
  Input,
  Button,
  Chip,
  Stack,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  IconButton,
  Alert,
} from "@mui/joy";
import {
  Store,
  Palette,
  Payment,
  Notifications,
  Security,
  Language,
  Schedule,
  Email,
  Smartphone,
  CreditCard,
  Check,
  Add,
  Delete,
  Info,
} from "@mui/icons-material";
import { colors } from "@/src/utils/Colors";
import ResponsiveText from "@/src/components/ResponsiveText";

const Settings = () => {
  const { user } = useAuth();

  // Business Settings State
  const [businessStatus, setBusinessStatus] = useState<"active" | "inactive">(
    "active"
  );
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarColor, setSidebarColor] = useState("#1e40af");

  // Payment Settings State
  const [paymentMethods, setPaymentMethods] = useState({
    gcash: false,
    paymaya: false,
    card: false,
    cash: true,
  });
  const [gcashNumber, setGcashNumber] = useState("");
  const [paymayaNumber, setPaymayaNumber] = useState("");

  // Notification Settings State
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    bookingAlerts: true,
    reviewAlerts: true,
    promotionAlerts: false,
  });

  // General Settings State
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("Asia/Manila");
  const [currency, setCurrency] = useState("PHP");

  // Subscription State
  const [subscriptionPlan, setSubscriptionPlan] = useState("basic");

  // Security Settings State
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [autoLogout, setAutoLogout] = useState(false);
  const [logoutTime, setLogoutTime] = useState("30");

  const sidebarColorOptions = [
    { value: "#1e40af", label: "Blue", color: "#1e40af" },
    { value: "#059669", label: "Green", color: "#059669" },
    { value: "#dc2626", label: "Red", color: "#dc2626" },
    { value: "#7c3aed", label: "Purple", color: "#7c3aed" },
    { value: "#ea580c", label: "Orange", color: "#ea580c" },
    { value: "#0891b2", label: "Cyan", color: "#0891b2" },
  ];

  return (
    <PageContainer>
      <Box sx={{ width: "100%" }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <ResponsiveText type="title-small" weight="bold">
            Settings
          </ResponsiveText>
          <ResponsiveText type="body-medium">
            Manage your business preferences and configurations
          </ResponsiveText>
        </Box>

        {/* Business Status Section */}
        <Card sx={{ mb: 3, borderRadius: 12 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Store sx={{ mr: 1, color: colors.primary }} />
              <Typography level="h4" sx={{ fontWeight: 700 }}>
                Business Status
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography level="title-md" sx={{ fontWeight: 600 }}>
                  Business Operations
                </Typography>
                <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                  Control whether your business is accepting bookings
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Chip
                  color={businessStatus === "active" ? "success" : "neutral"}
                  variant="soft"
                >
                  {businessStatus === "active" ? "Active" : "Inactive"}
                </Chip>
                <Switch
                  checked={businessStatus === "active"}
                  onChange={(e) =>
                    setBusinessStatus(e.target.checked ? "active" : "inactive")
                  }
                  color={businessStatus === "active" ? "success" : "neutral"}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card sx={{ mb: 3, borderRadius: 12 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Palette sx={{ mr: 1, color: colors.primary }} />
              <Typography level="h4" sx={{ fontWeight: 700 }}>
                Appearance
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />

            {/* Dark Mode */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box>
                <Typography level="title-md" sx={{ fontWeight: 600 }}>
                  Dark Mode
                </Typography>
                <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                  Enable dark theme
                </Typography>
              </Box>
              <Switch
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
            </Box>

            {/* Theme Color Selection */}
            <Box>
              <Typography level="title-md" sx={{ fontWeight: 600, mb: 1 }}>
                Theme Color
              </Typography>
              <Typography level="body-sm" sx={{ color: "text.secondary", mb: 2 }}>
                Choose a color theme
              </Typography>
              <Stack direction="row" spacing={2}>
                {sidebarColorOptions.map((option) => (
                  <Chip
                    key={option.value}
                    variant={sidebarColor === option.value ? "solid" : "outlined"}
                    color={sidebarColor === option.value ? "primary" : "neutral"}
                    sx={{
                      bgcolor: option.color,
                      color: "#fff",
                      cursor: "pointer",
                      border: sidebarColor === option.value ? "2px solid #1e40af" : "1px solid #e0e0e0",
                      fontWeight: 600,
                      fontSize: 16,
                      px: 2,
                      py: 1,
                      boxShadow: sidebarColor === option.value ? 2 : 0,
                      transition: "box-shadow 0.2s",
                    }}
                    onClick={() => setSidebarColor(option.value)}
                  >
                    {option.label}
                  </Chip>
                ))}
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Payment Methods Section */}
        <Card sx={{ mb: 3, borderRadius: 12 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Payment sx={{ mr: 1, color: colors.primary }} />
              <Typography level="h4" sx={{ fontWeight: 700 }}>
                Payment Methods
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />

            <Alert color="primary" variant="soft" sx={{ mb: 3 }}>
              <Info sx={{ mr: 1 }} />
              Enable payment methods you want to accept from customers
            </Alert>

            {/* GCash */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Smartphone sx={{ mr: 1, color: "#007DFE" }} />
                  <Typography level="title-md" sx={{ fontWeight: 600 }}>
                    GCash
                  </Typography>
                </Box>
                <Switch
                  checked={paymentMethods.gcash}
                  onChange={(e) =>
                    setPaymentMethods({
                      ...paymentMethods,
                      gcash: e.target.checked,
                    })
                  }
                />
              </Box>
              {paymentMethods.gcash && (
                <Input
                  placeholder="Enter GCash number (e.g., 09123456789)"
                  value={gcashNumber}
                  onChange={(e) => setGcashNumber(e.target.value)}
                  startDecorator={<Smartphone />}
                  sx={{ maxWidth: 400 }}
                />
              )}
            </Box>

            {/* PayMaya */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Smartphone sx={{ mr: 1, color: "#00D632" }} />
                  <Typography level="title-md" sx={{ fontWeight: 600 }}>
                    PayMaya
                  </Typography>
                </Box>
                <Switch
                  checked={paymentMethods.paymaya}
                  onChange={(e) =>
                    setPaymentMethods({
                      ...paymentMethods,
                      paymaya: e.target.checked,
                    })
                  }
                />
              </Box>
              {paymentMethods.paymaya && (
                <Input
                  placeholder="Enter PayMaya number (e.g., 09123456789)"
                  value={paymayaNumber}
                  onChange={(e) => setPaymayaNumber(e.target.value)}
                  startDecorator={<Smartphone />}
                  sx={{ maxWidth: 400 }}
                />
              )}
            </Box>

            {/* Credit/Debit Card */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CreditCard sx={{ mr: 1, color: "#6366F1" }} />
                  <Box>
                    <Typography level="title-md" sx={{ fontWeight: 600 }}>
                      Credit/Debit Card
                    </Typography>
                    <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                      Visa, Mastercard, American Express
                    </Typography>
                  </Box>
                </Box>
                <Switch
                  checked={paymentMethods.card}
                  onChange={(e) =>
                    setPaymentMethods({
                      ...paymentMethods,
                      card: e.target.checked,
                    })
                  }
                />
              </Box>
            </Box>

            {/* Cash on Site */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Payment sx={{ mr: 1, color: "#10B981" }} />
                  <Typography level="title-md" sx={{ fontWeight: 600 }}>
                    Cash Payment
                  </Typography>
                </Box>
                <Switch
                  checked={paymentMethods.cash}
                  onChange={(e) =>
                    setPaymentMethods({
                      ...paymentMethods,
                      cash: e.target.checked,
                    })
                  }
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Subscription Section */}
        <Card sx={{ mb: 3, borderRadius: 12 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Typography level="h4" sx={{ fontWeight: 700 }}>
                💎 Subscription Plan
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />

            <FormControl>
              <RadioGroup
                value={subscriptionPlan}
                onChange={(e) => setSubscriptionPlan(e.target.value)}
              >
                <Stack spacing={2}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      borderColor:
                        subscriptionPlan === "basic"
                          ? "primary.500"
                          : "neutral.300",
                      bgcolor:
                        subscriptionPlan === "basic" ? "primary.50" : "white",
                    }}
                    onClick={() => setSubscriptionPlan("basic")}
                  >
                    <Radio value="basic" label="" sx={{ display: "none" }} />
                    <Box>
                      <Typography level="title-lg" sx={{ fontWeight: 700 }}>
                        Basic Plan
                      </Typography>
                      <Typography level="h3" sx={{ my: 1 }}>
                        Free
                      </Typography>
                      <Typography level="body-sm" sx={{ mb: 2 }}>
                        • Up to 5 listings
                        <br />
                        • Basic analytics
                        <br />
                        • Email support
                        <br />• Standard visibility
                      </Typography>
                      <Chip color="neutral" size="sm">
                        Current Plan
                      </Chip>
                    </Box>
                  </Card>

                  <Card
                    variant="outlined"
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      borderColor:
                        subscriptionPlan === "premium"
                          ? "primary.500"
                          : "neutral.300",
                      bgcolor:
                        subscriptionPlan === "premium" ? "primary.50" : "white",
                    }}
                    onClick={() => setSubscriptionPlan("premium")}
                  >
                    <Radio value="premium" label="" sx={{ display: "none" }} />
                    <Box>
                      <Typography level="title-lg" sx={{ fontWeight: 700 }}>
                        Premium Plan
                      </Typography>
                      <Typography level="h3" sx={{ my: 1 }}>
                        ₱999
                        <Typography level="body-sm" component="span">
                          /month
                        </Typography>
                      </Typography>
                      <Typography level="body-sm" sx={{ mb: 2 }}>
                        • Unlimited listings
                        <br />
                        • Advanced analytics & insights
                        <br />
                        • Priority support
                        <br />
                        • Featured in search results
                        <br />• Custom branding
                      </Typography>
                      <Chip color="primary" size="sm">
                        Recommended
                      </Chip>
                    </Box>
                  </Card>

                  <Card
                    variant="outlined"
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      borderColor:
                        subscriptionPlan === "enterprise"
                          ? "primary.500"
                          : "neutral.300",
                      bgcolor:
                        subscriptionPlan === "enterprise"
                          ? "primary.50"
                          : "white",
                    }}
                    onClick={() => setSubscriptionPlan("enterprise")}
                  >
                    <Radio
                      value="enterprise"
                      label=""
                      sx={{ display: "none" }}
                    />
                    <Box>
                      <Typography level="title-lg" sx={{ fontWeight: 700 }}>
                        Enterprise Plan
                      </Typography>
                      <Typography level="h3" sx={{ my: 1 }}>
                        Custom
                      </Typography>
                      <Typography level="body-sm" sx={{ mb: 2 }}>
                        • Everything in Premium
                        <br />
                        • Dedicated account manager
                        <br />
                        • API access
                        <br />
                        • White-label solution
                        <br />• Custom integrations
                      </Typography>
                      <Button variant="outlined" size="sm">
                        Contact Sales
                      </Button>
                    </Box>
                  </Card>
                </Stack>
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card sx={{ mb: 3, borderRadius: 12 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Notifications sx={{ mr: 1, color: colors.primary }} />
              <Typography level="h4" sx={{ fontWeight: 700 }}>
                Notifications
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />

            <Stack spacing={2.5}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Email sx={{ mr: 1.5, color: "#6366F1" }} />
                  <Box>
                    <Typography level="title-md" sx={{ fontWeight: 600 }}>
                      Email Notifications
                    </Typography>
                    <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                      Receive updates via email
                    </Typography>
                  </Box>
                </Box>
                <Switch
                  checked={notifications.emailNotifications}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      emailNotifications: e.target.checked,
                    })
                  }
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Smartphone sx={{ mr: 1.5, color: "#10B981" }} />
                  <Box>
                    <Typography level="title-md" sx={{ fontWeight: 600 }}>
                      SMS Notifications
                    </Typography>
                    <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                      Receive text messages for important updates
                    </Typography>
                  </Box>
                </Box>
                <Switch
                  checked={notifications.smsNotifications}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      smsNotifications: e.target.checked,
                    })
                  }
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Notifications sx={{ mr: 1.5, color: "#F59E0B" }} />
                  <Box>
                    <Typography level="title-md" sx={{ fontWeight: 600 }}>
                      Push Notifications
                    </Typography>
                    <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                      Browser push notifications
                    </Typography>
                  </Box>
                </Box>
                <Switch
                  checked={notifications.pushNotifications}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      pushNotifications: e.target.checked,
                    })
                  }
                />
              </Box>

              <Divider />

              <Typography level="title-sm" sx={{ fontWeight: 700, mt: 1 }}>
                Alert Preferences
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography level="body-md">New Booking Alerts</Typography>
                <Switch
                  checked={notifications.bookingAlerts}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      bookingAlerts: e.target.checked,
                    })
                  }
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography level="body-md">Review & Rating Alerts</Typography>
                <Switch
                  checked={notifications.reviewAlerts}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      reviewAlerts: e.target.checked,
                    })
                  }
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography level="body-md">Promotional Updates</Typography>
                <Switch
                  checked={notifications.promotionAlerts}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      promotionAlerts: e.target.checked,
                    })
                  }
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card sx={{ mb: 3, borderRadius: 12 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Security sx={{ mr: 1, color: colors.primary }} />
              <Typography level="h4" sx={{ fontWeight: 700 }}>
                Security
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />

            <Stack spacing={2.5}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography level="title-md" sx={{ fontWeight: 600 }}>
                    Two-Factor Authentication
                  </Typography>
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    Add an extra layer of security to your account
                  </Typography>
                </Box>
                <Switch
                  checked={twoFactorAuth}
                  onChange={(e) => setTwoFactorAuth(e.target.checked)}
                />
              </Box>

              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1.5,
                  }}
                >
                  <Box>
                    <Typography level="title-md" sx={{ fontWeight: 600 }}>
                      Auto Logout
                    </Typography>
                    <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                      Automatically log out after inactivity
                    </Typography>
                  </Box>
                  <Switch
                    checked={autoLogout}
                    onChange={(e) => setAutoLogout(e.target.checked)}
                  />
                </Box>
                {autoLogout && (
                  <FormControl sx={{ maxWidth: 300 }}>
                    <FormLabel>Logout after (minutes)</FormLabel>
                    <Select
                      value={logoutTime}
                      onChange={(_, value) => setLogoutTime(value as string)}
                    >
                      <Option value="15">15 minutes</Option>
                      <Option value="30">30 minutes</Option>
                      <Option value="60">1 hour</Option>
                      <Option value="120">2 hours</Option>
                    </Select>
                  </FormControl>
                )}
              </Box>

              <Box>
                <Button variant="outlined" color="danger" fullWidth>
                  Change Password
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* General Settings Section */}
        <Card sx={{ mb: 3, borderRadius: 12 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Typography level="h4" sx={{ fontWeight: 700 }}>
                ⚙️ General Settings
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />

            <Stack spacing={3}>
              {/* Language */}
              <FormControl>
                <FormLabel>
                  <Language sx={{ fontSize: 18, mr: 1, verticalAlign: "middle" }} />
                  Language
                </FormLabel>
                <Select
                  value={language}
                  onChange={(_, value) => setLanguage(value as string)}
                >
                  <Option value="en">English</Option>
                  <Option value="tl">Tagalog</Option>
                  <Option value="ceb">Cebuano</Option>
                  <Option value="ilo">Ilocano</Option>
                </Select>
              </FormControl>

              {/* Timezone */}
              <FormControl>
                <FormLabel>
                  <Schedule sx={{ fontSize: 18, mr: 1, verticalAlign: "middle" }} />
                  Timezone
                </FormLabel>
                <Select
                  value={timezone}
                  onChange={(_, value) => setTimezone(value as string)}
                >
                  <Option value="Asia/Manila">Asia/Manila (PHT)</Option>
                  <Option value="Asia/Tokyo">Asia/Tokyo (JST)</Option>
                  <Option value="Asia/Singapore">Asia/Singapore (SGT)</Option>
                  <Option value="UTC">UTC</Option>
                </Select>
              </FormControl>

              {/* Currency */}
              <FormControl>
                <FormLabel>💱 Currency</FormLabel>
                <Select
                  value={currency}
                  onChange={(_, value) => setCurrency(value as string)}
                >
                  <Option value="PHP">Philippine Peso (₱)</Option>
                  <Option value="USD">US Dollar ($)</Option>
                  <Option value="EUR">Euro (€)</Option>
                  <Option value="JPY">Japanese Yen (¥)</Option>
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "flex-end",
            mt: 4,
          }}
        >
          <Button variant="outlined" color="neutral" size="lg">
            Reset to Default
          </Button>
          <Button
            variant="solid"
            size="lg"
            sx={{
              bgcolor: colors.primary,
              "&:hover": {
                bgcolor: colors.primary,
                opacity: 0.9,
              },
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default Settings;
