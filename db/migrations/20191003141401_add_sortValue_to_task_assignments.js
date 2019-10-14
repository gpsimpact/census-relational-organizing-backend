exports.up = knex =>
  knex.raw(`
    ALTER TABLE task_assignments 
    ADD COLUMN sort_value SMALLINT;
  `);

exports.down = knex =>
  knex.raw(`
    ALTER TABLE task_assignments 
    DROP COLUMN sort_value;
`);