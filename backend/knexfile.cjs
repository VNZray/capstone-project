// knexfile.cjs
/**
 * Knex Configuration
 * 
 * TIMEZONE: Server uses PHT (+08:00). Connection timezone must match.
 * All timestamps in DB are stored as PHT. Handle conversion at app layer.
 */
require("dotenv").config();

module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "tourism_db",
      port: process.env.DB_PORT || 3306,
      timezone: "+08:00", // Match MariaDB server timezone (PHT/Asia/Manila)
    },
    migrations: {
      directory: "./migrations",
    },
    seeds: {
      directory: "./seeds",
    },
  },
};
