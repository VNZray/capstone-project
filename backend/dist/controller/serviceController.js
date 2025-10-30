import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../utils/errorHandler.js";

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
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get services by business ID
export async function getServicesByBusinessId(req, res) {
  const { businessId } = req.params;
  try {
    const [data] = await db.query("CALL GetServicesByBusinessId(?)", [businessId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get services by category ID
export async function getServicesByCategoryId(req, res) {
  const { categoryId } = req.params;
  try {
    const [data] = await db.query("CALL GetServicesByCategoryId(?)", [categoryId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get service by ID
export async function getServiceById(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL GetServiceById(?)", [id]);
    
    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(data[0]);
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
      service_category_id, 
      name, 
      description, 
      base_price, 
      price_type,
      sale_type,
      sale_value,
      duration_estimate,
      image_url, 
      features,
      requirements,
      display_order,
      status 
    } = req.body;

    // Parse features if it's a string, then convert to JSON string for MySQL
    const parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
    const featuresJson = parsedFeatures ? JSON.stringify(parsedFeatures) : null;

    const [data] = await db.query("CALL InsertService(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
      serviceId, business_id, service_category_id, name, description || null, base_price, price_type,
      sale_type || 'fixed', sale_value || 0, duration_estimate || null, image_url || null, 
      featuresJson, requirements || null, display_order || 0, status || 'active'
    ]);
    
    res.status(201).json({
      message: "Service created successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update service
export async function updateService(req, res) {
  const { id } = req.params;
  try {
    const { 
      service_category_id, 
      name, 
      description, 
      base_price, 
      price_type,
      sale_type,
      sale_value,
      duration_estimate,
      image_url, 
      features,
      requirements,
      display_order,
      status 
    } = req.body;

    // Parse features if it's a string, then convert to JSON string for MySQL
    const parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
    const featuresJson = parsedFeatures ? JSON.stringify(parsedFeatures) : null;

    const [data] = await db.query("CALL UpdateService(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
      id, service_category_id, name, description, base_price, price_type, sale_type, sale_value,
      duration_estimate, image_url, featuresJson, requirements, display_order, status
    ]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({
      message: "Service updated successfully",
      data: data[0]
    });
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
