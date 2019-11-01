exports.up = knex =>
  knex.raw(`
    ALTER TABLE teams 
    ADD COLUMN tos VARCHAR;
  `);

exports.down = knex =>
  knex.raw(`
    ALTER TABLE teams 
    DROP COLUMN tos;
`);
