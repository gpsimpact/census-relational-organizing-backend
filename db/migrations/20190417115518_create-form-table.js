exports.up = knex => {
  return knex.raw(`
          CREATE TABLE forms (
              id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
              user_id uuid REFERENCES users(id) NOT NULL,
              title VARCHAR NOT NULL,
              button_text VARCHAR NOT NULL,
              fields JSONB,
              redirect_route VARCHAR
          );
      `);
};

exports.down = knex => {
  return knex.raw(`
          DROP TABLE IF EXISTS forms;
      `);
};
