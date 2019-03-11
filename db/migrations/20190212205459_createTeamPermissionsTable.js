exports.up = knex =>
  knex.raw(`
  CREATE TABLE team_permissions (
      user_id uuid REFERENCES users(id),
      team_id uuid REFERENCES teams(id),
      permission character varying(255),
      CONSTRAINT team_permissions_pkey PRIMARY KEY (user_id, team_id, permission)
    );
`);

exports.down = knex => knex.raw(`DROP TABLE IF EXISTS team_permissions;`);
