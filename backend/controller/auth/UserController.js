import db from "../../db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { handleDbError } from "../../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

// Login user (Moved to authController.js)
// export async function loginUser(req, res) { ... }

// Get all users
// Calls the GetAllUsers stored procedure
export async function getAllUsers(req, res) {
  try {
    const [data] = await db.query("CALL GetAllUsers()");
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get user by ID
// Calls the GetUserById stored procedure
export async function getUserById(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL GetUserById(?)", [id]);
    if (!data[0] || data[0].length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(data[0][0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get current authenticated user's profile
// Uses req.user.id from JWT middleware - allows any authenticated user to fetch their own data
export async function getCurrentUser(req, res) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    const [data] = await db.query("CALL GetUserById(?)", [userId]);
    if (!data[0] || data[0].length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(data[0][0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get users by role ID
// Calls the GetUsersByRoleId stored procedure
export async function getUsersByRoleId(req, res) {
  const { user_role_id } = req.params;
  try {
    const [data] = await db.query("CALL GetUsersByRoleId(?)", [user_role_id]);
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Insert user
// Calls the InsertUser stored procedure
export async function insertUser(req, res) {
  try {
    const id = uuidv4();
    // Hash password if provided
    const rawPassword = req.body.password ?? null;
    const hashedPassword = rawPassword ? await bcrypt.hash(rawPassword, 10) : null;
    const params = [
      id,
      req.body.email ?? null,
      req.body.phone_number ?? null,
      hashedPassword,
      req.body.user_profile ?? null,
      req.body.otp ?? null,
      req.body.is_verified ?? false,
      req.body.is_active ?? false,
      req.body.last_login ?? null,
      req.body.user_role_id ?? null,
      req.body.barangay_id ?? null
    ];
    const [data] = await db.query(
      "CALL InsertUser(?,?,?,?,?,?,?,?,?,?,?)",
      params
    );
    if (!data[0] || data[0].length === 0) {
      return res.status(404).json({ error: "Inserted row not found" });
    }
    res.status(201).json(data[0][0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update user
// Calls the UpdateUser stored procedure
export async function updateUser(req, res) {
  const { id } = req.params;
  try {
    // Hash password if provided; pass null to leave unchanged
    const rawPassword = req.body.password ?? null;
    const hashedPassword = rawPassword ? await bcrypt.hash(rawPassword, 10) : null;
    const params = [
      id,
      req.body.email ?? null,
      req.body.phone_number ?? null,
      hashedPassword,
      req.body.user_profile ?? null,
      req.body.otp ?? null,
      req.body.is_verified ?? null,
      req.body.is_active ?? null,
      req.body.last_login ?? null,
      req.body.user_role_id ?? null,
      req.body.barangay_id ?? null
    ];
    const [data] = await db.query(
      "CALL UpdateUser(?,?,?,?,?,?,?,?,?,?,?)",
      params
    );
    if (!data[0] || data[0].length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(data[0][0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Delete user
// Calls the DeleteUser stored procedure
export async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    await db.query("CALL DeleteUser(?)", [id]);
    // Check if user still exists
    const [check] = await db.query("CALL GetUserById(?)", [id]);
    if (check[0] && check[0].length > 0) {
      return res.status(404).json({ message: "User not deleted" });
    }
    res.status(204).send();
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Insert user role
// Calls the InsertUserRole stored procedure
export async function insertUserRole(req, res) {
  try {
    const params = [
      req.body.role_name ?? null,
      req.body.role_description ?? null,
    ];
    const [data] = await db.query("CALL InsertUserRole(?, ?)", params);
    if (!data[0] || data[0].length === 0) {
      return res.status(404).json({ error: "Inserted user role not found" });
    }
    res.status(201).json(data[0][0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update user role by ID
// Calls the UpdateUserRole stored procedure
export async function updateUserRole(req, res) {
  const { id } = req.params;
  try {
    const params = [
      id,
      req.body.role_name ?? null,
      req.body.role_description ?? null,
    ];
    const [data] = await db.query("CALL UpdateUserRole(?, ?, ?)", params);
    if (!data[0] || data[0].length === 0) {
      return res.status(404).json({ message: "User role not found" });
    }
    res.json(data[0][0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update user role by role name
// Calls the UpdateUserRoleByName stored procedure
export async function updateUserRoleByName(req, res) {
  try {
    const params = [
      req.body.role_name ?? null,
      req.body.new_role_name ?? null,
      req.body.role_description ?? null,
    ];
    const [data] = await db.query("CALL UpdateUserRoleByName(?, ?, ?)", params);
    if (!data[0] || data[0].length === 0) {
      return res.status(404).json({ message: "User role not found" });
    }
    res.json(data[0][0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get all user roles
// Calls the GetAllUserRoles stored procedure
export async function getAllUserRoles(req, res) {
  try {
    const [data] = await db.query("CALL GetAllUserRoles()");
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get user role by ID
// Calls the GetUserRoleById stored procedure
export async function getUserRoleById(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL GetUserRoleById(?)", [id]);
    if (!data[0] || data[0].length === 0) {
      return res.status(404).json({ message: "User role not found" });
    }
    res.json(data[0][0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ============================================================
// STAFF USER MANAGEMENT
// ============================================================

/**
 * Insert a staff user with proper onboarding flags
 * Sets: is_verified=true, is_active=true, must_change_password=true, profile_completed=false
 * Generates an invitation token for email verification
 */
export async function insertStaffUser(req, res) {
  try {
    const id = uuidv4();
    
    // Hash password
    const rawPassword = req.body.password ?? "staff123"; // Default temp password
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    
    // Generate invitation token (expires in 48 hours)
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
    
    const params = [
      id,
      req.body.email ?? null,
      req.body.phone_number ?? "",
      hashedPassword,
      req.body.user_role_id ?? null,
      req.body.barangay_id ?? null,
      invitationToken,
      invitationExpiresAt,
    ];
    
    const [data] = await db.query(
      "CALL InsertStaffUser(?,?,?,?,?,?,?,?)",
      params
    );
    
    if (!data[0] || data[0].length === 0) {
      return res.status(404).json({ error: "Failed to create staff user" });
    }
    
    // Return user info without password, include invitation token for email
    const user = data[0][0];
    res.status(201).json({
      id: user.id,
      email: user.email,
      phone_number: user.phone_number,
      user_role_id: user.user_role_id,
      is_verified: user.is_verified,
      is_active: user.is_active,
      must_change_password: user.must_change_password,
      profile_completed: user.profile_completed,
      invitation_token: invitationToken, // For email sending
      temp_password: rawPassword, // For email sending (only used in invitation)
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Change password for a user (typically after first login)
 * Clears the must_change_password flag
 */
export async function changePassword(req, res) {
  const userId = req.user?.id; // From JWT middleware
  
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  try {
    const { current_password, new_password } = req.body;
    
    if (!current_password || !new_password) {
      return res.status(400).json({ message: "Current and new password are required" });
    }
    
    if (new_password.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }
    
    // Get current user
    const [userRows] = await db.query("CALL GetUserById(?)", [userId]);
    if (!userRows[0] || userRows[0].length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const user = userRows[0][0];
    
    // Verify current password
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);
    
    // Update password and clear must_change_password flag
    const [data] = await db.query("CALL CompletePasswordChange(?, ?)", [
      userId,
      hashedPassword,
    ]);
    
    res.json({ 
      message: "Password changed successfully",
      must_change_password: false,
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Complete staff profile after first login
 * Clears invitation token and sets profile_completed=true
 */
export async function completeStaffProfile(req, res) {
  const userId = req.user?.id; // From JWT middleware
  
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  try {
    // Optional: Update additional profile fields if provided
    // For now, just mark profile as completed
    
    const [data] = await db.query("CALL CompleteStaffProfile(?)", [userId]);
    
    if (!data[0] || data[0].length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ 
      message: "Profile completed successfully",
      profile_completed: true,
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}