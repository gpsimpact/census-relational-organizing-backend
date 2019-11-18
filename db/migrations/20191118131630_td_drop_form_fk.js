exports.up = knex =>
  knex.raw(`
    ALTER TABLE task_definitions 
        DROP CONSTRAINT IF EXISTS task_definitions_form_id_fkey;
  `);

exports.down = knex =>
  knex.raw(`
  -- ALTER TABLE task_definitions ADD CONSTRAINT task_definitions_form_id_fkey FOREIGN KEY (form_id) REFERENCES forms (id);
`);
