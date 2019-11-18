exports.up = knex =>
  knex.raw(`
    ALTER TABLE forms 
        DROP CONSTRAINT IF EXISTS forms_pkey;

    ALTER TABLE forms
        ADD COLUMN language VARCHAR DEFAULT 'EN' NOT NULL;

    ALTER TABLE forms
        ADD CONSTRAINT unique_formid_language_pk PRIMARY KEY (id, language);
  `);

exports.down = knex =>
  knex.raw(`
  ALTER TABLE forms 
    DROP CONSTRAINT IF EXISTS unique_formid_language_pk;

  ALTER TABLE forms 
    DROP COLUMN language;

  -- ALTER TABLE forms ADD CONSTRAINT forms_pkey PRIMARY KEY (id);
`);
