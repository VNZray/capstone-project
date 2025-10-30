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

// Helper to parse JSON fields
const parseJsonField = (field, defaultValue = null) => {
  if (!field) return defaultValue;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch (e) {
      return defaultValue;
    }
  }
  return field;
};

// Map service row to include parsed JSON fields
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
    contact_methods: parseJsonField(row.contact_methods, [])
  };
};

// Map multiple service rows
const mapServiceRows = (rows = []) => rows.map(mapServiceRow);

// ==================== SERVICES (DISPLAY-ONLY) ====================
    categories: parseCategories(row.categories)
  };
};

const mapServiceRows = (rows = []) => rows.map(mapServiceRow);

// ==================== SERVICE CATEGORIES ====================

// Get all service categories
export async function getAllServiceCategories(req, res) {
  try {
    const [data] = await db.query("CALL GetAllServiceCategories()");
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get service categories by business ID
export async function getServiceCategoriesByBusinessId(req, res) {
  const { businessId } = req.params;
  try {
    const [data] = await db.query("CALL GetServiceCategoriesByBusinessId(?)", [businessId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get service category by ID
export async function getServiceCategoryById(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL GetServiceCategoryById(?)", [id]);
    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Service category not found" });
    }
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Insert a new service category
export async function insertServiceCategory(req, res) {
  try {
    const id = uuidv4();
    const { business_id, name, description, display_order, status } = req.body;

    const [data] = await db.query("CALL InsertServiceCategory(?, ?, ?, ?, ?, ?)", [
      id, business_id, name, description || null, display_order || 0, status || 'active'
    ]);
    
    res.status(201).json({
      message: "Service category created successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update service category
export async function updateServiceCategory(req, res) {
  const { id } = req.params;
  try {
    const { name, description, display_order, status } = req.body;

    const [data] = await db.query("CALL UpdateServiceCategory(?, ?, ?, ?, ?)", [
      id, name, description, display_order, status
    ]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Service category not found" });
    }

    res.json({
      message: "Service category updated successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Delete service category
export async function deleteServiceCategory(req, res) {
  const { id } = req.params;
  try {
    await db.query("CALL DeleteServiceCategory(?)", [id]);
    res.json({ message: "Service category deleted successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}

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
    const services = mapServiceRows(rows);

    // Fetch category assignments for each service
    for (const service of services) {
      const [categoryData] = await db.query(
        `SELECT sc.id, sc.name, sc.description, sc.status, scm.is_primary
         FROM service_category_map scm
         INNER JOIN shop_category sc ON scm.category_id = sc.id
         WHERE scm.service_id = ?
         ORDER BY scm.is_primary DESC, sc.name`,
        [service.id]
      );
      service.categories = categoryData;
    }

    res.json(services);
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
      shop_category_id,
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

      // Update the service_category_id with the primary category
      await connection.query("UPDATE service SET service_category_id = ? WHERE id = ?", [primaryCategoryId, serviceId]);

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
      image_url, 
      requirements,
      contact_methods,
      contact_notes,
      display_order,
      status,
      category_ids
    } = req.body;

    // Determine the primary category
    let primaryCategoryId = shop_category_id;
    if (category_ids && Array.isArray(category_ids) && category_ids.length > 0) {
      primaryCategoryId = category_ids[0]; // First category is primary
    }

    // Validate required fields
    if (!business_id || !primaryCategoryId || !name || !base_price || !price_type) {
      return res.status(400).json({ 
        message: "Missing required fields: business_id, category_ids (or shop_category_id), name, base_price, price_type"
      });
    }

    // Parse and validate JSON fields
    const contactMethodsJson = contact_methods ? JSON.stringify(contact_methods) : JSON.stringify([]);

    const [data] = await db.query("CALL InsertService(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
      serviceId, business_id, primaryCategoryId, name, description || null, base_price, price_type,
      image_url || null, requirements || null, contactMethodsJson, contact_notes || null,
      display_order || 0, status || 'active'
    ]);

    const rows = extractRows(data);
    const service = rows && rows[0] ? mapServiceRow(rows[0]) : null;

    // Insert category mappings if category_ids is provided
    if (category_ids && Array.isArray(category_ids) && category_ids.length > 0) {
      const mappingValues = category_ids.map((categoryId, index) => [
        uuidv4(),
        serviceId,
        categoryId,
        index === 0 ? 1 : 0 // First category is primary
      ]);

      if (mappingValues.length > 0) {
        await db.query(
          "INSERT INTO service_category_map (id, service_id, category_id, is_primary) VALUES ?",
          [mappingValues]
        );
      }
    }
    
    res.status(201).json({
      message: "Service created successfully",
      data: service
    });
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

      // Update the service_category_id with the primary category
      await connection.query("UPDATE service SET service_category_id = ? WHERE id = ?", [primaryCategoryId, serviceId]);

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
      shop_category_id,
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

      // Update the service_category_id with the primary category
      await connection.query("UPDATE service SET service_category_id = ? WHERE id = ?", [primaryCategoryId, id]);

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
      image_url, 
      requirements,
      contact_methods,
      contact_notes,
      display_order,
      status,
      category_ids
    } = req.body;

    console.log("Update service request:", { id, body: req.body });

    // Determine the primary category
    let primaryCategoryId = shop_category_id;
    if (category_ids && Array.isArray(category_ids) && category_ids.length > 0) {
      primaryCategoryId = category_ids[0]; // First category is primary
    }

    // Validate that we have at least a category
    if (!primaryCategoryId) {
      return res.status(400).json({ 
        message: "Missing required field: category_ids or shop_category_id"
      });
    }

    // Parse JSON fields if provided
    const contactMethodsJson = contact_methods ? JSON.stringify(contact_methods) : null;

    console.log("Calling UpdateService with params:", [
      id, primaryCategoryId, name, description, base_price, price_type, image_url, 
      requirements, contactMethodsJson, contact_notes, display_order, status
    ]);

    const [data] = await db.query("CALL UpdateService(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
      id, primaryCategoryId, name, description, base_price, price_type, image_url, 
      requirements, contactMethodsJson, contact_notes, display_order, status
    ]);

    const rows = extractRows(data);
    const service = rows && rows[0] ? mapServiceRow(rows[0]) : null;

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Update category mappings if category_ids is provided
    if (category_ids && Array.isArray(category_ids) && category_ids.length > 0) {
      // Delete existing category mappings
      await db.query("DELETE FROM service_category_map WHERE service_id = ?", [id]);
      
      // Insert new category mappings
      const mappingValues = category_ids.map((categoryId, index) => [
        uuidv4(),
        id,
        categoryId,
        index === 0 ? 1 : 0 // First category is primary
      ]);

      if (mappingValues.length > 0) {
        await db.query(
          "INSERT INTO service_category_map (id, service_id, category_id, is_primary) VALUES ?",
          [mappingValues]
        );
      }
    }

    res.json({
      message: "Service updated successfully",
      data: service
    });
  } catch (error) {
    console.error("Error in updateService:", error);
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

      // Update the service_category_id with the primary category
      await connection.query("UPDATE service SET service_category_id = ? WHERE id = ?", [primaryCategoryId, id]);

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
// Search services with filters
export async function searchServices(req, res) {
  const { query, business_id, category_id, status = 'active' } = req.query;
  
  try {
    const [data] = await db.query("CALL SearchServices(?, ?, ?, ?)", [
      query || null,
      business_id || null,
      category_id || null,
      status || null
    ]);
    const rows = extractRows(data);
    res.json(mapServiceRows(rows));
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
    if (!results || results.length === 0) {
      return res.status(404).json({ message: "Business not found or no data available" });
    }

    const stats = results[0];

    res.json({
      total_services: stats.total_services || 0,
      active_services: stats.active_services || 0,
      inactive_services: stats.inactive_services || 0,
      seasonal_services: stats.seasonal_services || 0,
      average_price: parseFloat(stats.average_price) || 0,
      min_price: parseFloat(stats.min_price) || 0,
      max_price: parseFloat(stats.max_price) || 0
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
