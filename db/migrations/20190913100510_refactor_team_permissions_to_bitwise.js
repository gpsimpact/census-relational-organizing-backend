exports.up = knex =>
  knex.raw(`
  CREATE TABLE team_permissions_bit (
      user_id uuid REFERENCES users(id),
      team_id uuid REFERENCES teams(id),
      permission SMALLINT DEFAULT 0,
      CONSTRAINT team_permissions_bit_pkey PRIMARY KEY (user_id, team_id)
    );
`);

exports.down = knex => knex.raw(`DROP TABLE IF EXISTS team_permissions_bit;`);
