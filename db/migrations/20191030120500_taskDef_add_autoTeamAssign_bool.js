exports.up = knex =>
  knex.raw(`
    ALTER TABLE task_definitions 
    ADD COLUMN auto_add_new_teams BOOLEAN DEFAULT FALSE,
    ADD COLUMN auto_add_sort_value SMALLINT
  `);

exports.down = knex =>
  knex.raw(`
    ALTER TABLE task_definitions 
    DROP COLUMN auto_add_new_teams,
    DROP COLUMN auto_add_sort_value;
`);
