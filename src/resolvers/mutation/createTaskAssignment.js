import {
  makeDefaultState,
  permsToInt
} from "../../utils/permissions/permBitWise";
// import _ from "lodash";

export default async (
  root,
  {
    input: {
      teamId,
      taskDefinitionId,
      notAvailableBeforeTs,
      notAvailableAfterTs,
      taskRequiredRoles,
      notUntilCompletionOf,
      supplementalFields
    }
  },
  context
) => {
  // make team form exists
  const existingTeam = await context.dataSource.team.byIdLoader.load(teamId);
  if (!existingTeam) {
    return {
      success: false,
      code: "INPUT_ERROR",
      message: "No team with this id exists.",
      item: null
    };
  }

  // make sure taskDefinition exists
  const existingTD = await context.dataSource.taskDefinition.byIdLoader.load(
    taskDefinitionId
  );
  if (!existingTD) {
    return {
      success: false,
      code: "INPUT_ERROR",
      message: "No taskDefinition with this id exists.",
      item: null
    };
  }

  // if notUntilCompletionOf - verify it exists
  if (notUntilCompletionOf) {
    const existingTA = await context.dataSource.taskAssignment.byIdLoader.load(
      notUntilCompletionOf
    );
    if (!existingTA) {
      return {
        success: false,
        code: "INPUT_ERROR",
        message: "No taskAssignment with this id exists.",
        item: null
      };
    }
  }

  if (supplementalFields) {
    supplementalFields = JSON.stringify(supplementalFields);
  }

  // convert required roles to bit value
  const perms = makeDefaultState();
  taskRequiredRoles.forEach(x => {
    perms[x] = true;
  });
  const permInt = permsToInt(perms);

  // get count of existing team taskAssignments.
  const [teamTaskAssignmentCount] = await context.sq`task_assignments`.where({
    teamId
  }).return`count(*)`;

  const [newTa] = await context.sq`task_assignments`.insert({
    teamId,
    taskDefinitionId,
    notAvailableBeforeTs,
    notAvailableAfterTs,
    taskRequiredRoles: permInt,
    notUntilCompletionOf,
    supplementalFields,
    sortValue: teamTaskAssignmentCount.count || 0
  }).return`*`;

  return {
    success: true,
    code: "OK",
    message: "Task Definition Created.",
    item: newTa
  };
};
