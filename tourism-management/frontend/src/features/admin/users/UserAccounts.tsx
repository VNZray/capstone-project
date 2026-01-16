import React, { useState, useEffect, useMemo } from "react";
import { Input, Chip, Select, Option, Box, Stack, Avatar } from "@mui/joy";
import {
  Search,
  UserCircle,
  Building,
  Briefcase,
  Users,
  UserCheck,
  Clock,
  Mail,
  Phone,
  Calendar,
  Download,
  Upload,
  UserPlus,
} from "lucide-react";
import PageContainer from "@/src/components/PageContainer";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import DynamicTab from "@/src/components/ui/DynamicTab";
import NoDataFound from "@/src/components/NoDataFound";
import { apiService } from "@/src/utils/api";

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingApproval: number;
  businessOwners: number;
  growthPercentage: number;
  activePercentage: number;
}

interface User {
  id: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  user_role_id: number;
  role_name?: string;
  is_active: boolean;
  is_verified: boolean;
  is_online?: boolean;
  created_at: string;
  last_login?: string;
  last_seen?: string;
  last_activity?: string;
  phone_number?: string;
  user_profile?: string;
}

const UserAccounts: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingApproval: 0,
    businessOwners: 0,
    growthPercentage: 0,
    activePercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userTypeTab, setUserTypeTab] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        apiService.getUsers(),
        apiService.getUserStats(),
      ]);
      setUsers(usersData || []);
      setStats(statsData || stats);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    return {
      all: users.length,
      tourist: users.filter((u) => u.role_name === "Tourist").length,
      business_owner: users.filter((u) => u.role_name === "Business Owner")
        .length,
      tourism_staff: users.filter((u) => u.role_name === "Tourism Staff")
        .length,
    };
  }, [users]);

  const userTypeTabs = [
    {
      id: "all",
      label: "All Users",
      icon: <UserCircle size={16} />,
      count: tabCounts.all,
    },
    {
      id: "tourist",
      label: "Tourists",
      icon: <UserCircle size={16} />,
      count: tabCounts.tourist,
    },
    {
      id: "business_owner",
      label: "Business Owners",
      icon: <Building size={16} />,
      count: tabCounts.business_owner,
    },
    {
      id: "tourism_staff",
      label: "Tourism Staff",
      icon: <Briefcase size={16} />,
      count: tabCounts.tourism_staff,
    },
  ];

  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Filter by user type tab
    if (userTypeTab && userTypeTab !== "all") {
      const roleMap: Record<string, string> = {
        tourist: "Tourist",
        business_owner: "Business Owner",
        tourism_staff: "Tourism Staff",
      };
      filtered = filtered.filter(
        (user) => user.role_name === roleMap[userTypeTab]
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.email?.toLowerCase().includes(query) ||
          user.username?.toLowerCase().includes(query) ||
          user.first_name?.toLowerCase().includes(query) ||
          user.last_name?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        filtered = filtered.filter((user) => user.is_active);
      } else if (statusFilter === "inactive") {
        filtered = filtered.filter((user) => !user.is_active);
      } else if (statusFilter === "suspended") {
        filtered = filtered.filter((user) => !user.is_verified);
      }
    }

    return filtered;
  }, [users, searchQuery, userTypeTab, statusFilter]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return "Never";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60)
        return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24)
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
      return formatDate(dateString);
    } catch {
      return "Never";
    }
  };

  const getOnlineStatus = (user: User) => {
    if (user.is_online)
      return { status: "online", label: "Online", color: "#4CAF50" };

    if (!user.last_seen)
      return { status: "offline", label: "Offline", color: "#9E9E9E" };

    const lastSeenDate = new Date(user.last_seen);
    const now = new Date();
    const diffMins = Math.floor(
      (now.getTime() - lastSeenDate.getTime()) / 60000
    );

    if (diffMins < 5)
      return { status: "away", label: "Away", color: "#FF9800" };
    if (diffMins < 30)
      return { status: "idle", label: "Idle", color: "#FFC107" };
    return { status: "offline", label: "Offline", color: "#9E9E9E" };
  };

  const getLastActiveTime = (user: User) => {
    // Prioritize last_seen over last_login for more accurate "last active" time
    if (user.is_online) return "Active now";
    const lastActiveDate = user.last_seen || user.last_login;
    return formatRelativeTime(lastActiveDate);
  };

  const getInitials = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const getStatusColor = (user: User): "success" | "neutral" | "danger" => {
    if (!user.is_verified) return "neutral";
    if (user.is_active) return "success";
    return "danger";
  };

  const getStatusLabel = (user: User): string => {
    if (!user.is_verified) return "pending";
    if (user.is_active) return "active";
    return "inactive";
  };

  const getUserTypeColor = (
    roleName?: string
  ): "primary" | "warning" | "neutral" => {
    if (roleName === "Tourism Staff") return "primary";
    if (roleName === "Business Owner") return "warning";
    return "neutral";
  };

  return (
    <PageContainer>
      <Container gap="0" padding="0" elevation={3}>
        {/* Header */}
        <Container
          direction="row"
          justify="space-between"
          align="center"
          padding="24px 24px 0 24px"
          style={{ flexWrap: "wrap", rowGap: 12, columnGap: 12 }}
        >
          <Box>
            <Typography.Header>User Accounts</Typography.Header>
            <Typography.Body size="sm" sx={{ color: "#666", mt: 0.5 }}>
              Manage and monitor all user accounts across the platform
            </Typography.Body>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              colorScheme="gray"
              startDecorator={<Download size={18} />}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              colorScheme="gray"
              startDecorator={<Upload size={18} />}
            >
              Import
            </Button>
            <Button
              variant="solid"
              colorScheme="primary"
              startDecorator={<UserPlus size={18} />}
            >
              Add User
            </Button>
          </Stack>
        </Container>

        {/* Stats Cards */}
        <Container padding="24px" gap="1rem">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 2,
            }}
          >
            {/* Total Users */}
            <Box
              sx={{
                backgroundColor: "#E3F2FD",
                borderRadius: "12px",
                padding: "20px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box>
                  <Typography.Label sx={{ color: "#1976D2", mb: 1 }}>
                    Total Users
                  </Typography.Label>
                  <Typography.Header
                    size="lg"
                    sx={{ color: "#1565C0", mb: 0.5 }}
                  >
                    {stats.totalUsers}
                  </Typography.Header>
                  <Typography.Body size="xs" sx={{ color: "#1976D2" }}>
                    +{stats.growthPercentage}% from last month
                  </Typography.Body>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "#BBDEFB",
                    borderRadius: "50%",
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Users size={24} color="#1565C0" />
                </Box>
              </Stack>
            </Box>

            {/* Active Users */}
            <Box
              sx={{
                backgroundColor: "#E8F5E9",
                borderRadius: "12px",
                padding: "20px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box>
                  <Typography.Label sx={{ color: "#388E3C", mb: 1 }}>
                    Active Users
                  </Typography.Label>
                  <Typography.Header
                    size="lg"
                    sx={{ color: "#2E7D32", mb: 0.5 }}
                  >
                    {stats.activeUsers}
                  </Typography.Header>
                  <Typography.Body size="xs" sx={{ color: "#388E3C" }}>
                    {stats.activePercentage}% of total
                  </Typography.Body>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "#C8E6C9",
                    borderRadius: "50%",
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UserCheck size={24} color="#2E7D32" />
                </Box>
              </Stack>
            </Box>

            {/* Pending Approval */}
            <Box
              sx={{
                backgroundColor: "#FFF9C4",
                borderRadius: "12px",
                padding: "20px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box>
                  <Typography.Label sx={{ color: "#F57C00", mb: 1 }}>
                    Pending Approval
                  </Typography.Label>
                  <Typography.Header
                    size="lg"
                    sx={{ color: "#EF6C00", mb: 0.5 }}
                  >
                    {stats.pendingApproval}
                  </Typography.Header>
                  <Typography.Body size="xs" sx={{ color: "#F57C00" }}>
                    Requires attention
                  </Typography.Body>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "#FFF59D",
                    borderRadius: "50%",
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Clock size={24} color="#EF6C00" />
                </Box>
              </Stack>
            </Box>

            {/* Business Owners */}
            <Box
              sx={{
                backgroundColor: "#F3E5F5",
                borderRadius: "12px",
                padding: "20px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box>
                  <Typography.Label sx={{ color: "#7B1FA2", mb: 1 }}>
                    Business Owners
                  </Typography.Label>
                  <Typography.Header
                    size="lg"
                    sx={{ color: "#6A1B9A", mb: 0.5 }}
                  >
                    {stats.businessOwners}
                  </Typography.Header>
                  <Typography.Body size="xs" sx={{ color: "#7B1FA2" }}>
                    Verified accounts
                  </Typography.Body>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "#E1BEE7",
                    borderRadius: "50%",
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Building size={24} color="#6A1B9A" />
                </Box>
              </Stack>
            </Box>
          </Box>
        </Container>

        {/* Search and Filters */}
        <Container
          padding="0 24px 20px 24px"
          direction="row"
          justify="space-between"
          align="center"
          gap="1rem"
        >
          <Input
            startDecorator={<Search />}
            placeholder="Search by email, username, or name..."
            size="lg"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1 }}
          />

          <Select
            size="lg"
            value={statusFilter}
            onChange={(_, v) => setStatusFilter((v as any) ?? "all")}
            sx={{ minWidth: 160 }}
          >
            <Option value="all">All Status</Option>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
            <Option value="suspended">Suspended</Option>
          </Select>
        </Container>

        {/* User Type Tabs */}
        <DynamicTab
          tabs={userTypeTabs}
          activeTabId={userTypeTab}
          onChange={(tabId) => setUserTypeTab(String(tabId))}
        />
      </Container>

      {/* User Cards */}
      <Container background="transparent" padding="0">
        {loading ? (
          <Container
            align="center"
            justify="center"
            padding="4rem"
            style={{ minHeight: "400px" }}
          >
            <div className="loading-spinner" />
            <Typography.Body
              size="normal"
              sx={{ color: "#666", marginTop: "1rem" }}
            >
              Loading users...
            </Typography.Body>
          </Container>
        ) : filteredUsers.length === 0 && searchQuery.trim() !== "" ? (
          <NoDataFound
            icon="search"
            title="No Results Found"
            message={`No users match "${searchQuery}". Try a different search term.`}
          />
        ) : filteredUsers.length === 0 ? (
          <NoDataFound
            icon="database"
            title="No Users Found"
            message="No user accounts in the system yet."
          />
        ) : (
          <Container padding="0" gap="1rem">
            {filteredUsers.map((user) => {
              const onlineStatus = getOnlineStatus(user);
              return (
                <Box
                  key={user.id}
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    padding: "20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    border: "1px solid #f0f0f0",
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                      borderColor: "#e0e0e0",
                    },
                  }}
                >
                  <Stack direction="row" spacing={2.5} alignItems="flex-start">
                    {/* Avatar with Online Indicator */}
                    <Box sx={{ position: "relative" }}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          backgroundColor: "#1976D2",
                          fontSize: "1.2rem",
                          fontWeight: 600,
                        }}
                      >
                        {getInitials(user)}
                      </Avatar>
                      {/* Online Status Dot */}
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 2,
                          right: 2,
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          backgroundColor: onlineStatus.color,
                          border: "2px solid white",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                      />
                    </Box>

                    {/* User Info */}
                    <Box sx={{ flex: 1 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ mb: 0.5, flexWrap: "wrap", gap: 0.75 }}
                      >
                        <Typography.CardTitle size="sm">
                          {user.first_name && user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : user.username || user.email}
                        </Typography.CardTitle>

                        {user.role_name && (
                          <Chip
                            size="sm"
                            variant="soft"
                            color={getUserTypeColor(user.role_name)}
                            sx={{ fontWeight: 500 }}
                          >
                            {user.role_name}
                          </Chip>
                        )}

                        <Chip
                          size="sm"
                          variant="solid"
                          color={getStatusColor(user)}
                          startDecorator={
                            getStatusLabel(user) === "active" ? (
                              <UserCheck size={12} />
                            ) : null
                          }
                          sx={{ fontWeight: 500 }}
                        >
                          {getStatusLabel(user)}
                        </Chip>
                      </Stack>

                      {/* Contact Info */}
                      <Stack
                        direction="row"
                        spacing={2.5}
                        sx={{ mb: 1, flexWrap: "wrap" }}
                      >
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <Mail size={14} color="#666" />
                          <Typography.Body size="sm" sx={{ color: "#666" }}>
                            {user.email}
                          </Typography.Body>
                        </Stack>

                        {user.phone_number && (
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                          >
                            <Phone size={14} color="#666" />
                            <Typography.Body size="sm" sx={{ color: "#666" }}>
                              {user.phone_number}
                            </Typography.Body>
                          </Stack>
                        )}

                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <Calendar size={14} color="#666" />
                          <Typography.Body size="sm" sx={{ color: "#666" }}>
                            Joined {formatDate(user.created_at)}
                          </Typography.Body>
                        </Stack>
                      </Stack>

                      {/* Last Active with Online Status */}
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Typography.Body
                          size="xs"
                          sx={{
                            color: onlineStatus.color,
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              backgroundColor: onlineStatus.color,
                              display: "inline-block",
                            }}
                          />
                          {onlineStatus.label}
                        </Typography.Body>
                        <Typography.Body size="xs" sx={{ color: "#999" }}>
                          • Last active: {getLastActiveTime(user)}
                        </Typography.Body>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Container>
        )}
      </Container>

      {/* Pagination Info */}
      {!loading && filteredUsers.length > 0 && (
        <Container padding="1rem 0" background="transparent">
          <Typography.Body
            size="sm"
            sx={{ color: "#666", textAlign: "center" }}
          >
            Showing {filteredUsers.length} of {users.length} users
          </Typography.Body>
        </Container>
      )}
    </PageContainer>
  );
};

export default UserAccounts;
