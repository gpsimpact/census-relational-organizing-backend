const {
  addTimeStamps,
  removeTimeStampsColumns
} = require("../utils/timestamps");

exports.up = (knex, Promise) => {
  return Promise.all([addTimeStamps(knex, "targets")]);
};

exports.down = (knex, Promise) => {
  return Promise.all([removeTimeStampsColumns(knex, "targets")]);
};
