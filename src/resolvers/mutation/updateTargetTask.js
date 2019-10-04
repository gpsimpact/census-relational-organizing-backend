import _ from "lodash";

export default async (root, args, context) => {
  // make sure task assignment exists
  const existingTaskAssignment = await context.dataSource.taskAssignment.byIdLoader.load(
    args.taskAssignmentId
  );

  if (!existingTaskAssignment) {
    return {
      success: false,
      code: "DOES_NOT_EXIST",
      message: "No task assignment with this ID exists",
      item: null
    };
  }

  // make sure target exists
  const existingTarget = await context.dataSource.target.byIdLoader.load(
    args.targetId
  );

  if (!existingTarget) {
    return {
      success: false,
      code: "DOES_NOT_EXIST",
      message: "No target with this ID exists",
      item: null
    };
  }

  // grab existing task assignment status
  const existingTaskAssignmentStatus = await context.dataSource.taskAssignmentStatus.loadOne.load(
    {
      targetId: args.targetId,
      taskAssignmentId: args.taskAssignmentId
    }
  );

  // update task assignment status if complete is present.

  // first look for existing record. if present then update.
  if (
    existingTaskAssignmentStatus &&
    args.input &&
    (args.input.complete === true || args.input.complete === false)
  ) {
    await context.sq`task_assignment_status`
      .set({
        complete: args.input.complete,
        completedBy: context.user.id
      })
      .where({
        targetId: existingTaskAssignmentStatus.targetId,
        taskAssignmentId: existingTaskAssignmentStatus.taskAssignmentId
      });
  }

  // if not existing taskAssignmentStatus then insert
  if (
    !existingTaskAssignmentStatus &&
    args.input &&
    (args.input.complete === true || args.input.complete === false)
  ) {
    await context.sq`task_assignment_status`.insert({
      complete: args.input.complete,
      completedBy: context.user.id,
      targetId: args.targetId,
      taskAssignmentId: args.taskAssignmentId
    });
  }

  // update / write form values if present

  if (
    args.input &&
    args.input.fieldValues &&
    args.input.fieldValues.length > 0
  ) {
    // grab the task Definition id
    const taskDefinition = await context.dataSource.taskDefinition.byIdLoader.load(
      existingTaskAssignment.taskDefinitionId
    );

    const names = _.map(args.input.fieldValues, "name");
    // delete formvalues from db before overwriting
    await context.sq`form_values`.delete.where({
      name: names,
      formId: taskDefinition.formId,
      targetId: args.targetId
    });

    // now insert values

    const insertRows = _.map(args.input.fieldValues, x => {
      return {
        name: x.name,
        value: x.value,
        formId: taskDefinition.formId,
        targetId: args.targetId,
        userId: context.user.id
      };
    });

    await context.sq`form_values`.insert(insertRows);
  }

  const finalTaskAssignment = await context.dataSource.taskAssignment.byIdLoader
    .clear()
    .load(args.taskAssignmentId);

  // clear cache and refetch task assignment to make sure data is fresh.

  // return task assignment.

  // make sure team exists
  //   const existing = await context.dataSource.targetNote.byIdLoader.load(args.id);
  //   if (!existing) {
  //     return {
  //       success: false,
  //       code: "INPUT_ERROR",
  //       message: "No note with this id exists.",
  //       item: null
  //     };
  //   }

  //   let writeInput = Object.assign({}, args.input, {
  //     lastEditedBy: context.user.id
  //   });

  //   const writeArgs = Object.assign({}, args, { input: writeInput });

  //   // proceed to update target object
  //   const targetNote = await updateOneHOR(
  //     "dataSource.targetNote.update",
  //     "input",
  //     "id",
  //     "UPDATE_TARGET_NOTE"
  //   )(root, writeArgs, context);

  return {
    success: true,
    code: "OK",
    message: "Task Assignment updated.",
    item: finalTaskAssignment
  };
};
