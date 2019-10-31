exports.up = knex =>
  knex.raw(`
    ALTER TABLE targets 
    ADD COLUMN is_name_alias BOOLEAN DEFAULT FALSE NOT NULL;
  `);

exports.down = knex =>
  knex.raw(`
    ALTER TABLE targets 
    DROP COLUMN is_name_alias;
`);
