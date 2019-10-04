exports.up = knex =>
  knex.raw(`
    ALTER TABLE forms 
    ADD COLUMN description VARCHAR;
  `);

exports.down = knex =>
  knex.raw(`
    ALTER TABLE forms 
    DROP COLUMN description;
`);
