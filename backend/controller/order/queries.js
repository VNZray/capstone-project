// Order Query Controllers - Read-only operations
import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";
import { ensureUserRole, hasBusinessAccess } from "../../utils/authHelpers.js";
import { normalizeOrder, normalizeOrderItems } from "./utils.js";

/**
 * Get all orders (Admin only)
 * GET /api/orders
 */
export async function getAllOrders(req, res) {
  try {
    const [data] = await db.query("CALL GetAllOrders()");
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Get orders by business ID
 * GET /api/orders/business/:businessId
 */
export async function getOrdersByBusinessId(req, res) {
  const { businessId } = req.params;
  try {
    const userRole = await ensureUserRole(req);
    const allowed = await hasBusinessAccess(businessId, req.user, userRole);
    
    if (!allowed) {
      return res.status(403).json({
        message: "Forbidden: you do not have access to this business",
      });
    }

    const [data] = await db.query("CALL GetOrdersByBusinessId(?)", [businessId]);
    
    // Normalize status casing and amounts for frontend
    const rows = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : (Array.isArray(data) ? data : []);
    const normalized = rows.map(normalizeOrder);

    res.json(normalized);
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Get orders by user ID
 * GET /api/orders/user/:userId
 */
export async function getOrdersByUserId(req, res) {
  const { userId } = req.params;
  const requestingUserId = req.user?.id;
  if (!requestingUserId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const userRole = await ensureUserRole(req);
  const roleName = userRole?.roleName || userRole;

  // Only admins may request arbitrary user IDs; everyone else is forced to their own ID
  const effectiveUserId = roleName === 'Admin' ? userId : requestingUserId;
  
  try {
    const [data] = await db.query("CALL GetOrdersByUserId(?)", [effectiveUserId]);

    // Normalize status casing for frontend (expects UPPER_SNAKE)
    const rows = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : (Array.isArray(data) ? data : []);
    const normalized = rows.map((row) => ({
      ...normalizeOrder(row),
      // Override status to UPPER_SNAKE for tourist orders endpoint
      status: (row.status || 'pending').toString().toUpperCase(),
      payment_status: (row.payment_status || 'pending').toString().toUpperCase(),
    }));

    res.json(normalized);
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Get order by ID
 * GET /api/orders/:id
 */
export async function getOrderById(req, res) {
  const { id } = req.params;
  const userId = req.user?.id;
  
  try {
    const userRole = await ensureUserRole(req);
    
    // If role lookup fails, return 401 instead of proceeding with null role
    if (!userRole) {
      console.error('[getOrderById] Failed to resolve user role for user:', userId);
      return res.status(401).json({ 
        message: "Unable to verify user role. Please log in again." 
      });
    }

    console.log('[getOrderById] User:', userId, 'Role:', userRole, 'Requesting order:', id);
    
    const [results] = await db.query("CALL GetOrderById(?)", [id]);
    
    if (!results || results.length < 2 || results[0].length === 0) {
      console.log('[getOrderById] Order not found:', id);
      return res.status(404).json({ message: "Order not found" });
    }

    const orderData = results[0][0];
    const items = results[1] || [];
    
    console.log('[getOrderById] Order found. Owner:', orderData.user_id, 'Business:', orderData.business_id);
    
    // Authorization check: user must own the order or be business owner/staff/admin
    const roleName = userRole?.roleName || userRole;
    if (roleName !== 'Admin' && roleName !== 'Tourism Officer') {
      const isTouristOwner = roleName === 'Tourist' && orderData.user_id === userId;
      const isBusinessMember = await hasBusinessAccess(orderData.business_id, req.user, userRole);

      console.log('[getOrderById] Auth check - isTouristOwner:', isTouristOwner, 'isBusinessMember:', isBusinessMember);

      if (!isTouristOwner && !isBusinessMember) {
        console.error('[getOrderById] Access denied for user:', userId, 'role:', roleName);
        return res.status(403).json({
          message: "Forbidden: you do not have access to this order"
        });
      }
    }

    // Normalize amounts for frontend (MySQL DECIMAL returns as string)
    const normalizedOrder = normalizeOrder(orderData);
    const normalizedItems = normalizeOrderItems(items);

    const result = {
      ...normalizedOrder,
      items: normalizedItems
    };

    res.json(result);
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Get order statistics for business
 * GET /api/orders/business/:businessId/stats
 */
export async function getOrderStatsByBusiness(req, res) {
  const { businessId } = req.params;
  const { period = '30' } = req.query; // days
  
  try {
    const userRole = await ensureUserRole(req);
    const allowed = await hasBusinessAccess(businessId, req.user, userRole);
    if (!allowed) {
      return res.status(403).json({
        message: "Forbidden: you do not have access to this business"
      });
    }

    const [results] = await db.query("CALL GetOrderStatsByBusiness(?, ?)", [businessId, parseInt(period)]);
    
    if (!results || results.length < 3) {
      return res.status(404).json({ message: "Business not found or no data available" });
    }

    const overview = results[0][0];
    const daily_stats = results[1];
    const popular_products = results[2];

    res.json({
      overview: overview,
      daily_stats: daily_stats,
      popular_products: popular_products
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}
