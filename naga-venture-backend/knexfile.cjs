// knexfile.cjs
module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: "localhost", // XAMPP usually runs here
      user: "root", // default user in XAMPP
      password: "", // default is empty password
      database: "naga_venture", // replace with your MariaDB database name
    },
    migrations: {
      directory: "./migrations",
    },
    seeds: {
      directory: "./seeds",
    },
  },
};
