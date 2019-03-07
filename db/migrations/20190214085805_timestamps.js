const {
  addTimeStamps,
  removeTimeStampsColumns
} = require("../utils/timestamps");

exports.up = (knex, Promise) => {
  return Promise.all([
    addTimeStamps(knex, "users"),
    addTimeStamps(knex, "clients"),
    addTimeStamps(knex, "global_permissions"),
    addTimeStamps(knex, "client_permissions")
  ]);
};

exports.down = (knex, Promise) => {
  return Promise.all([
    removeTimeStampsColumns(knex, "users"),
    removeTimeStampsColumns(knex, "clients"),
    removeTimeStampsColumns(knex, "global_permissions"),
    removeTimeStampsColumns(knex, "client_permissions")
  ]);
};
