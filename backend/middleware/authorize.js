/**
 * Re-export authorization middleware from authorizeRole.js
 * 
 * This file exists for backward compatibility. All authorization
 * middleware is now consolidated in authorizeRole.js.
 * 
 * Prefer importing directly from authorizeRole.js in new code.
 */

export { 
  authorize, 
  authorizeAny, 
  authorizeScope, 
  authorizeBusinessAccess,
  getRoleContext,
  ensureRoleContext 
} from './authorizeRole.js';
