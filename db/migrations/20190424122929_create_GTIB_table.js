exports.up = knex => {
  return knex.raw(`
          CREATE TABLE gtibs (
                id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
                active BOOLEAN DEFAULT TRUE,
                visible BOOLEAN DEFAULT TRUE,
                user_id uuid REFERENCES users(id) NOT NULL,
                text VARCHAR NOT NULL
          );
      `);
};

exports.down = knex => {
  return knex.raw(`
          DROP TABLE IF EXISTS gtibs;
      `);
};
