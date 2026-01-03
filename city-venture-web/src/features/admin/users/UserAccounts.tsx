import React, { useState, useEffect, useMemo } from "react";
import { Input, Chip, Select, Option } from "@mui/joy";
import { Search, UserCircle, Building, Briefcase } from "lucide-react";
import PageContainer from "@/src/components/PageContainer";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import DynamicTab from "@/src/components/ui/DynamicTab";
import Table, { type TableColumn } from "@/src/components/ui/Table";
import NoDataFound from "@/src/components/NoDataFound";
import { apiService } from "@/src/utils/api";

interface User {
  id: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  user_type: "tourist" | "tourism_staff" | "business_owner";
  status: "active" | "inactive" | "suspended";
  created_at: string;
  phone_number?: string;
  profile_picture?: string;
}

const UserAccounts: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userTypeTab, setUserTypeTab] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const userTypeTabs = [
    { id: "all", label: "All Users", icon: <UserCircle size={16} /> },
    { id: "tourist", label: "Tourists", icon: <UserCircle size={16} /> },
    {
      id: "business_owner",
      label: "Business Owners",
      icon: <Building size={16} />,
    },
    {
      id: "tourism_staff",
      label: "Tourism Staff",
      icon: <Briefcase size={16} />,
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API endpoint
      const response = await apiService.getUsers();
      setUsers(response || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Filter by user type tab
    if (userTypeTab && userTypeTab !== "all") {
      filtered = filtered.filter((user) => user.user_type === userTypeTab);
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
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    return filtered;
  }, [users, searchQuery, userTypeTab, statusFilter]);

  const getUserTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      tourist: "Tourist",
      business_owner: "Business Owner",
      tourism_staff: "Tourism Staff",
    };
    return labels[type] || type;
  };

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

  const columns: TableColumn<User>[] = [
    {
      id: "email",
      label: "Email",
      minWidth: 250,
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Typography.Body weight="semibold">{row.email}</Typography.Body>
          {row.username && (
            <Typography.Body size="sm" sx={{ opacity: 0.7 }}>
              @{row.username}
            </Typography.Body>
          )}
        </div>
      ),
    },
    {
      id: "name",
      label: "Name",
      minWidth: 200,
      render: (row) => (
        <Typography.Body>
          {row.first_name || row.last_name
            ? `${row.first_name || ""} ${row.last_name || ""}`.trim()
            : "-"}
        </Typography.Body>
      ),
    },
    {
      id: "user_type",
      label: "User Type",
      minWidth: 150,
      render: (row) => (
        <Chip
          color={
            row.user_type === "tourism_staff"
              ? "primary"
              : row.user_type === "business_owner"
              ? "warning"
              : "neutral"
          }
          variant="soft"
          size="md"
        >
          {getUserTypeLabel(row.user_type)}
        </Chip>
      ),
    },
    {
      id: "status",
      label: "Status",
      minWidth: 120,
      render: (row) => (
        <Chip
          color={
            row.status === "active"
              ? "success"
              : row.status === "suspended"
              ? "danger"
              : "neutral"
          }
          variant="soft"
          size="md"
        >
          {row.status}
        </Chip>
      ),
    },
    {
      id: "phone_number",
      label: "Phone",
      minWidth: 150,
      render: (row) => (
        <Typography.Body>{row.phone_number || "-"}</Typography.Body>
      ),
    },
    {
      id: "created_at",
      label: "Joined Date",
      minWidth: 150,
      render: (row) => (
        <Typography.Body size="sm">
          {formatDate(row.created_at)}
        </Typography.Body>
      ),
    },
  ];

  return (
    <PageContainer>
      <Container gap="0" padding="0" elevation={3}>
        {/* Header */}
        <Container
          direction="row"
          justify="space-between"
          align="center"
          padding="16px 16px 0 16px"
          style={{ flexWrap: "wrap", rowGap: 12, columnGap: 12 }}
        >
          <Typography.Header>User Accounts</Typography.Header>
        </Container>

        {/* Search and Filters */}
        <Container
          padding="20px 20px 0 20px"
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

          {/* Status Filter */}
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

      {/* Table */}
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
          <Table
            columns={columns}
            data={filteredUsers}
            rowKey="id"
            rowsPerPage={15}
            loading={loading}
            emptyMessage="No users found"
            stickyHeader
            maxHeight="600px"
          />
        )}
      </Container>
    </PageContainer>
  );
};

export default UserAccounts;
