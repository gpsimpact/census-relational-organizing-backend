exports.up = knex =>
  knex.raw(`
    CREATE TABLE teams (
        id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        name character varying(255) NOT NULL UNIQUE,
        description character varying(255),
        slug character varying(255) NOT NULL UNIQUE,
        active boolean DEFAULT true
    );
  `);

exports.down = knex =>
  knex.raw(`
        -- can drop this line after one migration
        DROP TABLE IF EXISTS clients;
        DROP TABLE IF EXISTS teams;
      `);
