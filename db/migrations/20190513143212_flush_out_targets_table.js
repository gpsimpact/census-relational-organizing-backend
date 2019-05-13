exports.up = knex =>
  knex.raw(`
    ALTER TABLE targets 
    ADD COLUMN address VARCHAR,
    ADD COLUMN city VARCHAR,
    ADD COLUMN state VARCHAR,
    ADD COLUMN zip5 VARCHAR(5),
    ADD COLUMN twitter_handle VARCHAR,
    ADD COLUMN facebook_profile VARCHAR,
    ADD COLUMN email VARCHAR,
    ADD COLUMN household_size NUMERIC,
    ADD COLUMN phone VARCHAR
  `);

exports.down = knex =>
  knex.raw(`
    ALTER TABLE targets 
    DROP COLUMN address,
    DROP COLUMN city,
    DROP COLUMN state,
    DROP COLUMN zip5,
    DROP COLUMN twitter_handle,
    DROP COLUMN facebook_profile,
    DROP COLUMN email,
    DROP COLUMN household_size,
    DROP COLUMN phone
`);
