import _ from "lodash";
import { permsToInt } from "../../utils/permissions/permBitWise";
export default async (root, args, context) => {
  if (!root.active) {
    return {
      available: false,
      nonAvailableMessage: "Task assignment has been deleted"
    };
  }

  let taskDefinition = await context.dataSource.taskDefinition.byIdLoader.load(
    root.taskDefinitionId
  );

  const now = new Date();
  if (
    taskDefinition.notAvailableBeforeTs != null &&
    taskDefinition.notAvailableBeforeTs >= now
  ) {
    return {
      available: false,
      nonAvailableMessage: `Can not start on this task yet.`
    };
  }

  if (
    taskDefinition.notAvailableBeforeTs != null &&
    taskDefinition.notAvailableAfter <= now
  ) {
    return {
      available: false,
      nonAvailableMessage: `Task has expired.`
    };
  }

  const isGlobalAdminCheck = await context.dataSource.globalPermissions.byUserIdLoader.load(
    context.user.id
  );

  const isGlobalAdmin = isGlobalAdminCheck && isGlobalAdminCheck.length >= 1;

  const perms = await context.dataSource.olPerms.OLUserPerms(context.user.id);

  const permsThisTeam = _.first(perms, x => {
    return (x.teamId = taskDefinition.teamId);
  });

  const permsThisTeamObj = {
    ADMIN: false,
    APPLICANT: false,
    ELEVATED: false,
    MEMBER: false,
    TRAINING: false,
    DENIED: false
  };

  if (permsThisTeam) {
    _.map(permsThisTeam.permissions, p => {
      permsThisTeamObj[p] = true;
    });
  }

  const ptoi = permsToInt(permsThisTeamObj);

  if (!isGlobalAdmin && !(ptoi & root.taskRequiredRoles)) {
    return {
      available: false,
      nonAvailableMessage: `Task not available to you based on permissions.`
    };
  }

  return {
    available: true,
    nonAvailableMessage: null
  };
};
