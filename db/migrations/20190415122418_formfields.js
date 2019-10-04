exports.up = (/* knex */) => {
  //   return knex.raw(`
  //         CREATE TABLE form_fields (
  //             id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  //             user_id uuid REFERENCES users(id) NOT NULL,
  //             label VARCHAR NOT NULL,
  //             type VARCHAR NOT NULL,
  //             name VARCHAR NOT NULL,
  //             select_options JSONB,
  //             placeholder VARCHAR,
  //             validation_tests JSONB,
  //             validation_type VARCHAR
  //         );
  //     `);
};

exports.down = knex => {
  return knex.raw(`
        DROP TABLE IF EXISTS form_fields;
    `);
};
