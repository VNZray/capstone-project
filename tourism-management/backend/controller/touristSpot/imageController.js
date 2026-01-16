import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";

// Get all images for a tourist spot
export const getTouristSpotImages = async (request, response) => {
  try {
    const { tourist_spot_id } = request.params;

    const [data] = await db.query("CALL GetTouristSpotImages(?)", [tourist_spot_id]);
    const images = data[0] || [];

    response.json({
      success: true,
      data: images,
      message: "Tourist spot images retrieved successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Add a new image to a tourist spot
export const addTouristSpotImage = async (request, response) => {
  try {
    const { tourist_spot_id } = request.params;
    const { file_url, file_format, file_size, is_primary, alt_text } = request.body;

    if (!file_url || !file_format) {
      return response.status(400).json({
        success: false,
        message: "file_url and file_format are required",
      });
    }

    // Verify tourist spot exists before inserting image
    const [spotCheck] = await db.query("CALL GetTouristSpotById(?)", [tourist_spot_id]);
    const spotData = spotCheck?.[0] || [];
    if (!spotData.length) {
      return response.status(404).json({
        success: false,
        message: "Tourist spot not found",
      });
    }

    const [insertRes] = await db.query("CALL AddTouristSpotImage(?,?,?,?,?,?)", [
      tourist_spot_id,
      file_url,
      file_format,
      file_size || null,
      is_primary || false,
      alt_text || null,
    ]);
    const newImage = insertRes[0] || [];

    response.status(201).json({
      success: true,
      data: newImage[0],
      message: "Tourist spot image added successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Update an existing image (mainly for setting primary, alt text)
export const updateTouristSpotImage = async (request, response) => {
  try {
    const { tourist_spot_id, image_id } = request.params;
    const { is_primary, alt_text } = request.body;

    if (is_primary === undefined && alt_text === undefined) {
      return response.status(400).json({ success: false, message: "No valid fields provided for update" });
    }

    const [updateRes] = await db.query("CALL UpdateTouristSpotImage(?,?,?,?)", [
      tourist_spot_id,
      image_id,
      is_primary ?? null,
      alt_text ?? null,
    ]);
    const updatedImage = updateRes[0] || [];

    response.json({
      success: true,
      data: updatedImage[0],
      message: "Tourist spot image updated successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Delete an image
export const deleteTouristSpotImage = async (request, response) => {
  try {
    const { tourist_spot_id, image_id } = request.params;

    const [delRes] = await db.query("CALL DeleteTouristSpotImage(?,?)", [tourist_spot_id, image_id]);
    const affected = delRes[0] && delRes[0][0] ? delRes[0][0].affected_rows : 0;
    if (!affected) {
      return response.status(404).json({ success: false, message: "Tourist spot image not found" });
    }

    response.json({
      success: true,
      message: "Tourist spot image deleted successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Set primary image for a tourist spot
export const setPrimaryTouristSpotImage = async (request, response) => {
  try {
    const { tourist_spot_id, image_id } = request.params;

    const [resSet] = await db.query("CALL SetPrimaryTouristSpotImage(?,?)", [tourist_spot_id, image_id]);
    const affected = resSet[0] && resSet[0][0] ? resSet[0][0].affected_rows : undefined;

    response.json({
      success: true,
      message: "Primary image set successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};
