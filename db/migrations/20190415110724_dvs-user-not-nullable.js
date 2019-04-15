exports.up = knex => {
  return knex.raw(
    `
          ALTER TABLE dynamic_value_store ALTER COLUMN user_id SET NOT NULL;
      `
  );
};

exports.down = knex => {
  return knex.raw(`
    ALTER TABLE dynamic_value_store ALTER COLUMN user_id DROP NOT NULL;
        `);
};
