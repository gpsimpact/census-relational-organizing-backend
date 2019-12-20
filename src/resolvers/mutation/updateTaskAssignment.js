import _ from "lodash";

// import _ from "lodash";

export default async (root, { input }, context) => {
  // make team form exists
  const existingTA = await context.dataSource.taskAssignment.byIdLoader.load(
    input.taskAssignmentId
  );
  if (!existingTA) {
    return {
      success: false,
      code: "INPUT_ERROR",
      message: "No task assignment with this id exists.",
      item: null
    };
  }

  // make sure taskDefinition exists
  if (input.taskDefinitionId) {
    const existingTD = await context.dataSource.taskDefinition.byIdLoader.load(
      input.taskDefinitionId
    );
    if (!existingTD) {
      return {
        success: false,
        code: "INPUT_ERROR",
        message: "No taskDefinition with this id exists.",
        item: null
      };
    }
  }

  // if notUntilCompletionOf - verify it exists
  if (input.notUntilCompletionOf) {
    const existingTA = await context.dataSource.taskAssignment.byIdLoader.load(
      input.notUntilCompletionOf
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

  // convert required roles to bit value
  // const perms = makeDefaultState();
  // let permInt = existingTA.taskRequiredRoles;
  // if (input.taskRequiredRoles) {
  //   input.taskRequiredRoles.forEach(x => {
  //     perms[x] = true;
  //   });
  //   permInt = permsToInt(perms);
  // }

  if (input.supplementalFields) {
    input.supplementalFields = JSON.stringify(input.supplementalFields);
  }

  const updateValues = Object.assign(
    {},
    _.omit(input, "taskAssignmentId")
    // {
    //   taskRequiredRoles: permInt
    // }
  );

  const [updatedTa] = await context.sq`task_assignments`
    .set(updateValues)
    .where({ id: input.taskAssignmentId }).return`*`;

  return {
    success: true,
    code: "OK",
    message: "Task Definition Created.",
    item: updatedTa
  };
};
