exports.down = knex => {
  return knex.raw(`
              DROP TABLE IF EXISTS task_assignment_status;
          `);
};

exports.up = knex => {
  return knex.raw(`
              CREATE TABLE task_assignment_status (
                        target_id uuid REFERENCES targets(id) NOT NULL,
                        task_assignment_id uuid REFERENCES task_assignments(id) NOT NULL,
                        completed_by uuid REFERENCES users(id),
                        complete BOOLEAN DEFAULT FALSE,
                        PRIMARY KEY(target_id, task_assignment_id)
              );
          `);
};
