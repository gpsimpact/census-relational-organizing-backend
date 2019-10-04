export default async (root, args, context) => {
  // load target to get team assignment.
  const target = await context.dataSource.target.byIdLoader.load(args.targetId);

  if (target && target.teamId) {
    // const teamTaskAssignments = await context.dataSource.taskAssignment.byTeamIdLoader.load(
    //   target.teamId
    // );
    const teamTaskAssignments = context.sq`task_assignments`.where({
      teamId: target.teamId,
      active: args.active
    });

    return teamTaskAssignments;
  }
};
