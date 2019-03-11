const {
  addTimeStamps,
  removeTimeStampsColumns
} = require("../utils/timestamps");

exports.up = (knex, Promise) => {
  return Promise.all([
    addTimeStamps(knex, "users"),
    addTimeStamps(knex, "teams"),
    addTimeStamps(knex, "global_permissions"),
    addTimeStamps(knex, "team_permissions")
  ]);
};

exports.down = (knex, Promise) => {
  return Promise.all([
    removeTimeStampsColumns(knex, "users"),
    removeTimeStampsColumns(knex, "teams"),
    removeTimeStampsColumns(knex, "global_permissions"),
    removeTimeStampsColumns(knex, "team_permissions")
  ]);
};
