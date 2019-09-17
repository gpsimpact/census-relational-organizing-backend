// import _ from "lodash";
// import { permsToInt } from "../../utils/permissions/permBitWise";
export default async (root, args, context) => {
  if (!root.active) {
    return {
      available: false,
      nonAvailableMessage: "Task assignment has been deleted"
    };
  }

  const now = new Date();
  if (root.notAvailableBeforeTs != null && root.notAvailableBeforeTs >= now) {
    return {
      available: false,
      nonAvailableMessage: `Can not start on this task yet.`
    };
  }

  if (root.notAvailableAfterTs != null && root.notAvailableAfterTs <= now) {
    return {
      available: false,
      nonAvailableMessage: `Task has expired.`
    };
  }

  const isGlobalAdminCheck = await context.dataSource.globalPermissions.byUserIdLoader.load(
    context.user.id
  );

  const isGlobalAdmin = isGlobalAdminCheck && isGlobalAdminCheck.length >= 1;

  const perms = await context.dataSource.teamPermission.loadOne.load({
    userId: context.user.id,
    teamId: root.teamId
  });

  if (!isGlobalAdmin && !((perms.permission || 0) & root.taskRequiredRoles)) {
    return {
      available: false,
      nonAvailableMessage: `Task not available to you based on permissions.`
    };
  }

  if (root.notUntilCompletionOf && args && args.targetId) {
    const parentTaskAssignmentStatus = await context.dataSource.taskAssignmentStatus.loadOne.load(
      {
        targetId: args.targetId,
        taskAssignmentId: root.notUntilCompletionOf
      }
    );

    if (
      parentTaskAssignmentStatus &&
      parentTaskAssignmentStatus.complete === false
    ) {
      return {
        available: false,
        nonAvailableMessage: `This task depends on a task that is not yet complete for this target.`
      };
    }
  }

  return {
    available: true,
    nonAvailableMessage: null
  };
};
