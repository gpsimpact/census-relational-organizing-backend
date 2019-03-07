exports.up = knex => {
  return knex.schema.createTable("clients", t => {
    t.uuid("id")
      .primary()
      .notNull()
      .defaultTo(knex.raw("uuid_generate_v4()"));
    t.string("name")
      .notNull()
      .unique();
    t.string("description");
    t.string("abbreviation", 7)
      .notNull()
      .unique();
    t.string("slug")
      .notNull()
      .unique();
  });
};

exports.down = knex => {
  return knex.schema.dropTable("clients");
};
