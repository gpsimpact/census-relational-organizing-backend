exports.up = knex => {
  return knex.raw(`
        ALTER TABLE target_true_tibs ADD CONSTRAINT target_true_tibs_pkey PRIMARY KEY(target_id, tib_id);                
    `);
};

exports.down = knex => {
  return knex.raw(`
        ALTER TABLE target_true_tibs DROP CONSTRAINT target_true_tibs_pkey;
    `);
};
