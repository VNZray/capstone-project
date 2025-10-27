import { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Button,
  Stack,
  Box,
  Card,
  Table,
  Chip,
  IconButton,
  Sheet,
  CircularProgress,
  Snackbar,
} from "@mui/joy";
import { FiPlus, FiEdit2, FiTrash2, FiClock, FiGrid, FiList, FiCheckCircle, FiAlertCircle, FiTag } from "react-icons/fi";
import PageContainer from "@/src/components/PageContainer";
import { useBusiness } from "@/src/context/BusinessContext";
import * as ServiceApi from "@/src/services/ServiceApi";
import * as ShopCategoryService from "@/src/services/ShopCategoryService";
import ServiceFormModal from "./components/ServiceFormModal";
import { useNavigate } from "react-router-dom";
import type {
  Service,
  CreateServicePayload,
} from "@/src/types/Service";
import type { ShopCategory, ShopCategoryAssignment, CreateShopCategoryPayload } from "@/src/types/ShopCategory";

export default function Services() {
  const navigate = useNavigate();
  const { businessDetails } = useBusiness();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  // Modal states
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter services by selected category
  const filteredServices = selectedCategoryId
    ? services.filter(service => 
        service.categories?.some((cat: ShopCategoryAssignment) => cat.id === selectedCategoryId)
      )
    : services;

  // Fetch services and categories
  const fetchData = useCallback(async () => {
    if (!businessDetails?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const [servicesData, categoriesData] = await Promise.all([
        ServiceApi.fetchServicesByBusinessId(businessDetails.id),
        ShopCategoryService.fetchShopCategoriesByBusinessIdAndType(businessDetails.id, 'service'),
      ]);
      
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError("Failed to load services.");
      setServices([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [businessDetails?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle add/edit service
  const handleServiceSubmit = async (payload: CreateServicePayload) => {
    if (!businessDetails?.id) return;

    try {
      if (selectedService) {
        await ServiceApi.updateService(selectedService.id, payload);
        setSuccess("Service updated successfully!");
      } else {
        await ServiceApi.createService(payload);
        setSuccess("Service added successfully!");
      }
      
      await fetchData();
      setServiceModalOpen(false);
      setSelectedService(null);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving service:", err);
      throw err;
    }
  };

  // Handle category creation
  const handleCategoryCreate = async (payload: CreateShopCategoryPayload): Promise<ShopCategory> => {
    if (!businessDetails?.id) {
      throw new Error("Business not selected");
    }

    try {
      const newCategory = await ShopCategoryService.createShopCategory(payload);
      setSuccess("Category created successfully!");

      const categoriesData = await ShopCategoryService.fetchShopCategoriesByBusinessIdAndType(businessDetails.id, 'service');
      setCategories(categoriesData);

      setTimeout(() => setSuccess(null), 3000);
      return newCategory;
    } catch (err) {
      console.error("Error creating category:", err);
      throw err;
    }
  };

  // Handle delete service
  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      await ServiceApi.deleteService(serviceId);
      setSuccess("Service deleted successfully!");
      await fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting service:", err);
      setError("Failed to delete service.");
      setTimeout(() => setError(null), 5000);
    }
  };

  // Format price
  const formatPrice = (price: number | string | undefined): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return (numPrice || 0).toFixed(2);
  };

  // Format status
  const formatStatus = (status: string | undefined): string => {
    if (!status) return "UNKNOWN";
    return status.replace("_", " ").toUpperCase();
  };

  const getStatusColor = (status: string | undefined): "success" | "neutral" | "danger" => {
    if (!status) return "neutral";
    if (status === "active") return "success";
    if (status === "inactive") return "neutral";
    return "danger";
  };

  // Format price type
  const formatPriceType = (priceType: string | undefined): string => {
    if (!priceType) return "";
    return priceType.replace("_", " ");
  };

  // Format contact methods
  const formatContactMethods = (methods: Array<{ type: string; value: string }> | undefined): string => {
    if (!methods || methods.length === 0) return "—";
    return methods.map(m => `${m.type}: ${m.value}`).join(", ");
  };

  if (!businessDetails) {
    return (
      <PageContainer>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography level="body-lg" color="neutral">
            Please select a business to manage services.
          </Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Typography level="h2" fontWeight={700}>
              Services
            </Typography>
            <Typography level="body-sm" color="neutral">
              Manage your service offerings and bookings
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            {/* View Toggle */}
            <Stack direction="row" spacing={1}>
              <IconButton
                variant={viewMode === "table" ? "solid" : "outlined"}
                color={viewMode === "table" ? "primary" : "neutral"}
                onClick={() => setViewMode("table")}
              >
                <FiList />
              </IconButton>
              <IconButton
                variant={viewMode === "grid" ? "solid" : "outlined"}
                color={viewMode === "grid" ? "primary" : "neutral"}
                onClick={() => setViewMode("grid")}
              >
                <FiGrid />
              </IconButton>
            </Stack>
            
            {/* Manage Categories Button */}
            <Button
              variant="outlined"
              color="neutral"
              startDecorator={<FiTag />}
              onClick={() => navigate("/business/store/service-categories")}
            >
              Manage Categories
            </Button>
            
            {/* Add Service Button */}
            <Button
              startDecorator={<FiPlus />}
              onClick={() => {
                setSelectedService(null);
                setServiceModalOpen(true);
              }}
            >
              Add Service
            </Button>
          </Stack>
        </Stack>

        {/* Category Filter Chips */}
        {!loading && categories.length > 0 && (
          <Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
              <Chip
                size="lg"
                variant={selectedCategoryId === null ? "solid" : "outlined"}
                color={selectedCategoryId === null ? "primary" : "neutral"}
                onClick={() => setSelectedCategoryId(null)}
                sx={{ cursor: "pointer" }}
              >
                All Services ({services.length})
              </Chip>
              {categories.slice(0, 10).map((category) => {
                const serviceCount = services.filter(service =>
                  service.categories?.some((cat: ShopCategoryAssignment) => cat.id === category.id)
                ).length;
                
                return (
                  <Chip
                    key={category.id}
                    size="lg"
                    variant={selectedCategoryId === category.id ? "solid" : "outlined"}
                    color={selectedCategoryId === category.id ? "primary" : "neutral"}
                    onClick={() => setSelectedCategoryId(category.id)}
                    sx={{ cursor: "pointer" }}
                  >
                    {category.name} ({serviceCount})
                  </Chip>
                );
              })}
            </Stack>
          </Box>
        )}

        {/* Loading State */}
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {/* Table View */}
        {!loading && viewMode === "table" && Array.isArray(filteredServices) && filteredServices.length > 0 && (
          <Sheet variant="outlined" sx={{ borderRadius: "sm", overflow: "hidden" }}>
            <Table>
              <thead>
                <tr>
                  <th style={{ width: "30%" }}>Service</th>
                  <th style={{ width: "15%" }}>Category</th>
                  <th style={{ width: "15%" }}>Price</th>
                  <th style={{ width: "15%" }}>Contact</th>
                  <th style={{ width: "10%" }}>Status</th>
                  <th style={{ width: "10%", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.filter(service => service && service.id).map((service) => (
                  <tr key={service.id}>
                    <td>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "sm",
                            bgcolor: "background.level2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FiClock size={20} />
                        </Box>
                        <Box>
                          <Typography level="body-sm" fontWeight={600}>
                            {service.name || 'Untitled Service'}
                          </Typography>
                          {service.description && (
                            <Typography level="body-xs" color="neutral" noWrap>
                              {service.description}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </td>
                    <td>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {service.categories && service.categories.length > 0 ? (
                          service.categories.map((cat: ShopCategoryAssignment) => (
                            <Chip
                              key={cat.id}
                              size="sm"
                              variant={cat.is_primary ? "solid" : "outlined"}
                              color={cat.is_primary ? "primary" : "neutral"}
                            >
                              {cat.name}
                            </Chip>
                          ))
                        ) : (
                          <Typography level="body-sm" color="neutral">No Category</Typography>
                        )}
                      </Stack>
                    </td>
                    <td>
                      <Typography level="body-sm" fontWeight={600}>
                        ₱{formatPrice(service.base_price)}
                      </Typography>
                      <Typography level="body-xs" color="neutral">
                        {formatPriceType(service.price_type)}
                      </Typography>
                    </td>
                    <td>
                      <Typography level="body-sm">
                        {formatContactMethods(service.contact_methods)}
                      </Typography>
                    </td>
                    <td>
                      <Chip
                        size="sm"
                        color={getStatusColor(service.status)}
                        variant="soft"
                      >
                        {formatStatus(service.status)}
                      </Chip>
                    </td>
                    <td>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="neutral"
                          onClick={() => {
                            setSelectedService(service);
                            setServiceModalOpen(true);
                          }}
                        >
                          <FiEdit2 />
                        </IconButton>
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="danger"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          <FiTrash2 />
                        </IconButton>
                      </Stack>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Sheet>
        )}

        {/* Grid View */}
        {!loading && viewMode === "grid" && Array.isArray(filteredServices) && filteredServices.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 2,
            }}
          >
            {filteredServices.filter(service => service && service.id).map((service) => (
              <Card key={service.id} variant="outlined">
                <Box sx={{ position: "relative", mb: 2 }}>
                  <Box
                    sx={{
                      width: "100%",
                      height: 120,
                      bgcolor: "background.level2",
                      borderRadius: "sm",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FiClock size={48} />
                  </Box>
                  <Chip
                    size="sm"
                    color={getStatusColor(service.status)}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                  >
                    {formatStatus(service.status)}
                  </Chip>
                </Box>
                
                <Stack spacing={1} mb={2}>
                  <Typography level="title-md" fontWeight={700}>
                    {service.name || 'Untitled Service'}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {service.categories && service.categories.length > 0 ? (
                      service.categories.map((cat: ShopCategoryAssignment) => (
                        <Chip
                          key={cat.id}
                          size="sm"
                          variant={cat.is_primary ? "solid" : "outlined"}
                          color={cat.is_primary ? "primary" : "neutral"}
                        >
                          {cat.name}
                        </Chip>
                      ))
                    ) : (
                      <Typography level="body-xs" color="neutral">No Category</Typography>
                    )}
                  </Box>
                  {service.description && (
                    <Typography level="body-sm" color="neutral" noWrap>
                      {service.description}
                    </Typography>
                  )}
                  <Typography level="title-lg" color="primary" fontWeight={700}>
                    ₱{formatPrice(service.base_price)}
                  </Typography>
                  <Typography level="body-xs" color="neutral">
                    {formatPriceType(service.price_type)}
                    {service.contact_methods && service.contact_methods.length > 0 && ` • ${service.contact_methods.length} contact method(s)`}
                  </Typography>
                </Stack>
                
                <Stack direction="row" spacing={1}>
                  <Button
                    size="sm"
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      setSelectedService(service);
                      setServiceModalOpen(true);
                    }}
                    startDecorator={<FiEdit2 />}
                  >
                    Edit
                  </Button>
                  <IconButton
                    size="sm"
                    variant="outlined"
                    color="danger"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <FiTrash2 />
                  </IconButton>
                </Stack>
              </Card>
            ))}
          </Box>
        )}

        {/* Empty State - No Services at All */}
        {!loading && Array.isArray(services) && services.length === 0 && Array.isArray(categories) && categories.length > 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              px: 2,
            }}
          >
            <FiClock size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography level="h4" mb={1}>
              No services yet
            </Typography>
            <Typography level="body-sm" color="neutral" mb={3}>
              Start by adding your first service
            </Typography>
            <Button
              startDecorator={<FiPlus />}
              onClick={() => {
                setSelectedService(null);
                setServiceModalOpen(true);
              }}
            >
              Add Service
            </Button>
          </Box>
        )}

        {/* Empty State - No Services in Selected Category */}
        {!loading && services.length > 0 && filteredServices.length === 0 && selectedCategoryId && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              px: 2,
            }}
          >
            <FiClock size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography level="h4" mb={1}>
              No services in this category
            </Typography>
            <Typography level="body-sm" color="neutral" mb={3}>
              Try selecting a different category or add a new service
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                onClick={() => setSelectedCategoryId(null)}
              >
                View All Services
              </Button>
              <Button
                startDecorator={<FiPlus />}
                onClick={() => {
                  setSelectedService(null);
                  setServiceModalOpen(true);
                }}
              >
                Add Service
              </Button>
            </Stack>
          </Box>
        )}
      </Stack>

      {/* Modals */}
      <ServiceFormModal
        open={serviceModalOpen}
        onClose={() => {
          setServiceModalOpen(false);
          setSelectedService(null);
        }}
        onSubmit={handleServiceSubmit}
        onCreateCategory={handleCategoryCreate}
        service={selectedService}
        categories={categories}
        businessId={businessDetails?.id || ""}
      />

      {/* Toast Notifications */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        color="success"
        variant="soft"
        startDecorator={<FiCheckCircle />}
      >
        {success}
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        color="danger"
        variant="soft"
        startDecorator={<FiAlertCircle />}
      >
        {error}
      </Snackbar>
    </PageContainer>
  );
}
