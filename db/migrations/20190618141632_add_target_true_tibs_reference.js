exports.up = knex => {
  return knex.raw(`
                ALTER TABLE target_true_tibs ADD COLUMN tib_id uuid REFERENCES tibs(id) NOT NULL
            `);
};

exports.down = knex => {
  return knex.raw(`
                ALTER TABLE target_true_tibs DROP COLUMN tib_id;
            `);
};
