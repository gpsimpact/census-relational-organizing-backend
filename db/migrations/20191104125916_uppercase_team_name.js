exports.up = knex =>
  knex.raw(`
    CREATE OR REPLACE FUNCTION uppercase_team_name()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.name = UPPER(NEW.name);
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    CREATE TRIGGER coerce_team_name_uppercase
    BEFORE UPDATE ON teams
    FOR EACH ROW
    WHEN (OLD.name IS DISTINCT FROM NEW.name)
    EXECUTE PROCEDURE uppercase_team_name();
  `);

exports.down = knex =>
  knex.raw(`
    DROP TRIGGER IF EXISTS coerce_team_name_uppercase on teams;
`);
