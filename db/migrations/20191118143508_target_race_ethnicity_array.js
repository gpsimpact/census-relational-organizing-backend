exports.up = knex =>
  knex.raw(`
    ALTER TABLE targets 
        ALTER COLUMN race_ethnicity TYPE text[] using array[race_ethnicity]
  `);

exports.down = knex =>
  knex.raw(`
  ALTER TABLE targets 
        ALTER COLUMN race_ethnicity TYPE VARCHAR;
`);
