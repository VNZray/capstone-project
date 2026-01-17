// knexfile.cjs
/**
 * Knex Configuration for Mobile Backend
 *
 * IMPORTANT: Mobile backend shares the database with the main backend.
 * Migrations are located in the main backend folder.
 *
 * TIMEZONE: Server uses PHT (+08:00). Connection timezone must match.
 * All timestamps in DB are stored as PHT. Handle conversion at app layer.
 */
require("dotenv").config();

module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      timezone: "+08:00", // Match MariaDB server timezone (PHT/Asia/Manila)
    },
    migrations: {
      directory: "../../backend/migrations", // Use main backend migrations
    },
    seeds: {
      directory: "./seeds",
    },
  },
};
