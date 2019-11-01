exports.up = knex =>
  knex.raw(`
    ALTER TABLE team_permissions_bit 
    ADD COLUMN accepted_tos BOOLEAN NOT NULL DEFAULT FALSE;
  `);

exports.down = knex =>
  knex.raw(`
    ALTER TABLE team_permissions_bit 
    DROP COLUMN accepted_tos;
`);
