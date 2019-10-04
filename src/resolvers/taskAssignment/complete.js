export default async (root, args, context) => {
  if (args && args.targetId) {
    const taskAssignmentStatus = await context.dataSource.taskAssignmentStatus.loadOne.load(
      {
        targetId: args.targetId,
        taskAssignmentId: root.id
      }
    );

    if (
      taskAssignmentStatus &&
      (taskAssignmentStatus.complete === false ||
        taskAssignmentStatus.complete === true)
    ) {
      return taskAssignmentStatus.complete;
    }

    return false;
  }
};
