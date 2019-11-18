exports.up = knex =>
  knex.raw(`
    ALTER TABLE form_values 
        DROP CONSTRAINT IF EXISTS form_values_form_id_fkey;
  `);

exports.down = knex =>
  knex.raw(`
  -- ALTER TABLE task_definitions ADD CONSTRAINT form_values_form_id_fkey FOREIGN KEY (form_id) REFERENCES forms (id);
`);
