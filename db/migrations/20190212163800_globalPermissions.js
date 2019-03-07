exports.up = knex => {
  return knex.schema.createTable("global_permissions", t => {
    t.uuid("user_id")
      .references("id")
      .inTable("users")
      .notNull();
    t.string("permission").notNull();
    t.primary(["user_id", "permission"]);
  });
};

exports.down = knex => {
  return knex.schema.dropTable("global_permissions");
};
