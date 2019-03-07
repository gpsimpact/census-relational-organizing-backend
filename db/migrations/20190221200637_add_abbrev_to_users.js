exports.up = knex => {
  // create table as string
  // populate with name substring
  // set to .notNull() .unique();
  return knex.raw(`
    ALTER TABLE users ADD COLUMN abbreviation VARCHAR(7);
    -- UPDATE users SET abbreviation = SUBSTRING(uuid_generate_v4()::VARCHAR FROM 0 FOR 7) WHERE abbreviation IS NULL;
    -- ALTER TABLE users ALTER COLUMN abbreviation SET NOT NULL;
    -- ALTER TABLE users ADD CONSTRAINT users_abbreviation_unique UNIQUE (abbreviation);
    `);
};

exports.down = knex => {
  return knex.schema.table("users", t => {
    t.dropColumn("abbreviation");
  });
};
