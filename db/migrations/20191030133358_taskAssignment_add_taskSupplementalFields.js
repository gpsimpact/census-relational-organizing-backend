exports.up = knex =>
  knex.raw(`
    ALTER TABLE task_assignments 
    ADD COLUMN supplemental_fields JSONB ;
  `);

exports.down = knex =>
  knex.raw(`
    ALTER TABLE task_assignments 
    DROP COLUMN supplemental_fields;
`);
