import db from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { handleDbError } from "../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

// Get all users
export async function getAllUsers(req, res) {
  try {
    const [results] = await db.query("CALL GetAllUsers()");
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get a single user by id
export async function getUserById(req, res) {
  const { id } = req.params;
  try {
    // If you want to fetch by tourism_id, you need a procedure for that. Otherwise, use GetUserById
    const [results] = await db.query("CALL GetUserById(?)", [id]);
    if (results[0].length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json(results[0][0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get a single user by tourism_id
export async function getUserByTourismId(req, res) {
  const { id } = req.params;
  try {
    // If you want to fetch by tourism_id, you need a procedure for that. Otherwise, use GetUserById
    const [results] = await db.query("CALL GetUserByTourismId(?)", [id]);
    if (results[0].length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json(results[0][0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get a single user by tourist_id
export async function getUserByTouristId(req, res) {
  const { id } = req.params;
  try {
    // If you want to fetch by tourist_id, you need a procedure for that. Otherwise, use GetUserById
    const [results] = await db.query("CALL GetUserByTouristId(?)", [id]);
    if (results[0].length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json(results[0][0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get a single user by owner_id
export async function getUserByOwnerId(req, res) {
  const { id } = req.params;
  try {
    // If you want to fetch by owner_id, you need a procedure for that. Otherwise, use GetUserById
    const [results] = await db.query("CALL GetUserByOwnerId(?)", [id]);
    if (results[0].length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json(results[0][0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create a new user
export async function createUser(request, response) {
  try {
    const id = uuidv4();
    // Hash the password
    const hashedPassword = request.body.password
      ? await bcrypt.hash(request.body.password, 10)
      : null;

    // user_profile is not handled in the original controller, so set to null
    const user_profile = null;

    const values = [
      id,
      request.body.role ?? null,
      request.body.email ?? null,
      request.body.phone_number ?? null,
      hashedPassword,
      user_profile,
      request.body.tourist_id ?? null,
      request.body.owner_id ?? null,
      request.body.tourism_id ?? null,
    ];

    const [result] = await db.query(
      "CALL InsertUser(?, ?, ?, ?, ?, ?, ?, ?, ?)",
      values
    );

    // result[0] contains the inserted user
    if (!result[0] || result[0].length === 0) {
      return response.status(404).json({ error: "Inserted row not found" });
    }

    response.json(result[0][0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Update tourist user
export async function updateTourist(req, res) {
  // This should use UpdateUser procedure. You need to fetch all required fields from req.body
  const { id } = req.params;
  const {
    role,
    email,
    phone_number,
    password,
    user_profile,
    tourist_id,
    owner_id,
    tourism_id,
  } = req.body;
  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const values = [
      id,
      role ?? null,
      email ?? null,
      phone_number ?? null,
      hashedPassword,
      user_profile ?? null,
      tourist_id ?? null,
      owner_id ?? null,
      tourism_id ?? null,
    ];
    const [result] = await db.query(
      "CALL UpdateUser(?, ?, ?, ?, ?, ?, ?, ?, ?)",
      values
    );
    res.json({ message: "User updated successfully", user: result[0][0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update owner user
export async function updateOwner(req, res) {
  // This should use UpdateUser procedure. You need to fetch all required fields from req.body
  const { id } = req.params;
  const {
    role,
    email,
    phone_number,
    password,
    user_profile,
    tourist_id,
    owner_id,
    tourism_id,
  } = req.body;
  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const values = [
      id,
      role ?? null,
      email ?? null,
      phone_number ?? null,
      hashedPassword,
      user_profile ?? null,
      tourist_id ?? null,
      owner_id ?? null,
      tourism_id ?? null,
    ];
    const [result] = await db.query(
      "CALL UpdateUser(?, ?, ?, ?, ?, ?, ?, ?, ?)",
      values
    );
    res.json({ message: "User updated successfully", user: result[0][0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update tourism user
export async function updateTourism(req, res) {
  // This should use UpdateUser procedure. You need to fetch all required fields from req.body
  const { id } = req.params;
  const {
    role,
    email,
    phone_number,
    password,
    user_profile,
    tourist_id,
    owner_id,
    tourism_id,
  } = req.body;
  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const values = [
      id,
      role ?? null,
      email ?? null,
      phone_number ?? null,
      hashedPassword,
      user_profile ?? null,
      tourist_id ?? null,
      owner_id ?? null,
      tourism_id ?? null,
    ];
    const [result] = await db.query(
      "CALL UpdateUser(?, ?, ?, ?, ?, ?, ?, ?, ?)",
      values
    );
    res.json({ message: "User updated successfully", user: result[0][0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete user by ID
export async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    await db.query("CALL DeleteUser(?)", [id]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Login user
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
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        tourist_id: user.tourist_id,
        owner_id: user.owner_id,
        tourism_id: user.tourism_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
        phone_number: user.phone_number,
        tourist_id: user.tourist_id,
        owner_id: user.owner_id,
        tourism_id: user.tourism_id,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
