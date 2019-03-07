// import { map } from "lodash";
import knex from "./knexInstance";
import redis from "../redis";

// const tableList = [
//   "users",
//   "clients",
//   "global_permissions",
//   "client_permissions",
//   "insertion_orders_current",
//   "insertion_orders_revisions",
//   "insertion_orders_line_items_current",
//   "insertion_orders_line_items_revisions"
// ];

export const dbUp = async () => {
  await knex.raw(`
    TRUNCATE TABLE users CASCADE;
    TRUNCATE TABLE clients CASCADE;
    TRUNCATE TABLE global_permissions CASCADE;
    TRUNCATE TABLE client_permissions CASCADE;
    TRUNCATE TABLE insertion_orders_current CASCADE;
    TRUNCATE TABLE insertion_orders_revisions CASCADE;
    TRUNCATE TABLE insertion_orders_line_items_current CASCADE;
    TRUNCATE TABLE insertion_orders_line_items_revisions CASCADE;
  `);
  await redis.flushdb();
};
// await Promise.all(
//   knex.raw(`
//     TRUNCATE TABLE users CASCADE;
//     TRUNCATE TABLE clients CASCADE;
//     TRUNCATE TABLE global_permissions CASCADE;
//     TRUNCATE TABLE client_permissions CASCADE;
//     TRUNCATE TABLE insertion_orders_current CASCADE;
//     TRUNCATE TABLE insertion_orders_revisions CASCADE;
//     TRUNCATE TABLE insertion_orders_line_items_current CASCADE;
//     TRUNCATE TABLE insertion_orders_line_items_revisions CASCADE;
//   `),
//   redis.flushdb()
// );

export const dbDown = async () => {
  // await Promise.all(
  //   map(tableList, table => knex.raw(`TRUNCATE TABLE ${table} CASCADE;`)),
  //   redis.flushdb()
  // );
};
