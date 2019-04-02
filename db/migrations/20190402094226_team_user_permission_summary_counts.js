exports.up = knex => {
  return knex.raw(`
        CREATE VIEW team_user_permission_summary_counts AS (
            SELECT team_id, permission, count(*) FROM team_permissions GROUP BY 1,2
        );
    `);
};

exports.down = knex => {
  return knex.raw(`
        DROP VIEW IF EXISTS team_user_permission_summary_counts;
    `);
};
