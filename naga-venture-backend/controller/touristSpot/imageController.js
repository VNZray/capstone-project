import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";

// Get all images for a tourist spot
export const getTouristSpotImages = async (request, response) => {
  try {
    const { tourist_spot_id } = request.params;

    // Verify tourist spot exists
    const [spotCheck] = await db.execute(
      "SELECT id FROM tourist_spots WHERE id = ?",
      [tourist_spot_id]
    );

    if (spotCheck.length === 0) {
      return response.status(404).json({
        success: false,
        message: "Tourist spot not found",
      });
    }

    const [images] = await db.execute(
      `SELECT 
        id, tourist_spot_id, file_url, file_format, file_size, 
        is_primary, alt_text, uploaded_at, updated_at
      FROM tourist_spot_images 
      WHERE tourist_spot_id = ? 
      ORDER BY is_primary DESC, uploaded_at ASC`,
      [tourist_spot_id]
    );

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

    // Verify tourist spot exists
    const [spotCheck] = await db.execute(
      "SELECT id FROM tourist_spots WHERE id = ?",
      [tourist_spot_id]
    );

    if (spotCheck.length === 0) {
      return response.status(404).json({
        success: false,
        message: "Tourist spot not found",
      });
    }

    // If this is set as primary, unset other primary images for this spot
    if (is_primary) {
      await db.execute(
        "UPDATE tourist_spot_images SET is_primary = false WHERE tourist_spot_id = ?",
        [tourist_spot_id]
      );
    }

    // Generate UUID for the image
    const [[{ id: imageId }]] = await db.execute("SELECT UUID() AS id");

    await db.execute(
      `INSERT INTO tourist_spot_images 
      (id, tourist_spot_id, file_url, file_format, file_size, is_primary, alt_text)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        imageId,
        tourist_spot_id,
        file_url,
        file_format,
        file_size || null,
        is_primary || false,
        alt_text || null,
      ]
    );

    // Retrieve the created image
    const [newImage] = await db.execute(
      "SELECT * FROM tourist_spot_images WHERE id = ?",
      [imageId]
    );

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

    // Verify image exists and belongs to the tourist spot
    const [imageCheck] = await db.execute(
      "SELECT id FROM tourist_spot_images WHERE id = ? AND tourist_spot_id = ?",
      [image_id, tourist_spot_id]
    );

    if (imageCheck.length === 0) {
      return response.status(404).json({
        success: false,
        message: "Tourist spot image not found",
      });
    }

    // If this is set as primary, unset other primary images for this spot
    if (is_primary) {
      await db.execute(
        "UPDATE tourist_spot_images SET is_primary = false WHERE tourist_spot_id = ?",
        [tourist_spot_id]
      );
    }

    // Update the image
    const updateFields = [];
    const updateValues = [];

    if (is_primary !== undefined) {
      updateFields.push("is_primary = ?");
      updateValues.push(is_primary);
    }

    if (alt_text !== undefined) {
      updateFields.push("alt_text = ?");
      updateValues.push(alt_text);
    }

    if (updateFields.length === 0) {
      return response.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    updateValues.push(image_id);

    await db.execute(
      `UPDATE tourist_spot_images SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    // Retrieve the updated image
    const [updatedImage] = await db.execute(
      "SELECT * FROM tourist_spot_images WHERE id = ?",
      [image_id]
    );

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

    // Verify image exists and belongs to the tourist spot
    const [imageCheck] = await db.execute(
      "SELECT id FROM tourist_spot_images WHERE id = ? AND tourist_spot_id = ?",
      [image_id, tourist_spot_id]
    );

    if (imageCheck.length === 0) {
      return response.status(404).json({
        success: false,
        message: "Tourist spot image not found",
      });
    }

    await db.execute("DELETE FROM tourist_spot_images WHERE id = ?", [image_id]);

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

    // Verify image exists and belongs to the tourist spot
    const [imageCheck] = await db.execute(
      "SELECT id FROM tourist_spot_images WHERE id = ? AND tourist_spot_id = ?",
      [image_id, tourist_spot_id]
    );

    if (imageCheck.length === 0) {
      return response.status(404).json({
        success: false,
        message: "Tourist spot image not found",
      });
    }

    // First, unset all primary images for this spot
    await db.execute(
      "UPDATE tourist_spot_images SET is_primary = false WHERE tourist_spot_id = ?",
      [tourist_spot_id]
    );

    // Then set the specified image as primary
    await db.execute(
      "UPDATE tourist_spot_images SET is_primary = true WHERE id = ?",
      [image_id]
    );

    response.json({
      success: true,
      message: "Primary image set successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};
