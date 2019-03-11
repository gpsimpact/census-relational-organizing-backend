exports.up = knex =>
  knex.raw(`
    CREATE TABLE users (
        id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        name character varying(255) NOT NULL,
        email character varying(255) NOT NULL,
        active boolean DEFAULT true,
        abbreviation character varying(7)
    );
  `);

exports.down = knex => knex.raw(`DROP TABLE IF EXISTS users`);
