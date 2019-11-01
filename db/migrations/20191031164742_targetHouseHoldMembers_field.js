exports.up = knex =>
  knex.raw(`
    ALTER TABLE targets 
    ADD COLUMN household_members JSONB;
  `);

exports.down = knex =>
  knex.raw(`
    ALTER TABLE targets 
    DROP COLUMN household_members;
`);
