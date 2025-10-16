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
  Alert,
  CircularProgress,
  Snackbar,
} from "@mui/joy";
import { FiPlus, FiEdit2, FiTrash2, FiPackage, FiGrid, FiList, FiCheckCircle, FiAlertCircle, FiTag } from "react-icons/fi";
import PageContainer from "@/src/components/PageContainer";
import { useBusiness } from "@/src/context/BusinessContext";
import { useNavigate } from "react-router-dom";
import * as ProductService from "@/src/services/ProductService";
import * as ShopCategoryService from "@/src/services/ShopCategoryService";
import ProductFormModal from "./components/ProductFormModal";
import StockManagementModal from "./components/StockManagementModal";
import type {
  Product,
  CreateProductPayload,
  UpdateStockPayload,
} from "@/src/types/Product";
import type { ShopCategory, CreateShopCategoryPayload } from "@/src/types/ShopCategory";

export default function Products() {
  const navigate = useNavigate();
  const { businessDetails } = useBusiness();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  console.log('Products component - businessDetails:', businessDetails);
  
  // Modal states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter products by selected category
  const filteredProducts = selectedCategoryId
    ? products.filter(product => 
        product.categories?.some(cat => cat.id === selectedCategoryId)
      )
    : products;

  // Fetch products and categories
  const fetchData = useCallback(async () => {
    if (!businessDetails?.id) {
      console.log('No business selected, skipping fetch');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting to fetch data for business:', businessDetails.id);
      const [productsData, categoriesData] = await Promise.all([
        ProductService.fetchProductsByBusinessId(businessDetails.id),
        ShopCategoryService.fetchShopCategoriesByBusinessIdAndType(businessDetails.id, 'product'),
      ]);
      
      console.log('Products data received:', productsData);
      console.log('Categories data received:', categoriesData);
      
      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please make sure your backend is running and the API endpoints are available.");
      // Set empty arrays as fallback
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [businessDetails?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle add/edit product
  const handleProductSubmit = async (payload: CreateProductPayload) => {
    if (!businessDetails?.id) return;

    try {
      if (selectedProduct) {
        await ProductService.updateProduct(selectedProduct.id, payload);
        setSuccess("Product updated successfully!");
      } else {
        await ProductService.createProduct(payload);
        setSuccess("Product added successfully!");
      }
      
      await fetchData();
      setProductModalOpen(false);
      setSelectedProduct(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving product:", err);
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

      // Refresh categories to include the new entry (keeps ordering consistent)
      const categoriesData = await ShopCategoryService.fetchShopCategoriesByBusinessIdAndType(businessDetails.id, 'product');
      setCategories(categoriesData);

      setTimeout(() => setSuccess(null), 3000);
      return newCategory;
    } catch (err) {
      console.error("Error creating category:", err);
      throw err;
    }
  };

  // Handle stock update
  const handleStockUpdate = async (payload: UpdateStockPayload) => {
    if (!selectedProduct?.id) return;

    try {
      await ProductService.updateProductStock(selectedProduct.id, payload);
      setSuccess("Stock updated successfully!");
      
      await fetchData();
      setStockModalOpen(false);
      setSelectedProduct(null);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error updating stock:", err);
      throw err;
    }
  };

  // Handle delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await ProductService.deleteProduct(productId);
      setSuccess("Product deleted successfully!");
      await fetchData();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Failed to delete product. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Get status chip color
  const getStatusColor = (status: string): "success" | "neutral" | "danger" => {
    switch (status) {
      case "active":
        return "success";
      case "out_of_stock":
        return "danger";
      default:
        return "neutral";
    }
  };

  // Get stock chip color
  const getStockColor = (
    stock: number | undefined,
    minStock: number | undefined
  ): "success" | "warning" | "danger" => {
    if (!stock || stock === 0) return "danger";
    if (minStock && stock <= minStock) return "warning";
    return "success";
  };

  // Format status text
  const formatStatus = (status: string | undefined): string => {
    if (!status) return "UNKNOWN";
    return status.replace("_", " ").toUpperCase();
  };

  // Format price safely
  const formatPrice = (price: number | string | undefined): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return (numPrice || 0).toFixed(2);
  };

  if (!businessDetails) {
    return (
      <PageContainer>
        <Alert color="warning">Please select a business to manage products.</Alert>
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
              Products
            </Typography>
            <Typography level="body-sm" color="neutral">
              Manage your products and inventory
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
              onClick={() => navigate("/business/store/categories")}
            >
              Manage Categories
            </Button>
            
            {/* Add Product Button */}
            <Button
              startDecorator={<FiPlus />}
              onClick={() => {
                setSelectedProduct(null);
                setProductModalOpen(true);
              }}
            >
              Add Product
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
                All Products ({products.length})
              </Chip>
              {categories.slice(0, 10).map((category) => {
                const productCount = products.filter(product =>
                  product.categories?.some(cat => cat.id === category.id)
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
                    {category.name} ({productCount})
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
        {!loading && viewMode === "table" && Array.isArray(filteredProducts) && filteredProducts.length > 0 && (
          <Sheet variant="outlined" sx={{ borderRadius: "sm", overflow: "hidden" }}>
            <Table>
              <thead>
                <tr>
                  <th style={{ width: "40%" }}>Product</th>
                  <th style={{ width: "15%" }}>Category</th>
                  <th style={{ width: "12%" }}>Price</th>
                  <th style={{ width: "13%" }}>Stock</th>
                  <th style={{ width: "10%" }}>Status</th>
                  <th style={{ width: "10%", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.filter(product => product && product.id).map((product) => (
                  <tr key={product.id}>
                    <td>
                      <Stack direction="row" spacing={2} alignItems="center">
                        {product.image_url ? (
                          <Box
                            component="img"
                            src={product.image_url}
                            alt={product.name || 'Product image'}
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "sm",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
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
                            <FiPackage size={20} />
                          </Box>
                        )}
                        <Box>
                          <Typography level="body-sm" fontWeight={600}>
                            {product.name || 'Untitled Product'}
                          </Typography>
                          {product.description && (
                            <Typography level="body-xs" color="neutral" noWrap>
                              {product.description}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </td>
                    <td>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {product.categories && product.categories.length > 0 ? (
                          product.categories.map((cat) => (
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
                        ₱{formatPrice(product.price)}
                      </Typography>
                    </td>
                    <td>
                      <Chip
                        size="sm"
                        color={getStockColor(product.current_stock, product.minimum_stock)}
                        variant="soft"
                      >
                        {product.current_stock || 0} {product.stock_unit || "units"}
                      </Chip>
                    </td>
                    <td>
                      <Chip
                        size="sm"
                        color={getStatusColor(product.status)}
                        variant="soft"
                      >
                        {formatStatus(product.status)}
                      </Chip>
                    </td>
                    <td>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="primary"
                          onClick={() => {
                            setSelectedProduct(product);
                            setStockModalOpen(true);
                          }}
                        >
                          <FiPackage />
                        </IconButton>
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="neutral"
                          onClick={() => {
                            setSelectedProduct(product);
                            setProductModalOpen(true);
                          }}
                        >
                          <FiEdit2 />
                        </IconButton>
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="danger"
                          onClick={() => handleDeleteProduct(product.id)}
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
        {!loading && viewMode === "grid" && Array.isArray(filteredProducts) && filteredProducts.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 2,
            }}
          >
            {filteredProducts.filter(product => product && product.id).map((product) => (
              <Card key={product.id} variant="outlined">
                <Box sx={{ position: "relative", mb: 2 }}>
                  {product.image_url ? (
                    <Box
                      component="img"
                      src={product.image_url}
                      alt={product.name || 'Product image'}
                      sx={{
                        width: "100%",
                        height: 180,
                        objectFit: "cover",
                        borderRadius: "sm",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: 180,
                        bgcolor: "background.level2",
                        borderRadius: "sm",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FiPackage size={48} />
                    </Box>
                  )}
                  <Chip
                    size="sm"
                    color={getStatusColor(product.status)}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                  >
                    {formatStatus(product.status)}
                  </Chip>
                </Box>
                
                <Stack spacing={1} mb={2}>
                  <Typography level="title-md" fontWeight={700}>
                    {product.name || 'Untitled Product'}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {product.categories && product.categories.length > 0 ? (
                      product.categories.map((cat) => (
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
                  {product.description && (
                    <Typography level="body-sm" color="neutral" noWrap>
                      {product.description}
                    </Typography>
                  )}
                  <Typography level="title-lg" color="primary" fontWeight={700}>
                    ₱{formatPrice(product.price)}
                  </Typography>
                  <Chip
                    size="sm"
                    color={getStockColor(product.current_stock, product.minimum_stock)}
                    variant="soft"
                  >
                    Stock: {product.current_stock || 0} {product.stock_unit || "units"}
                  </Chip>
                </Stack>
                
                <Stack direction="row" spacing={1}>
                  <Button
                    size="sm"
                    variant="outlined"
                    color="primary"
                    fullWidth
                    startDecorator={<FiPackage />}
                    onClick={() => {
                      setSelectedProduct(product);
                      setStockModalOpen(true);
                    }}
                  >
                    Stock
                  </Button>
                  <IconButton
                    size="sm"
                    variant="outlined"
                    color="neutral"
                    onClick={() => {
                      setSelectedProduct(product);
                      setProductModalOpen(true);
                    }}
                  >
                    <FiEdit2 />
                  </IconButton>
                  <IconButton
                    size="sm"
                    variant="outlined"
                    color="danger"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <FiTrash2 />
                  </IconButton>
                </Stack>
              </Card>
            ))}
          </Box>
        )}

        {/* Empty State - No Products at All */}
        {!loading && Array.isArray(products) && products.length === 0 && Array.isArray(categories) && categories.length > 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              px: 2,
            }}
          >
            <FiPackage size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography level="h4" mb={1}>
              No products yet
            </Typography>
            <Typography level="body-sm" color="neutral" mb={3}>
              Start by adding your first product
            </Typography>
            <Button
              startDecorator={<FiPlus />}
              onClick={() => {
                setSelectedProduct(null);
                setProductModalOpen(true);
              }}
            >
              Add Product
            </Button>
          </Box>
        )}

        {/* Empty State - No Products in Selected Category */}
        {!loading && products.length > 0 && filteredProducts.length === 0 && selectedCategoryId && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              px: 2,
            }}
          >
            <FiPackage size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography level="h4" mb={1}>
              No products in this category
            </Typography>
            <Typography level="body-sm" color="neutral" mb={3}>
              Try selecting a different category or add a new product
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                onClick={() => setSelectedCategoryId(null)}
              >
                View All Products
              </Button>
              <Button
                startDecorator={<FiPlus />}
                onClick={() => {
                  setSelectedProduct(null);
                  setProductModalOpen(true);
                }}
              >
                Add Product
              </Button>
            </Stack>
          </Box>
        )}
      </Stack>

      {/* Modals */}
      <ProductFormModal
        open={productModalOpen}
        onClose={() => {
          setProductModalOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleProductSubmit}
        onCreateCategory={handleCategoryCreate}
        product={selectedProduct}
        categories={categories}
        businessId={businessDetails?.id || ""}
      />

      <StockManagementModal
        open={stockModalOpen}
        onClose={() => {
          setStockModalOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleStockUpdate}
        product={selectedProduct}
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
