/**
 * Address Controller
 * Handles province, municipality, and barangay address lookups
 */
import { Province, Municipality, Barangay, sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';
import logger from '../config/logger.js';

/**
 * Get all provinces
 */
export const getAllProvinces = async (req, res, next) => {
  try {
    const queryResult = await sequelize.query('CALL GetAllProvinces()');
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    logger.error('Error fetching provinces:', error);
    next(error);
  }
};

/**
 * Get province by ID
 */
export const getProvinceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const queryResult = await sequelize.query('CALL GetProvinceById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Province not found');
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all municipalities
 */
export const getAllMunicipalities = async (req, res, next) => {
  try {
    const queryResult = await sequelize.query('CALL GetAllMunicipalities()');
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    next(error);
  }
};

/**
 * Get municipality by ID
 */
export const getMunicipalityById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const queryResult = await sequelize.query('CALL GetMunicipalityById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Municipality not found');
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get municipalities by province ID
 */
export const getMunicipalitiesByProvinceId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const queryResult = await sequelize.query('CALL GetMunicipalitiesByProvinceId(?)', {
      replacements: [id]
    });
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all barangays
 */
export const getAllBarangays = async (req, res, next) => {
  try {
    const queryResult = await sequelize.query('CALL GetAllBarangays()');
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    next(error);
  }
};

/**
 * Get barangay by ID
 */
export const getBarangayById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const queryResult = await sequelize.query('CALL GetBarangayById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Barangay not found');
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get barangays by municipality ID
 */
export const getBarangaysByMunicipalityId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const queryResult = await sequelize.query('CALL GetBarangaysByMunicipalityId(?)', {
      replacements: [id]
    });
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    next(error);
  }
};

/**
 * Get full address by barangay ID
 */
export const getFullAddressByBarangayId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const queryResult = await sequelize.query('CALL GetFullAddressByBarangayId(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Address not found');
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};
