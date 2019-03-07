exports.up = knex => {
  return knex.schema.createTable("client_permissions", t => {
    t.uuid("user_id")
      .references("id")
      .inTable("users")
      .notNull();
    t.uuid("client_id")
      .references("id")
      .inTable("clients")
      .notNull();
    t.string("permission").notNull();
    t.primary(["user_id", "client_id", "permission"]);
  });
};

exports.down = knex => {
  return knex.schema.dropTable("client_permissions");
};
