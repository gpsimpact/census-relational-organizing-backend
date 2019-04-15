exports.up = knex => {
  return knex.raw(
    `
        CREATE TABLE dynamic_value_store (
            field_id uuid,
            user_id uuid REFERENCES users(id),
            value varchar
        );
      `
  );
};

exports.down = knex => {
  return knex.raw(`
        DROP TABLE IF EXISTS dynamic_value_store;
    `);
};
