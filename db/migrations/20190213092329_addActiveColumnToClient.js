exports.up = knex => {
  return knex.schema.table("clients", t => {
    t.boolean("active").defaultTo(true);
  });
};

exports.down = knex => {
  return knex.schema.table("clients", t => {
    t.dropColumn("active");
  });
};
