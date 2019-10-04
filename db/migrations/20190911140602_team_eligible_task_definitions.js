exports.down = knex => {
  return knex.raw(`
          DROP TABLE IF EXISTS team_eligible_task_definitions;
      `);
};

exports.up = knex => {
  return knex.raw(`
          CREATE TABLE team_eligible_task_definitions (
                team_id uuid REFERENCES teams(id) NOT NULL,
                task_definition_id uuid REFERENCES task_definitions(id),
                PRIMARY KEY(team_id, task_definition_id)
          );
      `);
};
