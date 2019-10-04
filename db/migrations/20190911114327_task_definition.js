exports.down = knex => {
  return knex.raw(`
        DROP TABLE IF EXISTS task_definitions;
    `);
};

exports.up = knex => {
  return knex.raw(`
        CREATE TABLE task_definitions (
            id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
            active BOOLEAN DEFAULT TRUE,
            form_id uuid REFERENCES forms(id) NOT NULL,
            created_by uuid REFERENCES users(id) NOT NULL,
            last_edited_by uuid REFERENCES users(id),
            points NUMERIC DEFAULT 0 NOT NULL,
            is_globally_available BOOLEAN DEFAULT FALSE
        );
    `);
};
