const {
  addTimeStamps,
  removeTimeStampsColumns
} = require("../utils/timestamps");

exports.up = (knex, Promise) => {
  return Promise.all([addTimeStamps(knex, "task_assignment_status")]);
};

exports.down = (knex, Promise) => {
  return Promise.all([removeTimeStampsColumns(knex, "task_assignment_status")]);
};
