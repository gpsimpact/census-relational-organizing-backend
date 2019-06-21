exports.up = knex => {
  return knex.raw(`
        ALTER TABLE tibs ADD COLUMN tib_type VARCHAR DEFAULT 'QUESTION';
    `);
};

exports.down = knex => {
  return knex.raw(`
        ALTER TABLE tibs DROP COLUMN tib_type 
    `);
};
