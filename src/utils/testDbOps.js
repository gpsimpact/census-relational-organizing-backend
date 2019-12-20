// import { map } from "lodash";
import knex from "./knexInstance";
import { pool } from "../db";
import redis from "../redis";

export const dbUp = async () => {
  // await knex.initialize("test");
  await knex.raw(`
    TRUNCATE TABLE users CASCADE;
    TRUNCATE TABLE teams CASCADE;
    TRUNCATE TABLE global_permissions CASCADE;
    TRUNCATE TABLE team_permissions CASCADE;
    TRUNCATE TABLE targets CASCADE;
  `);
  await redis.flushdb();
  await knex.destroy();
  await knex.initialize("test");
};

export const dbDown = async () => {
  // await Promise.all(
  //   map(tableList, table => knex.raw(`TRUNCATE TABLE ${table} CASCADE;`)),
  //   redis.flushdb()
  // );
  await knex.destroy();
  await pool.end();
};
