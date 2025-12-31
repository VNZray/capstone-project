/**
 * Role Service
 * Enhanced RBAC business logic
 */
import { UserRole } from '../models/index.js';
import { Op } from 'sequelize';
import logger from '../config/logger.js';

// Role type constants
export const ROLE_TYPES = {
  SYSTEM: 'system',
  PRESET: 'preset',
  BUSINESS: 'business',
};

export const SYSTEM_ROLES = {
  ADMIN: 'Admin',
  TOURISM_ADMIN: 'Tourism Admin',
  BUSINESS_OWNER: 'Business Owner',
  TOURIST: 'Tourist',
};

// Cache for role permissions
const rolePermissionCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Clear role permission cache
 * @param {string|null} roleId - Role ID to clear, or null for all
 */
export function clearRoleCache(roleId = null) {
  if (roleId) {
    rolePermissionCache.delete(roleId);
  } else {
    rolePermissionCache.clear();
  }
}

/**
 * Get all roles by type
 * @param {string} roleType - 'system', 'preset', or 'business'
 * @returns {Promise<Array>} List of roles
 */
export async function getRolesByType(roleType) {
  if (!Object.values(ROLE_TYPES).includes(roleType)) {
    throw new Error(`Invalid role type: ${roleType}`);
  }

  const roles = await UserRole.findAll({
    where: { role_type: roleType },
    order: [['role_name', 'ASC']],
  });

  return roles;
}

/**
 * Get all preset roles (templates for business roles)
 * @returns {Promise<Array>} List of preset roles
 */
export async function getPresetRoles() {
  return getRolesByType(ROLE_TYPES.PRESET);
}

/**
 * Get all roles for a specific business
 * @param {string} businessId - Business ID
 * @returns {Promise<Array>} List of business roles
 */
export async function getBusinessRoles(businessId) {
  if (!businessId) {
    throw new Error('Business ID is required');
  }

  const roles = await UserRole.findAll({
    where: {
      role_type: ROLE_TYPES.BUSINESS,
      business_id: businessId,
    },
    order: [['role_name', 'ASC']],
  });

  return roles;
}

/**
 * Get role with permissions
 * @param {string} roleId - Role ID
 * @returns {Promise<Object|null>} Role with permissions
 */
export async function getRoleWithPermissions(roleId) {
  const now = Date.now();
  const cached = rolePermissionCache.get(roleId);

  if (cached && cached.expires > now) {
    return cached.role;
  }

  const role = await UserRole.findByPk(roleId);

  if (role) {
    rolePermissionCache.set(roleId, { role, expires: now + CACHE_TTL_MS });
  }

  return role;
}

/**
 * Get role by name
 * @param {string} roleName - Role name
 * @returns {Promise<Object|null>} Role object
 */
export async function getRoleByName(roleName) {
  return UserRole.findOne({
    where: { role_name: roleName },
  });
}

/**
 * Create a business role from preset
 * @param {string} presetRoleId - Preset role ID to clone
 * @param {string} businessId - Business ID
 * @param {string} customName - Optional custom name
 * @returns {Promise<Object>} Created role
 */
export async function createBusinessRoleFromPreset(presetRoleId, businessId, customName = null) {
  const presetRole = await UserRole.findByPk(presetRoleId);

  if (!presetRole) {
    throw new Error('Preset role not found');
  }

  if (presetRole.role_type !== ROLE_TYPES.PRESET) {
    throw new Error('Can only clone preset roles');
  }

  const newRole = await UserRole.create({
    role_name: customName || `${presetRole.role_name} (Custom)`,
    role_type: ROLE_TYPES.BUSINESS,
    business_id: businessId,
    permissions: presetRole.permissions,
    based_on_preset_id: presetRoleId,
    description: presetRole.description,
  });

  logger.info(`Created business role ${newRole.id} from preset ${presetRoleId}`);

  return newRole;
}

/**
 * Update role permissions
 * @param {string} roleId - Role ID
 * @param {Array<string>} permissions - New permissions array
 * @returns {Promise<Object>} Updated role
 */
export async function updateRolePermissions(roleId, permissions) {
  const role = await UserRole.findByPk(roleId);

  if (!role) {
    throw new Error('Role not found');
  }

  if (role.role_type === ROLE_TYPES.SYSTEM) {
    throw new Error('Cannot modify system roles');
  }

  await role.update({ permissions });
  clearRoleCache(roleId);

  logger.info(`Updated permissions for role ${roleId}`);

  return role;
}

/**
 * Check if a role is a system role
 * @param {string} roleName - Role name
 * @returns {boolean}
 */
export function isSystemRole(roleName) {
  return Object.values(SYSTEM_ROLES).includes(roleName);
}

export default {
  ROLE_TYPES,
  SYSTEM_ROLES,
  clearRoleCache,
  getRolesByType,
  getPresetRoles,
  getBusinessRoles,
  getRoleWithPermissions,
  getRoleByName,
  createBusinessRoleFromPreset,
  updateRolePermissions,
  isSystemRole,
};
