exports.up = knex =>
  knex.raw(`
    ALTER TABLE targets 
    ADD COLUMN census_tract VARCHAR,
    ADD COLUMN retain_address BOOLEAN default true NOT NULL
  `);

exports.down = knex =>
  knex.raw(`
    ALTER TABLE targets 
    DROP COLUMN census_tract,
    DROP COLUMN retain_address
`);
