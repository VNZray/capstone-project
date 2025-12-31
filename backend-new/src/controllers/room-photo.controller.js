/**
 * Room Photo Controller
 * Handles room photo management
 */
import { RoomPhoto, Room, sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';

/**
 * Get all photos for a room
 */
export const getRoomPhotos = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const photos = await RoomPhoto.findAll({
      where: { room_id: roomId },
      order: [['is_primary', 'DESC'], ['created_at', 'ASC']]
    });

    res.success(photos);
  } catch (error) {
    next(error);
  }
};

/**
 * Get photo by ID
 */
export const getRoomPhotoById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const photo = await RoomPhoto.findByPk(id);

    if (!photo) {
      throw ApiError.notFound('Room photo not found');
    }

    res.success(photo);
  } catch (error) {
    next(error);
  }
};

/**
 * Add photo to room
 */
export const addRoomPhoto = async (req, res, next) => {
  try {
    const { room_id, photo_url, caption, is_primary = false } = req.body;

    if (!room_id || !photo_url) {
      throw ApiError.badRequest('room_id and photo_url are required');
    }

    // Verify room exists
    const room = await Room.findByPk(room_id);
    if (!room) {
      throw ApiError.notFound('Room not found');
    }

    // If setting as primary, unset other primaries
    if (is_primary) {
      await RoomPhoto.update(
        { is_primary: false },
        { where: { room_id } }
      );
    }

    const photo = await RoomPhoto.create({
      id: uuidv4(),
      room_id,
      photo_url,
      caption,
      is_primary
    });

    res.created(photo, 'Room photo added successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Add multiple photos to room
 */
export const addBulkRoomPhotos = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { room_id, photos } = req.body;

    if (!room_id || !photos || !Array.isArray(photos)) {
      throw ApiError.badRequest('room_id and photos array are required');
    }

    // Verify room exists
    const room = await Room.findByPk(room_id);
    if (!room) {
      throw ApiError.notFound('Room not found');
    }

    const createdPhotos = await Promise.all(
      photos.map((photo, index) =>
        RoomPhoto.create({
          id: uuidv4(),
          room_id,
          photo_url: photo.photo_url,
          caption: photo.caption,
          is_primary: index === 0 && photo.is_primary !== false
        }, { transaction })
      )
    );

    await transaction.commit();

    res.created(createdPhotos, 'Room photos added successfully');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Update room photo
 */
export const updateRoomPhoto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { photo_url, caption, is_primary } = req.body;

    const photo = await RoomPhoto.findByPk(id);

    if (!photo) {
      throw ApiError.notFound('Room photo not found');
    }

    // If setting as primary, unset other primaries
    if (is_primary) {
      await RoomPhoto.update(
        { is_primary: false },
        { where: { room_id: photo.room_id } }
      );
    }

    await photo.update({
      photo_url: photo_url ?? photo.photo_url,
      caption: caption ?? photo.caption,
      is_primary: is_primary ?? photo.is_primary
    });

    res.success(photo, 'Room photo updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Set photo as primary
 */
export const setRoomPhotoPrimary = async (req, res, next) => {
  try {
    const { id } = req.params;

    const photo = await RoomPhoto.findByPk(id);

    if (!photo) {
      throw ApiError.notFound('Room photo not found');
    }

    // Unset other primaries
    await RoomPhoto.update(
      { is_primary: false },
      { where: { room_id: photo.room_id } }
    );

    // Set this as primary
    await photo.update({ is_primary: true });

    res.success(photo, 'Room photo set as primary');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete room photo
 */
export const deleteRoomPhoto = async (req, res, next) => {
  try {
    const { id } = req.params;

    const photo = await RoomPhoto.findByPk(id);

    if (!photo) {
      throw ApiError.notFound('Room photo not found');
    }

    await photo.destroy();

    res.success(null, 'Room photo deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete all photos for a room
 */
export const deleteAllRoomPhotos = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    await RoomPhoto.destroy({
      where: { room_id: roomId }
    });

    res.success(null, 'All room photos deleted successfully');
  } catch (error) {
    next(error);
  }
};
