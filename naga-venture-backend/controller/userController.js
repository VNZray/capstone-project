import db from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { handleDbError } from "../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

// Get all users
export async function getAllUsers(req, res) {
  try {
    const [results] = await db.query("SELECT * FROM user");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get a single user by tourism_id
export async function getTourismId(req, res) {
  const { id } = req.params;
  try {
    const [results] = await db.query(
      "SELECT * FROM user WHERE tourism_id = ?",
      [id]
    );
    if (results.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get a single user by tourist_id
export async function getTouristId(req, res) {
  const { id } = req.params;
  try {
    const [results] = await db.query(
      "SELECT * FROM user WHERE tourist_id = ?",
      [id]
    );
    if (results.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get a single user by owner_id
export async function getOwnerId(req, res) {
  const { id } = req.params;
  try {
    const [results] = await db.query("SELECT * FROM user WHERE owner_id = ?", [
      id,
    ]);
    if (results.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create a new user
export async function createUser(request, response) {
  try {
    const id = uuidv4();
    const fields = [
      "id",
      "role",
      "email",
      "phone_number",
      "password",
      "tourist_id",
      "owner_id",
      "tourism_id",
    ];

    // Hash the password
    const hashedPassword = request.body.password
      ? await bcrypt.hash(request.body.password, 10) // 10 salt rounds
      : null;

    const values = [
      id,
      request.body.role ?? null,
      request.body.email ?? null,
      request.body.phone_number ?? null,
      hashedPassword,
      request.body.tourist_id ?? null,
      request.body.owner_id ?? null,
      request.body.tourism_id ?? null,
    ];
    
    await db.query(
      `INSERT INTO user (${fields.join(", ")})
       VALUES (${fields.map(() => "?").join(", ")})`,
      values
    );

    // retrieve inserted data
    const [data] = await db.query("SELECT * FROM user WHERE id = ?", [id]);

    if (data.length === 0) {
      return response.status(404).json({ erroror: "Inserted row not found" });
    }

    response.json(data[0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Update tourist user
export async function updateTourist(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  try {
    await db.query("UPDATE user SET name = ? WHERE tourist_id = ?", [name, id]);
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update owner user
export async function updateOwner(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  try {
    await db.query("UPDATE user SET name = ? WHERE owner_id = ?", [name, id]);
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update tourism user
export async function updateTourism(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  try {
    await db.query("UPDATE user SET name = ? WHERE tourism_id = ?", [name, id]);
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete user by ID
export async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM user WHERE id = ?", [id]);
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
