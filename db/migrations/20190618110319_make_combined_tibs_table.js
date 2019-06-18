exports.up = knex => {
  return knex.raw(`
              CREATE TABLE tibs (
                    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
                    active BOOLEAN DEFAULT TRUE,
                    visible BOOLEAN DEFAULT TRUE,
                    user_id uuid REFERENCES users(id) NOT NULL,
                    team_id uuid REFERENCES teams(id),
                    text VARCHAR NOT NULL,
                    is_global BOOLEAN DEFAULT FALSE
              );
          `);
};

exports.down = knex => {
  return knex.raw(`
              DROP TABLE IF EXISTS tibs;
          `);
};
