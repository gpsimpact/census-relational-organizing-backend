exports.up = knex =>
  knex.raw(`
    DROP TABLE team_permissions_bit;
`);

exports.down = knex =>
  knex.raw(`
    CREATE TABLE team_permissions_bit (
        user_id uuid REFERENCES users(id),
        team_id uuid REFERENCES teams(id),
        permission smallint DEFAULT 0,
        accepted_tos boolean NOT NULL DEFAULT false,
        CONSTRAINT team_permissions_bit_pkey PRIMARY KEY (user_id, team_id)
    );
`);
