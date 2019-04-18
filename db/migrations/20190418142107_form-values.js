exports.up = knex => {
  return knex.raw(`
            CREATE TABLE form_values (
                form_id uuid REFERENCES forms(id) NOT NULL,
                user_id uuid REFERENCES users(id) NOT NULL,
                target_id UUID REFERENCES targets(id) NOT NULL,
                name VARCHAR NOT NULL,
                value VARCHAR NOT NULL,
                PRIMARY KEY(form_id, target_id, name)
            );
        `);
};

exports.down = knex => {
  return knex.raw(`
            DROP TABLE IF EXISTS form_values;
        `);
};
