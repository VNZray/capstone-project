import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../utils/errorHandler.js";

// -------------------- Helpers --------------------
const extractRows = (result) => {
  // MySQL CALL returns nested arrays; normalize to first rowset
  if (!Array.isArray(result)) return [];
  const first = result[0];
  if (Array.isArray(first)) return first;
  return result;
};

const parseJsonField = (field, defaultValue = null) => {
  if (field == null) return defaultValue;
  if (typeof field === "string") {
    try {
      return JSON.parse(field);
    } catch {
      return defaultValue;
    }
  }
  return field;
};

const mapServiceRow = (row) => {
  if (!row) return row;
  return {
    ...row,
    contact_methods: parseJsonField(row?.contact_methods, []),
  };
};

const mapServiceRows = (rows) => (Array.isArray(rows) ? rows.map(mapServiceRow) : []);

// ==================== SERVICE CATEGORIES ====================

export async function getAllServiceCategories(req, res) {
  try {
    const [data] = await db.query("CALL GetAllServiceCategories()");
    res.json(extractRows(data));
  } catch (error) {
    return handleDbError(error, res);
  }
}

export async function getServiceCategoriesByBusinessId(req, res) {
  const { businessId } = req.params;
  try {
    const [data] = await db.query("CALL GetServiceCategoriesByBusinessId(?)", [businessId]);
    res.json(extractRows(data));
  } catch (error) {
    return handleDbError(error, res);
  }
}

