exports.up = knex =>
  knex.raw(`
    ALTER TABLE targets 
    ADD COLUMN gender_identity VARCHAR,
    ADD COLUMN sexual_orientation VARCHAR,
    ADD COLUMN race_ethnicity VARCHAR;
  `);

exports.down = knex =>
  knex.raw(`
    ALTER TABLE targets 
    DROP COLUMN gender_identity,
    DROP COLUMN sexual_orientation,
    DROP COLUMN race_ethnicity;
`);
