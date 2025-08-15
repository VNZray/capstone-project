import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";

export async function getAmenities(request, response) {
  try {
    const [data] = await db.query("SELECT * FROM amenity");
    response.json(data);
  } catch (error) {
    console.error("Error fetching amenities:", error);
    return handleDbError(error, response);
  }
}