export async function getServiceCategoryById(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL GetServiceCategoryById(?)", [id]);
    const rows = extractRows(data);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Service category not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

export async function insertServiceCategory(req, res) {
  try {
    const id = uuidv4();
    const { business_id, name, description, display_order, status } = req.body;

    await db.query("CALL InsertServiceCategory(?, ?, ?, ?, ?, ?)", [
      id,
      business_id,
      name,
      description || null,
      display_order ?? 0,
      status || "active",
    ]);

    res.status(201).json({
      message: "Service category created successfully",
      data: { id, business_id, name, description, display_order: display_order ?? 0, status: status || "active" },
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

export async function updateServiceCategory(req, res) {
  const { id } = req.params;
  try {
    const { name, description, display_order, status } = req.body;

    await db.query("CALL UpdateServiceCategory(?, ?, ?, ?, ?)", [
      id,
      name,
      description || null,
      display_order ?? 0,
      status || "active",
    ]);

    res.json({
      message: "Service category updated successfully",
      data: { id, name, description, display_order: display_order ?? 0, status: status || "active" },
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

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

export async function getAllServices(req, res) {
  try {
    const [data] = await db.query("CALL GetAllServices()");
    const rows = extractRows(data);
    res.json(mapServiceRows(rows));
  } catch (error) {
    return handleDbError(error, res);
  }
}

export async function getServicesByBusinessId(req, res) {
  const { businessId } = req.params;
  try {
    const [data] = await db.query("CALL GetServicesByBusinessId(?)", [businessId]);
    const rows = extractRows(data);
    const services = mapServiceRows(rows);

    // Fetch category assignments for each service
    for (const service of services) {
      const [categoryRows] = await db.query(
        `SELECT sc.id, sc.name, sc.description, sc.status, scm.is_primary
         FROM service_category_map scm
         INNER JOIN shop_category sc ON scm.category_id = sc.id
         WHERE scm.service_id = ?
         ORDER BY scm.is_primary DESC, sc.name`,
        [service.id]
      );
      service.categories = categoryRows;
    }

    res.json(services);
  } catch (error) {
    return handleDbError(error, res);
  }
}

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
      status,
    } = req.body;

    if (!Array.isArray(category_ids) || category_ids.length === 0) {
      return res.status(400).json({
        message: "At least one category must be provided",
        error: "MISSING_CATEGORIES",
        received: { category_ids },
      });
    }

    const validCategoryIds = category_ids.filter((id) => id && typeof id === "string" && id.trim());
    if (validCategoryIds.length === 0) {
      return res.status(400).json({
        message: "At least one valid category ID must be provided",
        error: "INVALID_CATEGORIES",
        received: { category_ids },
      });
    }

    const parsedFeatures = typeof features === "string" ? JSON.parse(features) : features;
    const featuresJson = parsedFeatures ? JSON.stringify(parsedFeatures) : null;

    const primaryCategoryId = validCategoryIds[0];
    const categoryIdsJson = JSON.stringify(validCategoryIds);

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query("CALL InsertService(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
        serviceId,
        business_id,
        primaryCategoryId,
        name,
        description || null,
        base_price,
        price_type,
        sale_type || "fixed",
        sale_value || 0,
        duration_value || null,
        duration_unit || null,
        image_url || null,
        featuresJson,
        requirements || null,
        display_order ?? 0,
        status || "active",
      ]);

      await connection.query("CALL InsertServiceCategoryMappings(?, ?)", [serviceId, categoryIdsJson]);

      await connection.query("UPDATE service SET service_category_id = ? WHERE id = ?", [
        primaryCategoryId,
        serviceId,
      ]);

      await connection.commit();
      connection.release();

      const [serviceRows] = await db.query("CALL GetServiceById(?)", [serviceId]);
      const rows = extractRows(serviceRows);
      const service = rows && rows[0] ? mapServiceRow(rows[0]) : null;

      res.status(201).json({ message: "Service created successfully", data: service });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    return handleDbError(error, res);
  }
}

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
      status,
    } = req.body;

    if (!Array.isArray(category_ids) || category_ids.length === 0) {
      return res.status(400).json({
        message: "At least one category must be provided",
        error: "MISSING_CATEGORIES",
        received: { category_ids },
      });
    }

    const validCategoryIds = category_ids.filter((cid) => cid && typeof cid === "string" && cid.trim());
    if (validCategoryIds.length === 0) {
      return res.status(400).json({
        message: "At least one valid category ID must be provided",
        error: "INVALID_CATEGORIES",
        received: { category_ids },
      });
    }

    const parsedFeatures = typeof features === "string" ? JSON.parse(features) : features;
    const featuresJson = parsedFeatures ? JSON.stringify(parsedFeatures) : null;

    const connection = await db.getConnection();
    const primaryCategoryId = validCategoryIds[0];
    const categoryIdsJson = JSON.stringify(validCategoryIds);

    try {
      await connection.beginTransaction();

      await connection.query("CALL UpdateService(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
        id,
        primaryCategoryId,
        name,
        description || null,
        base_price,
        price_type,
        sale_type || "fixed",
        sale_value || 0,
        duration_value || null,
        duration_unit || null,
        image_url || null,
        featuresJson,
        requirements || null,
        display_order ?? 0,
        status || "active",
      ]);

      await connection.query("CALL UpdateServiceCategoryMappings(?, ?)", [id, categoryIdsJson]);
      await connection.query("UPDATE service SET service_category_id = ? WHERE id = ?", [
        primaryCategoryId,
        id,
      ]);

      await connection.commit();

      connection.release();

      const [serviceRows] = await db.query("CALL GetServiceById(?)", [id]);
      const rows = extractRows(serviceRows);
      const service = rows && rows[0] ? mapServiceRow(rows[0]) : null;
      if (!service) return res.status(404).json({ message: "Service not found" });

      res.json({ message: "Service updated successfully", data: service });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    return handleDbError(error, res);
  }
}

export async function deleteService(req, res) {
  const { id } = req.params;
  try {
    await db.query("CALL DeleteService(?)", [id]);
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}

export async function getServicesWithPricing(req, res) {
  const { businessId } = req.params;
  try {
    const [data] = await db.query("CALL GetServicesWithPricing(?)", [businessId]);
    res.json(extractRows(data));
  } catch (error) {
    return handleDbError(error, res);
  }
}

export async function searchServices(req, res) {
  const { query, business_id, category_id, price_min, price_max, price_type } = req.query;
  try {
    const [data] = await db.query("CALL SearchServices(?, ?, ?, ?, ?, ?)", [
      query || null,
      business_id || null,
      category_id || null,
      price_type || null,
      price_min ? parseFloat(price_min) : null,
      price_max ? parseFloat(price_max) : null,
    ]);
    res.json(extractRows(data));
  } catch (error) {
    return handleDbError(error, res);
  }
}

export async function getServiceStatsByBusiness(req, res) {
  const { businessId } = req.params;
  try {
    const [results] = await db.query("CALL GetServiceStatsByBusiness(?)", [businessId]);

    // Attempt to handle both multi-set and single-set responses gracefully
    if (Array.isArray(results)) {
      // Multi-result shape: [ [overviewRows], [byCategoryRows], ... ]
      if (Array.isArray(results[0]) && Array.isArray(results[1])) {
        const overview = (results[0] && results[0][0]) || {};
        const by_category = results[1] || [];
        return res.json({ overview, by_category });
      }

      // Single-row stats possibly in results[0]
      const stats = Array.isArray(results[0]) ? results[0][0] : results[0];
      if (stats) {
        return res.json({
          total_services: stats.total_services || 0,
          active_services: stats.active_services || 0,
          inactive_services: stats.inactive_services || 0,
          seasonal_services: stats.seasonal_services || 0,
          average_price: stats.average_price ? parseFloat(stats.average_price) : 0,
          min_price: stats.min_price ? parseFloat(stats.min_price) : 0,
          max_price: stats.max_price ? parseFloat(stats.max_price) : 0,
        });
      }
    }

    return res.status(404).json({ message: "Business not found or no data available" });
  } catch (error) {
    return handleDbError(error, res);
  }
}