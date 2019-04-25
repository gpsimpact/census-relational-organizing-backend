exports.up = knex => {
  return knex.raw(`
            CREATE TABLE ttibs (
                  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
                  active BOOLEAN DEFAULT TRUE,
                  visible BOOLEAN DEFAULT TRUE,
                  user_id uuid REFERENCES users(id) NOT NULL,
                  team_id uuid REFERENCES teams(id) NOT NULL,
                  text VARCHAR NOT NULL,
                  gtib_link UUID REFERENCES gtibs(id)
            );
        `);
};

exports.down = knex => {
  return knex.raw(`
            DROP TABLE IF EXISTS ttibs;
        `);
};
