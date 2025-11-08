import db from "../../db.js";

// Create a new room photo
export const insertRoomPhoto = async (req, res) => {
  const { room_id, file_url, file_format, file_size } = req.body;

  try {
    await db.query(
      "CALL InsertRoomPhoto(?, ?, ?, ?)",
      [room_id, file_url, file_format, file_size]
    );

    res.status(201).json({
      message: "Room photo created successfully",
    });
  } catch (error) {
    console.error("Error inserting room photo:", error);
    res.status(500).json({
      error: "Failed to create room photo",
      details: error.message,
    });
  }
};

// Get all room photos
export const getAllRoomPhotos = async (req, res) => {
  try {
    const [results] = await db.query("CALL GetAllRoomPhotos()");
    res.status(200).json(results[0]);
  } catch (error) {
    console.error("Error fetching room photos:", error);
    res.status(500).json({
      error: "Failed to fetch room photos",
      details: error.message,
    });
  }
};

// Get room photo by ID
export const getRoomPhotoById = async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await db.query("CALL GetRoomPhotoById(?)", [id]);

    if (results[0].length === 0) {
      return res.status(404).json({ error: "Room photo not found" });
    }

    res.status(200).json(results[0][0]);
  } catch (error) {
    console.error("Error fetching room photo by ID:", error);
    res.status(500).json({
      error: "Failed to fetch room photo",
      details: error.message,
    });
  }
};

// Get all photos for a specific room
export const getRoomPhotosByRoomId = async (req, res) => {
  const { room_id } = req.params;

  try {
    const [results] = await db.query("CALL GetRoomPhotosByRoomId(?)", [room_id]);
    res.status(200).json(results[0]);
  } catch (error) {
    console.error("Error fetching room photos by room ID:", error);
    res.status(500).json({
      error: "Failed to fetch room photos",
      details: error.message,
    });
  }
};

// Update room photo by ID
export const updateRoomPhotoById = async (req, res) => {
  const { id } = req.params;
  const { file_url, file_format, file_size } = req.body;

  try {
    await db.query(
      "CALL UpdateRoomPhotoById(?, ?, ?, ?)",
      [id, file_url, file_format, file_size]
    );

    res.status(200).json({
      message: "Room photo updated successfully",
    });
  } catch (error) {
    console.error("Error updating room photo:", error);
    res.status(500).json({
      error: "Failed to update room photo",
      details: error.message,
    });
  }
};

// Delete room photo by ID
export const deleteRoomPhotoById = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("CALL DeleteRoomPhotoById(?)", [id]);

    res.status(200).json({
      message: "Room photo deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting room photo:", error);
    res.status(500).json({
      error: "Failed to delete room photo",
      details: error.message,
    });
  }
};

// Delete all photos for a specific room
export const deleteRoomPhotosByRoomId = async (req, res) => {
  const { room_id } = req.params;

  try {
    await db.query("CALL DeleteRoomPhotosByRoomId(?)", [room_id]);

    res.status(200).json({
      message: "All room photos deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting room photos by room ID:", error);
    res.status(500).json({
      error: "Failed to delete room photos",
      details: error.message,
    });
  }
};
