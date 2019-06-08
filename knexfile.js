require("dotenv").config();
const pg = require("pg");

// install pg ranges library
// https://www.shanestillwell.com/2018/06/29/setting-up-knex-project/
require("pg-range").install(pg);

const environment = process.env.NODE_ENV || "development";

const testDbURL =
  process.env.CI === "true"
    ? process.env.DATABASE_URL
    : process.env.DATABASE_URL_LOCAL_TESTING;

const configuration = {
  charset: "utf8",
  client: "pg",
  debug:
    (process.env.DEBUG && process.env.DEBUG.toLowerCase() === "true") || false,
  pool: {
    min: 0,
    max: 10
  },
  connection:
    process.env.NODE_ENV === "test" ? testDbURL : process.env.DATABASE_URL,
  migrations: {
    tableName: "knex_migrations",
    directory: `./db/migrations`
  },
  seeds: {
    directory: `./db/seeds/${environment}`
  }
};

module.exports = configuration;
module.exports[environment] = configuration;
