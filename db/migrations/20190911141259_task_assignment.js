exports.down = knex => {
  return knex.raw(`
            DROP TABLE IF EXISTS task_assignments;
        `);
};

exports.up = knex => {
  return knex.raw(`
            CREATE TABLE task_assignments (
                    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
                    team_id uuid REFERENCES teams(id) NOT NULL,
                    task_definition_id uuid REFERENCES task_definitions(id) NOT NULL,
                    active BOOLEAN DEFAULT TRUE,
                    task_required_roles SMALLINT DEFAULT 0
            );
        `);
};
