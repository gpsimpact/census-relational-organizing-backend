exports.up = knex =>
  knex.raw(`
    CREATE TABLE targets (
        id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        first_name VARCHAR NOT NULL,
        last_name VARCHAR NOT NULL,
        active boolean DEFAULT true
    );
  `);

exports.down = knex => knex.raw(`DROP TABLE IF EXISTS targets`);
