const {
  addTimeStamps,
  removeTimeStampsColumns
} = require("../utils/timestamps");

exports.up = (knex, Promise) => {
  return Promise.all([addTimeStamps(knex, "target_true_tibs")]);
};

exports.down = (knex, Promise) => {
  return Promise.all([removeTimeStampsColumns(knex, "target_true_tibs")]);
};
