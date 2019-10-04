// import _ from "lodash";
// import { permsToInt } from "../../utils/permissions/permBitWise";
export default async (root, args, context) => {
  if (!root.active) {
    return {
      available: false,
      nonAvailableCode: "DELETED"
    };
  }

  const now = new Date();
  if (root.notAvailableBeforeTs != null && root.notAvailableBeforeTs >= now) {
    return {
      available: false,
      nonAvailableCode: "TOO_EARLY"
    };
  }

  if (root.notAvailableAfterTs != null && root.notAvailableAfterTs <= now) {
    return {
      available: false,
      nonAvailableCode: "EXPIRED"
    };
  }

  // if a target ID specified in args, grab it
  const target = await context.dataSource.target.byIdLoader.load(args.targetId);

  if (args.targetId && !target) {
    return {
      available: false,
      nonAvailableCode: "NO_TARGET"
    };
  }

  const isGlobalAdminCheck = await context.dataSource.globalPermissions.byUserIdLoader.load(
    target.userId
  );

  const isGlobalAdmin = isGlobalAdminCheck && isGlobalAdminCheck.length >= 1;

  const perms = await context.dataSource.teamPermission.loadOne.load({
    userId: target.userId,
    teamId: root.teamId
  });

  let permHolder = perms && perms.permission ? perms.permission : 0;

  if (!isGlobalAdmin && !(permHolder & root.taskRequiredRoles)) {
    return {
      available: false,
      nonAvailableCode: "WRONG_PERMISSIONS"
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
        nonAvailableCode: "DEPENDENCY_NOT_MET"
      };
    }
  }

  return {
    available: true,
    nonAvailableCode: null
  };
};
