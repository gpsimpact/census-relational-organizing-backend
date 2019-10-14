import _ from "lodash";

export default async (root, args, context) => {
  // get all globally available task definitions
  const globals = await context.sq`task_definitions`.where({
    isGloballyAvailable: true,
    active: true
  });

  const teamEligibleTaskIds = await context.sq`team_eligible_task_definitions`
    .where({ teamId: args.input.teamId })
    .return("task_definition_id");

  const teamEligibleTasks = await context.dataSource.taskDefinition.byIdLoader.loadMany(
    _.map(teamEligibleTaskIds, "taskDefinitionId")
  );

  return globals.concat(teamEligibleTasks);
};
