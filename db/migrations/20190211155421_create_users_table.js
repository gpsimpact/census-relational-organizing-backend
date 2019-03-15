exports.up = knex =>
  knex.raw(`
    CREATE TABLE users (
        id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        first_name VARCHAR NOT NULL,
        last_name VARCHAR NOT NULL,
        phone VARCHAR(12) NOT NULL,
        address VARCHAR NOT NULL,
        city VARCHAR NOT NULL,
        state VARCHAR NOT NULL,
        zip5 VARCHAR(5) NOT NULL,
        email VARCHAR NOT NULL,
        active boolean DEFAULT true
    );
  `);

exports.down = knex => knex.raw(`DROP TABLE IF EXISTS users`);
