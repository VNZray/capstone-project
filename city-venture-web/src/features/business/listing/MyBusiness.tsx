import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { useBusiness } from "@/src/context/BusinessContext";
import Card from "@/src/components/Card";
import placeholderImage from "@/src/assets/images/placeholder-image.png";
import type { Business } from "@/src/types/Business";
import { fetchBusinessesByOwner } from "@/src/services/BusinessService";
import { colors } from "@/src/utils/Colors";
import { useMediaQuery } from "@mui/system";
import {
  Button,
  Typography,
  Avatar,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  ListDivider,
  Chip,
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanel,
} from "@mui/joy";
import { Add, HourglassEmpty, Cancel, CheckCircle } from "@mui/icons-material";
import logo from "@/src/assets/images/logo.png";
import "./MyBusiness.css";

const MyBusiness = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { setBusinessId } = useBusiness();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const ownerId = user?.id;

  // Responsive breakpoint - switch to grid variant on small screens
  const isSmallDevice = useMediaQuery("(max-width: 768px)");

  // Filter businesses by status
  const approvedBusinesses = businesses.filter(
    (business) =>
      business.status === "Approved" ||
      business.status === "Active" ||
      business.status === "Inactive"
  );
  const pendingBusinesses = businesses.filter(
    (business) => business.status === "Pending"
  );
  const rejectedBusinesses = businesses.filter(
    (business) => business.status === "Rejected"
  );

  useEffect(() => {
    console.log("Owner ID:", ownerId);

    if (!ownerId) return;

    const loadBusinesses = async () => {
      try {
        const data = await fetchBusinessesByOwner(ownerId!);
        setBusinesses(data);
      } catch (err) {
        console.error("Error fetching businesses:", err);
      }
    };

    loadBusinesses();
  }, [ownerId]);
  // Profile header removed for compact design

  return (
    <div
      className="myb-page"
      style={{
        background: `radial-gradient(1200px 600px at 20% 20%, rgba(255,255,255,0.08), transparent 60%), linear-gradient(120deg, ${colors.primary} 0%, #0F172A 55%, #1F2937 100%)`,
      }}
    >
      {/* Center card */}
      <div className="myb-card">
        {/* Top bar: brand (left) + profile (right) */}
        <div className="myb-topbar">
          <div
            className="myb-brand"
            role="button"
            onClick={() => navigate("/")}
          >
            <img src={logo} alt="City Venture" className="myb-brand-logo" />
            <Typography
              level="title-lg"
              sx={{
                fontWeight: 700,
                fontSize: 20,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: colors.primary,
              }}
            >
              City Venture
            </Typography>
          </div>
          <div className="myb-profile-actions">
            <Dropdown>
              <MenuButton
                slots={{ root: Avatar }}
                slotProps={{
                  root: {
                    sx: {
                      width: 50,
                      height: 50,
                      borderRadius: 8, // square with curved edges
                      background:
                        "linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #10b981 100%)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "1.2rem",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      },
                    },
                  },
                }}
              >
                {user
                  ? `${(user.first_name ?? "").charAt(0)}${(
                      user.last_name ?? ""
                    ).charAt(0)}`.toUpperCase()
                  : "U"}
              </MenuButton>
              <Menu
                placement="bottom-end"
                size="sm"
                sx={{
                  minWidth: 220,
                  borderRadius: 12,
                  mt: 1.5,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                }}
              >
                {/* header with display name */}
                <MenuItem disabled sx={{ fontWeight: 600 }}>
                  {user
                    ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
                    : ""}
                </MenuItem>
                <ListDivider />
                <MenuItem
                  onClick={() => navigate("/business/profile")}
                  sx={{ fontWeight: 600 }}
                >
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={() => navigate("/business/settings")}
                  sx={{ fontWeight: 600 }}
                >
                  Settings
                </MenuItem>
                {user?.role_name === "Admin" && (
                  <MenuItem
                    onClick={() => navigate("/tourism/dashboard")}
                    sx={{ fontWeight: 600 }}
                  >
                    Admin Dashboard
                  </MenuItem>
                )}
                <ListDivider />
                <MenuItem
                  color="danger"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  sx={{ fontWeight: 600 }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </Dropdown>
          </div>
        </div>

        {/* Sub header: title + CTA (below icons) */}
        <div className="myb-card-header">
          <Typography
            level="h4"
            sx={{ fontWeight: 800, color: colors.primary }}
          >
            My Businesses
          </Typography>
          <Button
            variant="solid"
            size="md"
            startDecorator={<Add />}
            onClick={() => navigate("/business/register")}
            sx={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, #0a1a3d 100%)`,
              borderRadius: 10,
              px: 2,
              py: 1,
              fontWeight: 600,
              fontSize: ".95rem",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              border: `2px solid ${colors.primary}`,
              "&:hover": {
                background: `linear-gradient(135deg, #0a1a3d 0%, ${colors.primary} 100%)`,
                boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                "& .MuiSvgIcon-root": {
                  transform: "rotate(90deg)",
                },
              },
              "&:active": {
                transform: "translateY(0) scale(1)",
                transition: "all 0.1s ease",
              },
            }}
          >
            Register Business
          </Button>
        </div>

        {/* Tabs Section */}
        <Tabs
          value={activeTab}
          onChange={(_event, newValue) => setActiveTab(newValue as number)}
          sx={{ width: "100%" }}
        >
          <TabList
            sx={{
              borderRadius: 12,
              bgcolor: "background.level1",
              p: 0.5,
              mb: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Tab
              value={0}
              sx={{
                flex: 1,
                borderRadius: 10,
                fontWeight: 600,
                transition: "all 0.2s ease",
                "&.Mui-selected": {
                  bgcolor: colors.primary,
                  color: "white",
                },
              }}
            >
              <CheckCircle sx={{ fontSize: 18, mr: 1 }} />
              Active ({approvedBusinesses.length})
            </Tab>
            <Tab
              value={1}
              sx={{
                flex: 1,
                borderRadius: 10,
                fontWeight: 600,
                transition: "all 0.2s ease",
                "&.Mui-selected": {
                  bgcolor: "#F59E0B",
                  color: "white",
                },
              }}
              disabled={pendingBusinesses.length === 0}
            >
              <HourglassEmpty sx={{ fontSize: 18, mr: 1 }} />
              Pending ({pendingBusinesses.length})
            </Tab>
            <Tab
              value={2}
              sx={{
                flex: 1,
                borderRadius: 10,
                fontWeight: 600,
                transition: "all 0.2s ease",
                "&.Mui-selected": {
                  bgcolor: "#EF4444",
                  color: "white",
                },
              }}
              disabled={rejectedBusinesses.length === 0}
            >
              <Cancel sx={{ fontSize: 18, mr: 1 }} />
              Rejected ({rejectedBusinesses.length})
            </Tab>
          </TabList>

          {/* Active Businesses Tab */}
          <TabPanel value={0} sx={{ p: 0 }}>
            {approvedBusinesses.length > 0 ? (
              <Box>
                <Typography level="body-sm" sx={{ color: "#6B7280", mb: 2 }}>
                  You have {approvedBusinesses.length} active{" "}
                  {approvedBusinesses.length === 1 ? "listing" : "listings"}
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: isSmallDevice
                      ? "1fr"
                      : "repeat(auto-fill, minmax(1fr, 1fr))",
                    gap: 2,
                  }}
                >
                  {approvedBusinesses.map((business) => (
                    <Card
                      key={business.id}
                      size={isSmallDevice ? "default" : "sm"}
                      variant={"list"}
                      image={business.business_image || placeholderImage}
                      aspectRatio="1/1"
                      title={business.business_name}
                      subtitle={
                        business.business_type_id === 1
                          ? "Accommodation"
                          : "Shop"
                      }
                      elevation={2}
                      onClick={() => {
                        setBusinessId(business.id!);
                        navigate(`/business/dashboard`);
                      }}
                    >
                      <Chip
                        size="sm"
                        color="success"
                        variant="soft"
                        sx={{ fontWeight: 600 }}
                      >
                        {business.status}
                      </Chip>
                    </Card>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  textAlign: "center",
                  py: 6,
                  color: "#9CA3AF",
                }}
              >
                <CheckCircle sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                <Typography level="body-lg" sx={{ fontWeight: 600 }}>
                  No active businesses yet
                </Typography>
                <Typography level="body-sm">
                  Register a business to get started
                </Typography>
              </Box>
            )}
          </TabPanel>

          {/* Pending Businesses Tab */}
          <TabPanel value={1} sx={{ p: 0 }}>
            {pendingBusinesses.length > 0 ? (
              <Box>
                <Typography level="body-sm" sx={{ color: "#6B7280", mb: 2 }}>
                  {pendingBusinesses.length}{" "}
                  {pendingBusinesses.length === 1
                    ? "business is"
                    : "businesses are"}{" "}
                  awaiting approval
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: isSmallDevice
                      ? "1fr"
                      : "repeat(auto-fill, minmax(350px, 1fr))",
                    gap: 2,
                  }}
                >
                  {pendingBusinesses.map((business) => (
                    <Card
                      key={business.id}
                      size={isSmallDevice ? "default" : "md"}
                      variant={isSmallDevice ? "grid" : "list"}
                      image={business.business_image || placeholderImage}
                      aspectRatio="16/9"
                      title={business.business_name}
                      subtitle={
                        business.business_type_id === 1
                          ? "Accommodation"
                          : "Shop"
                      }
                      elevation={2}
                    >
                      <Chip
                        color="warning"
                        variant="soft"
                        size="sm"
                        startDecorator={<HourglassEmpty />}
                        sx={{ fontWeight: 600 }}
                      >
                        Under Review
                      </Chip>
                    </Card>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  textAlign: "center",
                  py: 6,
                  color: "#9CA3AF",
                }}
              >
                <HourglassEmpty sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                <Typography level="body-lg" sx={{ fontWeight: 600 }}>
                  No pending registrations
                </Typography>
              </Box>
            )}
          </TabPanel>

          {/* Rejected Businesses Tab */}
          <TabPanel value={2} sx={{ p: 0 }}>
            {rejectedBusinesses.length > 0 ? (
              <Box>
                <Typography level="body-sm" sx={{ color: "#6B7280", mb: 2 }}>
                  {rejectedBusinesses.length}{" "}
                  {rejectedBusinesses.length === 1
                    ? "registration was"
                    : "registrations were"}{" "}
                  denied
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: isSmallDevice
                      ? "1fr"
                      : "repeat(auto-fill, minmax(350px, 1fr))",
                    gap: 2,
                  }}
                >
                  {rejectedBusinesses.map((business) => (
                    <Card
                      key={business.id}
                      size={isSmallDevice ? "default" : "md"}
                      variant={isSmallDevice ? "grid" : "list"}
                      image={business.business_image || placeholderImage}
                      aspectRatio="16/9"
                      title={business.business_name}
                      subtitle={
                        business.business_type_id === 1
                          ? "Accommodation"
                          : "Shop"
                      }
                      elevation={2}
                      hoverEffect="lift"
                      actions={[
                        {
                          label: "Resubmit Application",
                          onClick: () => {
                            setBusinessId(business.id!);
                            navigate(`/business/register?edit=${business.id}`);
                          },
                          variant: "outlined",
                          colorScheme: "primary",
                        },
                      ]}
                    >
                      <Chip
                        color="danger"
                        variant="soft"
                        size="sm"
                        startDecorator={<Cancel />}
                        sx={{ fontWeight: 600 }}
                      >
                        Denied
                      </Chip>
                    </Card>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  textAlign: "center",
                  py: 6,
                  color: "#9CA3AF",
                }}
              >
                <Cancel sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                <Typography level="body-lg" sx={{ fontWeight: 600 }}>
                  No rejected registrations
                </Typography>
              </Box>
            )}
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
};

export default MyBusiness;
