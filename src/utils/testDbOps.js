// import { map } from "lodash";
import knex from "./knexInstance";
import redis from "../redis";

export const dbUp = async () => {
  await knex.raw(`
    TRUNCATE TABLE users CASCADE;
    TRUNCATE TABLE teams CASCADE;
    TRUNCATE TABLE global_permissions CASCADE;
    TRUNCATE TABLE team_permissions CASCADE;
    TRUNCATE TABLE targets CASCADE;
  `);
  await redis.flushdb();
};

export const dbDown = async () => {
  // await Promise.all(
  //   map(tableList, table => knex.raw(`TRUNCATE TABLE ${table} CASCADE;`)),
  //   redis.flushdb()
  // );
};
