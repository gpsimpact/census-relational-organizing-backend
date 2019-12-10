exports.up = knex =>
  knex.raw(`
    ALTER TABLE targets 
        ADD COLUMN is_phone_mobile BOOLEAN DEFAULT FALSE
  `);

exports.down = knex =>
  knex.raw(`
  ALTER TABLE targets 
        DROP COLUMN is_phone_mobile;
`);
