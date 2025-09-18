import db from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { handleDbError } from "../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

// Login user (direct table access, not via procedure)
export async function loginUser(req, res) {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM user WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    const token = jwt.sign(
      {
        id: user.id,
        user_role_id: user.user_role_id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        user_role_id: user.user_role_id,
        email: user.email,
        phone_number: user.phone_number,
        user_profile: user.user_profile,
        is_verified: user.is_verified,
        is_active: user.is_active,
        last_login: user.last_login,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

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
    ];
    const [data] = await db.query(
      "CALL InsertUser(?,?,?,?,?,?,?,?,?,?)",
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
    ];
    const [data] = await db.query(
      "CALL UpdateUser(?,?,?,?,?,?,?,?,?,?)",
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
