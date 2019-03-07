exports.up = knex => {
  return knex.schema.createTable("cycles", t => {
    t.uuid("id")
      .primary()
      .notNull()
      .defaultTo(knex.raw("uuid_generate_v4()"));
    t.string("name").notNull();
    t.string("category").notNull();
    t.uuid("client_id")
      .references("id")
      .inTable("clients")
      .notNull();
    t.boolean("active").defaultTo(true);
    t.string("reporting_id");
    // Open Civic Data Division ID used by Google among others
    // ocd-division/country:us/state:wy/cd:1
    t.string("ocdid");
    t.string("election_cycle");
    // on resolver side need to split out into engagementStart, engagementEnd
    t.specificType("engagement_dates", "daterange");
  });
};

exports.down = knex => {
  return knex.schema.dropTable("cycles");
};
