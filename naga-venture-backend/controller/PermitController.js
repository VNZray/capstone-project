// controllers/permitController.js
import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

export async function UploadPermit(request, response) {
  try {
    const id = uuidv4();

    // fields to insert
    const fields = [
      "id",
      "business_id",
      "permit_type",
      "file_url",
      "file_format",
      "file_size",
      "status",
    ];

    // map values from request.body or default to null
    const values = [id, ...fields.slice(1).map((f) => request.body[f] ?? null)];

    // insert into permit table
    await db.query(
      `INSERT INTO permit (${fields.join(", ")})
       VALUES (${fields.map(() => "?").join(", ")})`,
      values
    );

    // fetch the inserted record
    const [rows] = await db.query("SELECT * FROM permit WHERE id = ?", [id]);

    if (rows.length === 0) {
      return response.status(404).json({ error: "Inserted row not found" });
    }

    response.json(rows[0]); // return the inserted record
  } catch (error) {
    return handleDbError(error, response);
  }
}
