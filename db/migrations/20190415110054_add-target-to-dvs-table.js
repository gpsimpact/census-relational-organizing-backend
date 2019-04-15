exports.up = knex => {
  return knex.raw(
    `
        ALTER TABLE dynamic_value_store ADD COLUMN target_id UUID REFERENCES targets(id) NOT NULL;
    `
  );
};

exports.down = knex => {
  return knex.raw(`
        ALTER TABLE dynamic_value_store DROP COLUMN target_id;
      `);
};
