// Helper function to handle database errors
export function handleDbError(error, response) {
  console.error("Database Error:", error);

  let errorMessage = "An unexpected database error occurred.";
  let statusCode = 500;

  switch (error.code) {
    case "ER_DUP_ENTRY": // Duplicate entry for a unique key
      errorMessage = "Duplicate entry. This record already exists.";
      statusCode = 409;
      break;

    case "ER_NO_REFERENCED_ROW_2": // Foreign key constraint fails (insert/update)
      errorMessage = "Foreign key constraint failed. Related record not found.";
      statusCode = 400;
      break;

    case "ER_ROW_IS_REFERENCED_2": // Foreign key constraint fails (delete)
      errorMessage =
        "Cannot delete this record because it is referenced by other data.";
      statusCode = 400;
      break;

    case "ER_BAD_FIELD_ERROR": // Invalid column name
      errorMessage = "Invalid field/column specified in the query.";
      statusCode = 400;
      break;

    case "ER_PARSE_ERROR": // SQL syntax error
      errorMessage = "Database query syntax error.";
      statusCode = 400;
      break;

    case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD": // Data type mismatch
      errorMessage = "Invalid value for a database field.";
      statusCode = 400;
      break;

    case "PROTOCOL_CONNECTION_LOST":
      errorMessage = "Database connection was lost.";
      statusCode = 503;
      break;

    case "ECONNREFUSED":
      errorMessage = "Database connection was refused.";
      statusCode = 503;
      break;
  }

  response.status(statusCode).json({ error: errorMessage, code: error.code });
}
