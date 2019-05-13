exports.up = knex => {
  return knex.raw(`
              CREATE TABLE target_true_tibs (
                    target_id uuid REFERENCES targets(id) NOT NULL,
                    ttib_id uuid REFERENCES ttibs(id) NOT NULL,
                    PRIMARY KEY(target_id, ttib_id)
              );
          `);
};

exports.down = knex => {
  return knex.raw(`
              DROP TABLE IF EXISTS target_true_tibs;
          `);
};
