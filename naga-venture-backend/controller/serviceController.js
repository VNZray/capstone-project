import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../utils/errorHandler.js";

const extractRows = (result) => {
  if (!Array.isArray(result)) return [];
  const [first] = result;
  if (Array.isArray(first)) {
    return first;
  }
  return result;
};

const parseCategories = (categories) => {
  if (!categories) return [];
  if (Array.isArray(categories)) return categories;
  try {
    const parsed = JSON.parse(categories);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const mapServiceRow = (row) => {
  if (!row) return row;
  return {
    ...row,
    categories: parseCategories(row.categories)
  };
};

const mapServiceRows = (rows = []) => rows.map(mapServiceRow);

// ==================== SERVICES ====================

// Get all services
export async function getAllServices(req, res) {
  try {
    const [data] = await db.query("CALL GetAllServices()");
    const rows = extractRows(data);
    res.json(mapServiceRows(rows));
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get services by business ID
export async function getServicesByBusinessId(req, res) {
  const { businessId } = req.params;
  try {
    const [data] = await db.query("CALL GetServicesByBusinessId(?)", [businessId]);
    const rows = extractRows(data);
    res.json(mapServiceRows(rows));
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get services by category ID
export async function getServicesByCategoryId(req, res) {
  const { categoryId } = req.params;
  try {
    const [data] = await db.query("CALL GetServicesByCategoryId(?)", [categoryId]);
    const rows = extractRows(data);
    res.json(mapServiceRows(rows));
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get service by ID
export async function getServiceById(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL GetServiceById(?)", [id]);
    const rows = extractRows(data);
    
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(mapServiceRow(rows[0]));
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Insert a new service
export async function insertService(req, res) {
  try {
    const serviceId = uuidv4();
    const { 
      business_id, 
      category_ids = [],
      name, 
      description, 
      base_price, 
      price_type,
      sale_type,
      sale_value,
      duration_value,
      duration_unit,
      image_url, 
      features,
      requirements,
      display_order,
      status 
    } = req.body;

    // Validate category_ids
    if (!Array.isArray(category_ids) || category_ids.length === 0) {
      return res.status(400).json({ 
        message: "At least one category must be provided",
        error: "MISSING_CATEGORIES",
        received: { category_ids }
      });
    }

    // Filter out any null/undefined/empty values
    const validCategoryIds = category_ids.filter(id => id && typeof id === 'string' && id.trim());
    
    if (validCategoryIds.length === 0) {
      return res.status(400).json({ 
        message: "At least one valid category ID must be provided",
        error: "INVALID_CATEGORIES",
        received: { category_ids }
      });
    }

    // Parse features if it's a string, then convert to JSON string for MySQL
    const parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
    const featuresJson = parsedFeatures ? JSON.stringify(parsedFeatures) : null;

    const primaryCategoryId = validCategoryIds[0];
    const categoryIdsJson = JSON.stringify(validCategoryIds);

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Insert service with primary category
      await connection.query("CALL InsertService(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
        serviceId, business_id, primaryCategoryId, name, description || null, base_price, price_type,
        sale_type || 'fixed', sale_value || 0, duration_value || null, duration_unit || null, image_url || null, 
        featuresJson, requirements || null, display_order || 0, status || 'active'
      ]);

      // Insert category mappings using stored procedure
      await connection.query("CALL InsertServiceCategoryMappings(?, ?)", [serviceId, categoryIdsJson]);

      // Update the shop_category_id field with the primary category
      await connection.query("UPDATE service SET shop_category_id = ? WHERE id = ?", [primaryCategoryId, serviceId]);

      await connection.commit();
      connection.release();

      const [serviceRows] = await db.query("CALL GetServiceById(?)", [serviceId]);
      const rows = extractRows(serviceRows);
      const service = rows && rows[0] ? mapServiceRow(rows[0]) : null;
      
      res.status(201).json({
        message: "Service created successfully",
        data: service
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update service
export async function updateService(req, res) {
  const { id } = req.params;
  try {
    const { 
      category_ids = [],
      name, 
      description, 
      base_price, 
      price_type,
      sale_type,
      sale_value,
      duration_value,
      duration_unit,
      image_url, 
      features,
      requirements,
      display_order,
      status 
    } = req.body;

    // Validate category_ids
    if (!Array.isArray(category_ids) || category_ids.length === 0) {
      return res.status(400).json({ 
        message: "At least one category must be provided",
        error: "MISSING_CATEGORIES",
        received: { category_ids }
      });
    }

    // Filter out any null/undefined/empty values
    const validCategoryIds = category_ids.filter(id => id && typeof id === 'string' && id.trim());
    
    if (validCategoryIds.length === 0) {
      return res.status(400).json({ 
        message: "At least one valid category ID must be provided",
        error: "INVALID_CATEGORIES",
        received: { category_ids }
      });
    }

    // Parse features if it's a string, then convert to JSON string for MySQL
    const parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
    const featuresJson = parsedFeatures ? JSON.stringify(parsedFeatures) : null;

    const connection = await db.getConnection();

    const primaryCategoryId = validCategoryIds[0];
    const categoryIdsJson = JSON.stringify(validCategoryIds);

    try {
      await connection.beginTransaction();

      // Update service with primary category
      await connection.query("CALL UpdateService(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
        id, primaryCategoryId, name, description, base_price, price_type, sale_type, sale_value,
        duration_value, duration_unit, image_url, featuresJson, requirements, display_order, status
      ]);

      // Update category mappings using stored procedure
      await connection.query("CALL UpdateServiceCategoryMappings(?, ?)", [id, categoryIdsJson]);

      // Update the shop_category_id field with the primary category
      await connection.query("UPDATE service SET shop_category_id = ? WHERE id = ?", [primaryCategoryId, id]);

      await connection.commit();
      connection.release();

      const [serviceRows] = await db.query("CALL GetServiceById(?)", [id]);
      const rows = extractRows(serviceRows);
      const service = rows && rows[0] ? mapServiceRow(rows[0]) : null;

      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      res.json({
        message: "Service updated successfully",
        data: service
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Delete service
export async function deleteService(req, res) {
  const { id } = req.params;
  try {
    await db.query("CALL DeleteService(?)", [id]);
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get services with pricing calculations
export async function getServicesWithPricing(req, res) {
  const { businessId } = req.params;
  try {
    const [data] = await db.query("CALL GetServicesWithPricing(?)", [businessId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Search services
export async function searchServices(req, res) {
  const { query, business_id, category_id, price_min, price_max, price_type } = req.query;
  
  try {
    const [data] = await db.query("CALL SearchServices(?, ?, ?, ?, ?, ?)", [
      query || null,
      business_id || null,
      category_id || null,
      price_type || null,
      price_min ? parseFloat(price_min) : null,
      price_max ? parseFloat(price_max) : null
    ]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get service statistics for business
export async function getServiceStatsByBusiness(req, res) {
  const { businessId } = req.params;
  
  try {
    const [results] = await db.query("CALL GetServiceStatsByBusiness(?)", [businessId]);
    
    if (!results || results.length < 2) {
      return res.status(404).json({ message: "Business not found or no data available" });
    }

    const overview = results[0][0];
    const by_category = results[1];

    res.json({
      overview: overview,
      by_category: by_category
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}
