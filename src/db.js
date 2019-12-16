// import pg from "pg";
// import sqorn from "@sqorn/pg";
require("dotenv").config();

const pg = require("pg");
const sqorn = require("@sqorn/pg");

const environment = process.env.NODE_ENV || "development";

if (environment === "production") {
  console.log("PRODUCTION, SSL TRUE");
  pg.defaults.ssl = true;
}

const testDbURL =
  process.env.CI === "true"
    ? process.env.DATABASE_URL
    : process.env.DATABASE_URL_LOCAL_TESTING;

const connectionString =
  environment === "test" ? testDbURL : process.env.DATABASE_URL;

export const pool = new pg.Pool({
  connectionString:
    environment === "production"
      ? `${connectionString}?ssl=true`
      : connectionString,
  min: 1,
  max: 10
});

export const sq = sqorn({ pg, pool });
