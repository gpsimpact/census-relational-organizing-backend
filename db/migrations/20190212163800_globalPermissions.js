exports.up = knex =>
  knex.raw(`
  CREATE TABLE global_permissions (
    user_id uuid REFERENCES users(id),
    permission character varying(255),
    CONSTRAINT global_permissions_pkey PRIMARY KEY (user_id, permission)
  );
`);

exports.down = knex => knex.raw(`DROP TABLE IF EXISTS global_permissions`);
