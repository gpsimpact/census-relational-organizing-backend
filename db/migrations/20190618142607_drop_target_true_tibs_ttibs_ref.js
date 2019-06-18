exports.up = knex => {
  return knex.raw(`
          ALTER TABLE target_true_tibs DROP COLUMN ttib_id;            
      `);
};

exports.down = knex => {
  return knex.raw(`
          ALTER TABLE target_true_tibs ADD COLUMN ttib_id uuid REFERENCES ttibs(id);
      `);
};
