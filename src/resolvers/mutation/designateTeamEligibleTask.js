export default async (
  root,
  { input: { teamId, taskDefinitionId, eligible } },
  context
) => {
  // make sure team  exists
  const existingTeam = await context.dataSource.team.byIdLoader.load(teamId);

  if (!existingTeam) {
    return {
      success: false,
      code: "DOES_NOT_EXIST",
      message: "No team with this id exists",
      item: null
    };
  }

  // make sure task def  exists
  const existingTaskDef = await context.dataSource.taskDefinition.byIdLoader.load(
    taskDefinitionId
  );

  if (!existingTaskDef) {
    return {
      success: false,
      code: "DOES_NOT_EXIST",
      message: "No task definition with this id exists",
      item: null
    };
  }

  if (eligible === false) {
    await context.sq`team_eligible_task_definitions`.where({
      teamId: teamId,
      taskDefinitionId: taskDefinitionId
    }).delete;
  } else {
    await context.sq.from`team_eligible_task_definitions`
      .insert`values (${teamId}, ${taskDefinitionId}) ON CONFLICT ON CONSTRAINT team_eligible_task_definitions_pkey DO NOTHING`;
  }

  return {
    success: true,
    code: "OK",
    message: "Task Definition team eligibillity designation has been applied",
    item: existingTaskDef
  };
};
