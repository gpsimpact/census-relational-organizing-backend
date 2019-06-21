exports.up = knex => {
  return knex.raw(`
          ALTER TABLE tibs ADD COLUMN points NUMERIC DEFAULT 0;
      `);
};

exports.down = knex => {
  return knex.raw(`
          ALTER TABLE tibs DROP COLUMN points; 
      `);
};
