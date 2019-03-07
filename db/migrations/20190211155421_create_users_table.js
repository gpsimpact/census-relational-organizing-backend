exports.up = knex => {
  return knex.schema.createTable("users", t => {
    t.uuid("id")
      .primary()
      .notNull()
      .defaultTo(knex.raw("uuid_generate_v4()"));
    t.string("name").notNull();
    t.string("email").notNull();
    t.boolean("active").defaultTo(true);
  });
};

exports.down = knex => {
  return knex.schema.dropTable("users");
};
