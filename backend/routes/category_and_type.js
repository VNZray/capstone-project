import express from "express";
import * as categoryAndTypeController from "../controller/categoryAndTypeController.js";

const router = express.Router();

// @depracated
// // ==================== LEGACY ENDPOINTS (backward compatibility) ====================
// router.get("/all-type", categoryAndTypeController.getAllTypes);
// router.get("/business-type", categoryAndTypeController.getAccommodationAndShopTypes);
// router.get("/category/:id", categoryAndTypeController.getCategory);
// router.get("/type/:id", categoryAndTypeController.getTypeById);
// router.get("/category-by-id/:id", categoryAndTypeController.getCategoryById);

// ==================== NEW HIERARCHICAL CATEGORY ENDPOINTS ====================
// Categories CRUD
router.get("/categories", categoryAndTypeController.getAllCategories);
router.get("/categories/tree", categoryAndTypeController.getCategoryTree);
router.get("/categories/:id", categoryAndTypeController.getHierarchicalCategoryById);
router.get("/categories/:id/children", categoryAndTypeController.getCategoryChildren);
router.post("/categories", categoryAndTypeController.createCategory);
router.put("/categories/:id", categoryAndTypeController.updateCategory);
router.delete("/categories/:id", categoryAndTypeController.deleteCategory);

// Entity Categories (junction)
router.get("/entity-categories/:entityType/:entityId", categoryAndTypeController.getEntityCategories);
router.post("/entity-categories/:entityType/:entityId", categoryAndTypeController.addEntityCategory);
router.delete("/entity-categories/:entityType/:entityId/:categoryId", categoryAndTypeController.removeEntityCategory);
router.put("/entity-categories/:entityType/:entityId/:categoryId/primary", categoryAndTypeController.setEntityPrimaryCategory);

// Query entities by category
router.get("/categories/:categoryId/entities", categoryAndTypeController.getEntitiesByCategory);

export default router;
