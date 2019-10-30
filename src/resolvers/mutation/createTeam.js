import { addOneHOR } from "@jakelowen/sqorn-graphql-filters";
import _ from "lodash";

export default async (root, args, context) => {
  const existingName = await context.dataSource.team.byNameLoader.load(
    args.input.name
  );
  if (existingName) {
    return {
      success: false,
      code: "DUPLICATE",
      message: "A team with this name already exists.",
      item: null
    };
  }

  const team = await addOneHOR(
    "dataSource.team.create",
    "input",
    "CREATE_TEAM"
  )(root, args, context);

  // query for default taskAssignments
  const defaultTaskDefs = await context.sq`task_definitions`.where({
    autoAddNewTeams: true
  }).return`id, auto_add_sort_value`;

  const taskAssignmentInserts = _.map(defaultTaskDefs, td => {
    return {
      teamId: team.id,
      taskDefinitionId: td.id,
      active: true,
      taskRequiredRoles: 8,
      sortValue: td.autoAddSortValue
    };
  });

  if (taskAssignmentInserts.length > 0) {
    await context.sq`task_assignments`.insert(taskAssignmentInserts);
  }

  return {
    success: true,
    code: "OK",
    message: "Team created.",
    item: team
  };
};
