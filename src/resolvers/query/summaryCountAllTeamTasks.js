// import _ from "lodash";
export default async (root, { teamId }, context) => {
  // const data = await context.sq.sql`
  // WITH task_completion_status AS (
  //   SELECT
  //   ta.team_id AS team_id,
  //   t.user_id AS user_id,
  //   td.form_id AS form_id,
  //   td.id AS task_definition_id,
  //   ta.id AS task_assignment_id,
  //   ta.sort_value AS task_assignment_sort_value,
  //   SUM(CASE WHEN complete THEN 1 ELSE 0 END) as count_complete
  // FROM task_assignments ta
  // LEFT JOIN task_assignment_status tas ON tas.task_assignment_id = ta.id
  // LEFT JOIN targets t ON tas.target_id = t.id
  // LEFT JOIN task_definitions td on ta.task_definition_id = td.id
  // LEFT JOIN teams tm ON ta.team_id = tm.id
  // --WHERE tas.complete = true
  // AND t.active = true
  // AND ta.active = true
  // AND tm.active = true
  // GROUP BY 1,2,3,4,5
  // ),
  // team_target_counts AS (
  //   SELECT
  //     team_id,
  //     count(*) as team_targets_count
  //   FROM targets t
  //   LEFT JOIN teams tm ON t.team_id = tm.id
  //   WHERE t.active = true
  //   AND tm.active = true
  //   GROUP BY 1
  // ),
  // form_language_variations AS (
  //   SELECT
  //   form_id,
  //   array_to_json(array_agg(row_to_json(f))) AS lang_title_variations
  //   FROM (
  //       SELECT id AS form_id, title, language FROM forms
  //   ) f
  //   GROUP BY 1
  // )
  // SELECT
  //   lang_title_variations AS language_variations,
  //   count_complete,
  //   team_targets_count
  // FROM (
  //   SELECT
  //     team_id,
  //     task_assignment_id,
  //     form_id,
  //     task_assignment_sort_value,
  //     SUM(count_complete) as count_complete
  //   FROM task_completion_status tcs
  //   WHERE team_id = ${teamId}
  //   GROUP BY 1,2,3,4
  // ) core
  // LEFT JOIN form_language_variations flv USING(form_id)
  // LEFT JOIN team_target_counts ttc USING (team_id)
  // ORDER BY core.task_assignment_sort_value;
  // `;

  const data = await context.sq.sql`
  WITH active_task_assignments AS (
    SELECT 
        ta.team_id AS team_id,
        td.form_id AS form_id,
        td.id AS task_definition_id,
        ta.id AS task_assignment_id,
        ta.sort_value AS task_assignment_sort_value
      FROM task_assignments ta
      LEFT JOIN task_definitions td on ta.task_definition_id = td.id
      LEFT JOIN teams tm ON ta.team_id = tm.id
      AND ta.active = true
      AND tm.active = true
      GROUP BY 1,2,3,4,5
  ),
  form_language_variations AS (
      SELECT 
      form_id, 
      array_to_json(array_agg(row_to_json(f))) AS lang_title_variations
      FROM (
          SELECT id AS form_id, title, language FROM forms
      ) f
      GROUP BY 1
  ),
  user_team_target_counts AS (
    SELECT 
      team_id, 
      count(*) as user_team_target_count
    FROM targets t
    LEFT JOIN teams tm ON t.team_id = tm.id
    WHERE t.active = true
    AND t.team_id = ${teamId}
    GROUP BY 1
  ),
  task_assignment_status AS (
    SELECT
      task_assignment_id,
      SUM(
        CASE WHEN complete = true THEN 1 ELSE 0 END
      ) as num_complete
    FROM task_assignment_status tas
    LEFT JOIN targets t ON tas.target_id = t.id
    AND t.team_id = ${teamId}
    GROUP BY 1
  )
  SELECT 
    ata.team_id,
    ata.form_id,
    ata.task_definition_id,
    ata.task_assignment_id,
    ata.task_assignment_sort_value,
    flv.lang_title_variations AS language_variations, 
    COALESCE(tas.num_complete, 0) AS count_complete,
    COALESCE(uttc.user_team_target_count, 0) AS team_targets_count
  FROM active_task_assignments ata
  LEFT JOIN form_language_variations flv ON ata.form_id = flv.form_id
  LEFT JOIN user_team_target_counts uttc ON ata.team_id = uttc.team_id
  LEFT JOIN task_assignment_status tas ON ata.task_assignment_id = tas.task_assignment_id
  WHERE ata.team_id = ${teamId}
  ORDER BY ata.task_assignment_sort_value;`;

  return data;
};
