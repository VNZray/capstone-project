/**
 * Emergency Facilities Management Page
 * Admin CMS for managing emergency facilities (police, hospitals, fire stations, evacuation centers)
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { IoAdd } from "react-icons/io5";
import {
  Shield,
  Hospital,
  Flame,
  Home,
  Search,
  AlertCircle,
} from "lucide-react";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
import NoDataFound from "@/src/components/NoDataFound";
import DynamicTab from "@/src/components/ui/DynamicTab";
import Table, { type TableColumn } from "@/src/components/ui/Table";
import { Input, Chip, Stack, Select, Option, Grid, Box } from "@mui/joy";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";
import IconButton from "@/src/components/IconButton";

import EmergencyFacilityCard from "./components/EmergencyFacilityCard";
import EmergencyFacilityForm from "./components/EmergencyFacilityForm";
import EmergencyFacilityDetails from "./components/EmergencyFacilityDetails";
import Alert from "@/src/components/Alert";

import * as EmergencyFacilityService from "@/src/services/EmergencyFacilityService";
import type {
  EmergencyFacility,
  CreateEmergencyFacilityInput,
  FacilityType,
  FacilityStatus,
} from "@/src/types/EmergencyFacility";

type DisplayMode = "cards" | "table";

const FACILITY_TABS = [
  { id: "all", label: "All", icon: <AlertCircle size={16} /> },
  {
    id: "police_station",
    label: "Police Stations",
    icon: <Shield size={16} />,
  },
  { id: "hospital", label: "Hospitals", icon: <Hospital size={16} /> },
  { id: "fire_station", label: "Fire Stations", icon: <Flame size={16} /> },
  {
    id: "evacuation_center",
    label: "Evacuation Centers",
    icon: <Home size={16} />,
  },
];

const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  police_station: "Police Station",
  hospital: "Hospital",
  fire_station: "Fire Station",
  evacuation_center: "Evacuation Center",
};

const FACILITY_COLORS: Record<FacilityType, string> = {
  police_station: "#1976D2",
  hospital: "#D32F2F",
  fire_station: "#F57C00",
  evacuation_center: "#388E3C",
};

const STATUS_COLORS: Record<FacilityStatus, "success" | "neutral" | "warning"> =
  {
    active: "success",
    inactive: "neutral",
    under_maintenance: "warning",
  };

export default function EmergencyFacilities() {
  // State
  const [facilities, setFacilities] = useState<EmergencyFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState<FacilityStatus | "all">(
    "all"
  );
  const [display, setDisplay] = useState<DisplayMode>("cards");

  // Modal states
  const [isFormOpen, setFormOpen] = useState(false);
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] =
    useState<EmergencyFacility | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  // Fetch facilities
  const fetchFacilities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await EmergencyFacilityService.getAllEmergencyFacilities();
      setFacilities(data);
    } catch (err) {
      console.error("Error fetching facilities:", err);
      setError("Failed to load emergency facilities");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  // Filter facilities
  const filteredFacilities = useMemo(() => {
    let filtered = facilities;

    // Filter by type tab
    if (activeTab !== "all") {
      filtered = filtered.filter((f) => f.facility_type === activeTab);
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((f) => f.status === statusFilter);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.address?.toLowerCase().includes(query) ||
          f.barangay_name?.toLowerCase().includes(query) ||
          f.municipality_name?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [facilities, activeTab, statusFilter, searchQuery]);

  // Handlers
  const handleAddNew = () => {
    setSelectedFacility(null);
    setFormOpen(true);
  };

  const handleEdit = (facility: EmergencyFacility) => {
    setSelectedFacility(facility);
    setFormOpen(true);
    setDetailsOpen(false);
  };

  const handleView = (facility: EmergencyFacility) => {
    setSelectedFacility(facility);
    setDetailsOpen(true);
  };

  const handleDeleteClick = (facility: EmergencyFacility) => {
    setSelectedFacility(facility);
    setDeleteOpen(true);
  };

  const handleFormSubmit = async (data: CreateEmergencyFacilityInput) => {
    setSubmitting(true);
    try {
      if (selectedFacility) {
        await EmergencyFacilityService.updateEmergencyFacility(
          selectedFacility.id,
          data
        );
      } else {
        await EmergencyFacilityService.createEmergencyFacility(data);
      }
      await fetchFacilities();
      setFormOpen(false);
      setSelectedFacility(null);
    } catch (err) {
      console.error("Error saving facility:", err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFacility) return;
    setSubmitting(true);
    try {
      await EmergencyFacilityService.deleteEmergencyFacility(
        selectedFacility.id
      );
      await fetchFacilities();
      setDeleteOpen(false);
      setSelectedFacility(null);
    } catch (err) {
      console.error("Error deleting facility:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Table columns
  const columns: TableColumn<EmergencyFacility>[] = [
    {
      id: "name",
      label: "Name",
      minWidth: 200,
      render: (row) => (
        <Typography.Body weight="normal">{row.name}</Typography.Body>
      ),
    },
    {
      id: "facility_type",
      label: "Type",
      minWidth: 150,
      render: (row) => (
        <Chip
          size="sm"
          variant="soft"
          sx={{
            backgroundColor: `${FACILITY_COLORS[row.facility_type]}20`,
            color: FACILITY_COLORS[row.facility_type],
          }}
        >
          {FACILITY_TYPE_LABELS[row.facility_type]}
        </Chip>
      ),
    },
    {
      id: "address",
      label: "Location",
      minWidth: 250,
      render: (row) => (
        <Typography.Body size="sm" sx={{ color: "text.secondary" }}>
          {[row.barangay_name, row.municipality_name]
            .filter(Boolean)
            .join(", ")}
        </Typography.Body>
      ),
    },
    {
      id: "emergency_hotline",
      label: "Hotline",
      minWidth: 120,
      render: (row) => (
        <Typography.Body size="sm">
          {row.emergency_hotline || row.contact_phone || "-"}
        </Typography.Body>
      ),
    },
    {
      id: "status",
      label: "Status",
      minWidth: 130,
      render: (row) => (
        <Chip size="sm" variant="soft" color={STATUS_COLORS[row.status]}>
          {row.status.replace("_", " ")}
        </Chip>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      minWidth: 180,
      render: (row) => (
        <Stack direction="row" spacing={0.75}>
          <Button
            variant="outlined"
            colorScheme="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            colorScheme="error"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row);
            }}
          >
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  // Statistics
  const stats = useMemo(() => {
    const typeCount = facilities.reduce((acc, f) => {
      acc[f.facility_type] = (acc[f.facility_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { label: "Total", value: facilities.length, color: "#6B7280" },
      {
        label: "Police Stations",
        value: typeCount.police_station || 0,
        color: FACILITY_COLORS.police_station,
      },
      {
        label: "Hospitals",
        value: typeCount.hospital || 0,
        color: FACILITY_COLORS.hospital,
      },
      {
        label: "Fire Stations",
        value: typeCount.fire_station || 0,
        color: FACILITY_COLORS.fire_station,
      },
      {
        label: "Evacuation Centers",
        value: typeCount.evacuation_center || 0,
        color: FACILITY_COLORS.evacuation_center,
      },
    ];
  }, [facilities]);

  return (
    <PageContainer>
      {/* Page Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography.Header>Emergency Facilities</Typography.Header>
          <Typography.Body sx={{ color: "text.secondary" }}>
            Manage emergency facilities including police stations, hospitals,
            fire stations, and evacuation centers
          </Typography.Body>
        </Box>
        <Button onClick={handleAddNew} startDecorator={<IoAdd size={18} />}>
          Add Facility
        </Button>
      </Stack>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat) => (
          <Grid key={stat.label} xs={12} sm={6} md={2.4}>
            <Box
              sx={{
                p: 2,
                borderRadius: "md",
                backgroundColor: "background.surface",
                border: "1px solid",
                borderColor: "divider",
                textAlign: "center",
              }}
            >
              <Typography.Header
                sx={{ color: stat.color, fontSize: "1.75rem", mb: 0.5 }}
              >
                {stat.value}
              </Typography.Header>
              <Typography.Body size="sm" sx={{ color: "text.secondary" }}>
                {stat.label}
              </Typography.Body>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Container gap="16px" padding="0">
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          {/* Tabs */}
          <DynamicTab
            padding={0}
            tabs={FACILITY_TABS}
            activeTabId={activeTab}
            onChange={(tabId) => setActiveTab(String(tabId))}
          />

          {/* Search and Display Toggle */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Input
              placeholder="Search facilities..."
              startDecorator={<Search size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: 200 }}
            />

            <Select
              value={statusFilter}
              onChange={(_, value) =>
                setStatusFilter(value as FacilityStatus | "all")
              }
              sx={{ minWidth: 140 }}
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="under_maintenance">Maintenance</Option>
            </Select>

            <Stack direction="row" spacing={0.5}>
              <IconButton
                variant={display === "cards" ? "solid" : "outlined"}
                onClick={() => setDisplay("cards")}
              >
                <DashboardRoundedIcon />
              </IconButton>
              <IconButton
                variant={display === "table" ? "solid" : "outlined"}
                onClick={() => setDisplay("table")}
              >
                <TableRowsRoundedIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>

        {/* Content */}
        {loading ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography.Body>Loading facilities...</Typography.Body>
          </Box>
        ) : error ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography.Body sx={{ color: "danger.500" }}>
              {error}
            </Typography.Body>
            <Button variant="outlined" onClick={fetchFacilities} sx={{ mt: 2 }}>
              Retry
            </Button>
          </Box>
        ) : filteredFacilities.length === 0 ? (
          <NoDataFound
            title="No Emergency Facilities Found"
            message={
              searchQuery || activeTab !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters or search query"
                : "Get started by adding your first emergency facility"
            }
          >
            <Button onClick={handleAddNew} sx={{ mt: 2 }}>
              Add Facility
            </Button>
          </NoDataFound>
        ) : display === "cards" ? (
          <Grid container spacing={2}>
            {filteredFacilities.map((facility) => (
              <Grid key={facility.id} xs={12} sm={6} md={4} lg={3}>
                <EmergencyFacilityCard
                  facility={facility}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onView={handleView}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Table
            columns={columns}
            data={filteredFacilities}
            onRowClick={handleView}
            emptyMessage="No emergency facilities found"
          />
        )}
      </Container>

      {/* Modals */}
      <EmergencyFacilityForm
        isOpen={isFormOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedFacility(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={selectedFacility || undefined}
        isLoading={isSubmitting}
      />

      <EmergencyFacilityDetails
        isOpen={isDetailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedFacility(null);
        }}
        facility={selectedFacility}
        onEdit={handleEdit}
      />

      <Alert
        open={isDeleteOpen}
        type="warning"
        title="Delete Facility"
        message={`Are you sure you want to delete "${selectedFacility?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={isSubmitting}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedFacility(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </PageContainer>
  );
}
