exports.up = knex => {
  return knex.raw(`
                  DROP TABLE IF EXISTS target_contact_attempts;
              `);
};

exports.down = knex => {
  return knex.raw(`
              CREATE TABLE target_contact_attempts (
                    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
                    active BOOLEAN DEFAULT TRUE,
                    target_id uuid REFERENCES targets(id) NOT NULL,
                    created_by uuid REFERENCES users(id) NOT NULL,
                    last_edited_by uuid REFERENCES users(id),
                    content TEXT,
                    disposition VARCHAR NOT NULL
              );
          `);
};
