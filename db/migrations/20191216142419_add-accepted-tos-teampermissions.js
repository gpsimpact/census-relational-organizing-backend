exports.up = knex =>
  knex.raw(`
    ALTER TABLE team_permissions
    ADD COLUMN accepted_tos BOOLEAN NOT NULL DEFAULT FALSE;
  `);

exports.down = knex =>
  knex.raw(`
    ALTER TABLE team_permissions
    DROP COLUMN accepted_tos;
`);
