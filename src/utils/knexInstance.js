import Knex from "knex";

const knexfile = require("../../knexfile");

export default Knex({
  ...knexfile
});
