const {
  addTimeStamps,
  removeTimeStampsColumns
} = require("../utils/timestamps");

exports.up = (knex, Promise) => {
  return Promise.all([addTimeStamps(knex, "team_eligible_task_definitions")]);
};

exports.down = (knex, Promise) => {
  return Promise.all([
    removeTimeStampsColumns(knex, "team_eligible_task_definitions")
  ]);
};
