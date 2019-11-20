import { shield, and, or, allow, deny, rule } from "graphql-shield";
import _ from "lodash";
import { intToPerms } from "../../utils/permissions/permBitWise";

/* ************************************************************************* 
  CHECKS - isolated testable logic 
************************************************************************* */

const userOwnsTargetCheckRoot = async (parent, args, ctx) => {
  if (!ctx.user || !ctx.user.id) {
    return false;
  }
  const target = await ctx.dataSource.target.byIdLoader.load(args.id);
  return target && target.userId && ctx.user.id === target.userId;
};

const userOwnsTargetCheckCalledTargetIDRoot = async (parent, args, ctx) => {
  if (!ctx.user || !ctx.user.id) {
    return false;
  }
  const target = await ctx.dataSource.target.byIdLoader.load(args.targetId);
  return target && target.userId && ctx.user.id === target.userId;
};

const userOwnsTargetCheck = async (parent, args, ctx) => {
  if (!ctx.user || !ctx.user.id) {
    return false;
  }
  const target = await ctx.dataSource.target.byIdLoader.load(
    args.input.targetId
  );
  return target && target.userId && ctx.user.id === target.userId;
};

const isTeamAdminOfTeamOwningTargetAsTargetIdCheck = async (
  parent,
  args,
  ctx
) => {
  if (!ctx.user || !ctx.user.id) {
    return false;
  }
  const target = await ctx.dataSource.target.byIdLoader.load(args.targetId);
  if (!target) {
    return false;
  }

  // check for perm
  const existingTeamPerm = await ctx.dataSource.teamPermission.loadOne.load({
    userId: ctx.user.id,
    teamId: target.teamId
  });

  if (!existingTeamPerm) {
    return false;
  }

  if (!existingTeamPerm.permission) {
    return false;
  }

  return intToPerms(existingTeamPerm.permission)["ADMIN"];
};

const userOwnsTargetNoteSubjectCheckRoot = async (parent, args, ctx) => {
  if (!ctx.user || !ctx.user.id) {
    return false;
  }
  const targetNote = await ctx.dataSource.targetNote.byIdLoader.load(args.id);
  if (!targetNote) {
    return false;
  }
  const target = await ctx.dataSource.target.byIdLoader.load(
    targetNote.targetId
  );
  return target && target.userId && ctx.user.id === target.userId;
};

const userOwnsTargetCASubjectCheck = async (parent, args, ctx) => {
  if (!ctx.user || !ctx.user.id) {
    return false;
  }
  const targetCA = await ctx.dataSource.targetContactAttempt.byIdLoader.load(
    args.id
  );
  if (!targetCA) {
    return false;
  }
  const target = await ctx.dataSource.target.byIdLoader.load(targetCA.targetId);
  return target && target.userId && ctx.user.id === target.userId;
};

const hasGlobalPermCheck = requiredGP => async (parent, args, ctx) => {
  // get list of users's global perms
  if (!ctx.user || !ctx.user.id) {
    return false;
  }
  const gps = await ctx.dataSource.globalPermissions.forUser(ctx.user.id);
  return _.includes(gps, requiredGP);
};

const hasTeamPermCheck = (teamIdPath, requiredTP) => async (
  parent,
  args,
  ctx
) => {
  if (!ctx.user || !ctx.user.id) {
    return false;
  }

  const grantorUserId = ctx.user.id;

  // extract team id
  const teamId = _.get(args, teamIdPath);

  // check for perm
  const existing = await ctx.dataSource.teamPermission.loadOne.load({
    userId: grantorUserId,
    teamId
  });

  if (existing) {
    const teamPerms = intToPerms(existing.permission);
    if (teamPerms[requiredTP] === true) {
      return true;
    } else {
      return false;
    }
  }
  return false;
};

const isAuthenticatedCheck = async (parent, args, ctx) => {
  if (!ctx.user) return false;
  if (!ctx.user.id) return false;
  return true;
};

const isNotAuthenticatedCheck = async (parent, args, ctx) => {
  if (
    ctx.user &&
    ctx.user.id &&
    ctx.user.id !== null &&
    ctx.user.id !== undefined
  ) {
    return new Error("You are already authenticated");
  }
  return true;
};

const isSelfCheck = argsVarName => async (parent, args, ctx) => {
  // get list of users's global perms
  if (!ctx.user || !ctx.user.id) {
    return false;
  }
  return _.get(args, argsVarName) === ctx.user.id;
};

const isAnyTeamAdminCheck = async (parent, args, ctx) => {
  const q = await ctx.sq`team_permissions`.return`count(*)`
    .where({ userId: ctx.user.id, permission: "ADMIN" })
    .one();
  return q && q.count && q.count > 0;
};

const isAnyTeamMemberCheck = async (parent, args, ctx) => {
  const q = await ctx.sq`team_permissions`.return`count(*)`
    .where({ userId: ctx.user.id, permission: "MEMBER" })
    .one();
  return q && q.count && q.count > 0;
};

const userIsTeamAdminofUpdatingTtibCheck = async (parent, args, ctx) => {
  // get ttbid details
  const dbTtib = await ctx.dataSource.tib.byIdLoader.load(args.id);
  // IS user admin?
  const existingTeamPerm = await ctx.dataSource.teamPermission.loadOne.load({
    userId: ctx.user.id,
    teamId: dbTtib.teamId
  });

  if (!existingTeamPerm) {
    return false;
  }

  return intToPerms(existingTeamPerm.permission)["ADMIN"];

  // return !!existingTeamAdminPerm;
};

const userIsTeamAdminofTaskAssignmentTeamCheck = async (parent, args, ctx) => {
  // get ttbid details
  const dbTa = await ctx.dataSource.taskAssignment.byIdLoader.load(
    args.input.taskAssignmentId
  );
  // IS user admin?
  const existingTeamPerm = await ctx.dataSource.teamPermission.loadOne.load({
    userId: ctx.user.id,
    teamId: dbTa.teamId
  });

  if (!existingTeamPerm) {
    return false;
  }

  return intToPerms(existingTeamPerm.permission)["ADMIN"];

  // return !!existingTeamAdminPerm;
};

// const userIsAdminofInputTeamIdCheck = async (parent, args, ctx) => {
//   const existingTeamPerm = await ctx.dataSource.teamPermission.loadOne.load({
//     userId: ctx.user.id,
//     teamId: args.input.teamId
//   });

//   if (!existingTeamPerm) {
//     return false;
//   }

//   return intToPerms(existingTeamPerm.permission)["ADMIN"];
// }

// @TODO
// I NEVER DID ASSOCIATE TARGETS WITH THEIR USERS. SO I CANT MAKE THIS PERM CHECK UNTIL I DO //
// const userOwnsAllTargetsInWriteFormValueInputCheck = async (
//   parent,
//   args,
//   ctx
// ) => {
//   const uniqueIdArray = _.uniq(_.map(args.input.data, "targetId"));

// console.log(
//   ctx.sq`targets`.return`count(*)`.where({
//     id: uniqueIdArray
//   }).query
// );
//   const q = await ctx.sq`targets`
//     .where({ id: uniqueIdArray })
//     .where({ userId: ctx.user.id });
//   console.log(">>>>>>>>>>>>", q);
//   return q, q && q.count && q.count === uniqueIdArray.length;
// };

/* ************************************************************************* 
  RULE DEFINITIONS- turns checks into GRAPHQL-SHIELD rules
************************************************************************* */

const userOwnsTargetRoot = rule(`user-owns-target-root`, {
  cache: "contextual"
})(userOwnsTargetCheckRoot);

const userOwnsTarget = rule(`user-owns-target`, { cache: "contextual" })(
  userOwnsTargetCheck
);

const userOwnsTargetRootAsTargetId = rule(`user-owns-target-root-as-targetId`, {
  cache: "contextual"
})(userOwnsTargetCheckCalledTargetIDRoot);

const userOwnsTargetNoteSubject = rule(`user-owns-target-note-subject`, {
  cache: "contextual"
})(userOwnsTargetNoteSubjectCheckRoot);

const userOwnsTargetCASubject = rule(
  `user-owns-target-contact-attempt-subject`,
  {
    cache: "contextual"
  }
)(userOwnsTargetCASubjectCheck);

const hasGlobalPerm = requiredGP =>
  rule(`name-has-global-perm-${requiredGP}`, { cache: "contextual" })(
    hasGlobalPermCheck(requiredGP)
  );

const hasTeamPerm = (teamIdPath, requiredTP) =>
  rule(`name-has-team-perm-${teamIdPath}-${requiredTP}`, {
    cache: "contextual"
  })(hasTeamPermCheck(teamIdPath, requiredTP));

const isAuthenticated = rule({ cache: "contextual" })(isAuthenticatedCheck);

const isNotAuthenticated = rule({ cache: "contextual" })(
  isNotAuthenticatedCheck
);

const isSelfRootId = rule(`name-is-self-perm-root-id`, { cache: "contextual" })(
  isSelfCheck("id")
);
const isSelfRootUserId = rule(`name-is-self-perm-root-userId`, {
  cache: "contextual"
})(isSelfCheck("userId"));

const isAnyTeamAdmin = rule(`is-any-team-admin`, { cache: "contextual" })(
  isAnyTeamAdminCheck
);

const isAnyTeamMember = rule(`is-any-team-member`, { cache: "contextual" })(
  isAnyTeamMemberCheck
);

const userIsTeamAdminofUpdatingTtib = rule(`userIsTeamAdminofUpdatingTtib`, {
  cache: "contextual"
})(userIsTeamAdminofUpdatingTtibCheck);

const isTeamAdminOfTeamOwningTargetAsTargetId = rule(
  `isTeamAdminOfTeamOwningTargetAsTargetId`,
  {
    cache: "contextual"
  }
)(isTeamAdminOfTeamOwningTargetAsTargetIdCheck);

const userIsTeamAdminofTaskAssignmentTeam = rule(
  `userIsTeamAdminofTaskAssignmentTeam`,
  {
    cache: "contextual"
  }
)(userIsTeamAdminofTaskAssignmentTeamCheck);

// const userOwnsAllTargetsInWriteFormValueInput = rule(
//   `userOwnsAllTargetsInWriteFormValueInput`,
//   {
//     cache: "contextual"
//   }
// )(userOwnsAllTargetsInWriteFormValueInputCheck);

/* ************************************************************************* 
  Rule instantiation
************************************************************************* */

const has_GP_ADMIN = hasGlobalPerm("ADMIN");
const has_TP_ADMIN = hasTeamPerm("input.teamId", "ADMIN");
const has_TP_ADMIN_ROOT = hasTeamPerm("id", "ADMIN");
const has_TP_ADMIN_ROOT_TEAMID = hasTeamPerm("teamId", "ADMIN");
const has_TP_MEMBER = hasTeamPerm("input.teamId", "MEMBER");
const has_TP_MEMBER_ROOT = hasTeamPerm("teamId", "MEMBER");

// const owns_target = userOwnsTarget("input.targetId");

/* ************************************************************************* 
  Permissions Mapping
************************************************************************* */

export default shield(
  {
    Query: {
      ttibs: and(
        isAuthenticated,
        or(or(has_TP_MEMBER, has_TP_ADMIN), has_GP_ADMIN)
      ),
      me: allow,
      form: and(isAuthenticated, has_GP_ADMIN),
      users: and(isAuthenticated, has_GP_ADMIN),
      teams: allow,
      team: allow,
      summaryCountTeams: and(isAuthenticated, has_GP_ADMIN),
      gtibs: and(
        isAuthenticated,
        or(has_GP_ADMIN, isAnyTeamAdmin, isAnyTeamMember)
      ),
      user: and(isAuthenticated, or(has_GP_ADMIN, isSelfRootId)),
      teamUsers: and(isAuthenticated, or(has_TP_ADMIN, has_GP_ADMIN)),
      target: and(isAuthenticated, or(has_GP_ADMIN, userOwnsTargetRoot)),
      targets: and(isAuthenticated, has_GP_ADMIN),
      // read as must be authenticated AND a member of the team AND one of (is yourself OR admin of specified team.)
      userTargets: and(
        isAuthenticated,
        or(has_TP_MEMBER_ROOT, has_TP_ADMIN_ROOT_TEAMID, has_GP_ADMIN),
        or(isSelfRootUserId, has_TP_ADMIN_ROOT_TEAMID, has_GP_ADMIN)
      ),
      summaryCountMyTeamTargets: isAuthenticated,
      summaryTotalMyTeamHouseholdSize: isAuthenticated,
      summaryCountMyTeamTibs: isAuthenticated,
      summaryCountAllTeamTargets: and(
        isAuthenticated,
        or(has_TP_ADMIN_ROOT_TEAMID, has_GP_ADMIN)
      ),
      summaryTotalAllTeamHouseholdSize: and(
        isAuthenticated,
        or(has_TP_ADMIN_ROOT_TEAMID, has_GP_ADMIN)
      ),
      summaryTotalAllHouseholdSize: and(isAuthenticated, has_GP_ADMIN),
      summaryCountAllTargets: and(isAuthenticated, has_GP_ADMIN),
      summaryCountAllTeamTibs: and(
        isAuthenticated,
        or(has_TP_ADMIN_ROOT_TEAMID, has_GP_ADMIN)
      ),
      summaryCountAllTibs: and(isAuthenticated, has_GP_ADMIN),
      summaryCountAllTeamUsers: and(
        isAuthenticated,
        or(has_TP_ADMIN_ROOT_TEAMID, has_GP_ADMIN)
      ),
      summaryCountAllUsers: and(isAuthenticated, has_GP_ADMIN),
      targetNote: and(
        isAuthenticated,
        or(has_GP_ADMIN, userOwnsTargetNoteSubject)
      ),
      targetNotes: and(isAuthenticated, or(has_GP_ADMIN, userOwnsTarget)),
      targetContactAttempt: and(
        isAuthenticated,
        or(has_GP_ADMIN, userOwnsTargetCASubject)
      ),
      targetContactAttempts: and(
        isAuthenticated,
        or(has_GP_ADMIN, userOwnsTarget)
      ),
      taskAssignment: and(
        isAuthenticated
        // has_GP_ADMIN
        // WILL NEED MORE HERE.
        // or(has_GP_ADMIN, userOwnsTarget)
      ),
      targetTasks: and(
        isAuthenticated,
        or(
          has_GP_ADMIN,
          userOwnsTargetRootAsTargetId,
          isTeamAdminOfTeamOwningTargetAsTargetId
        )
      ),
      teamEligibleTasks: and(isAuthenticated, or(has_TP_ADMIN, has_GP_ADMIN)),
      taskDefinition: isAuthenticated,
      teamTargets: and(
        isAuthenticated,
        or(has_TP_ADMIN_ROOT_TEAMID, has_GP_ADMIN)
      ),
      summaryCountMyTeamTasks: isAuthenticated,
      summaryCountAllTeamTasks: and(
        isAuthenticated,
        or(has_TP_ADMIN_ROOT_TEAMID, has_GP_ADMIN)
      )
    },
    Mutation: {
      removeUser: and(isAuthenticated, has_GP_ADMIN),
      createGtib: and(isAuthenticated, has_GP_ADMIN),
      createTtib: and(isAuthenticated, or(has_TP_ADMIN, has_GP_ADMIN)),
      createUser: and(isAuthenticated, has_GP_ADMIN),
      updateGtib: and(isAuthenticated, has_GP_ADMIN),
      updateForm: and(isAuthenticated, has_GP_ADMIN),
      createForm: and(isAuthenticated, has_GP_ADMIN),
      writeFormValues: and(isAuthenticated, or(has_GP_ADMIN)), // <- add perm that user can write values for their own target. @todo see line 78
      removeTeam: and(isAuthenticated, has_GP_ADMIN),
      updateTtib: and(
        isAuthenticated,
        or(has_GP_ADMIN, userIsTeamAdminofUpdatingTtib)
      ),
      updateTeam: and(isAuthenticated, or(has_TP_ADMIN_ROOT, has_GP_ADMIN)),
      updateUser: and(isAuthenticated, or(has_GP_ADMIN, isSelfRootId)),
      createTeam: and(isAuthenticated, has_GP_ADMIN),
      confirmLogin: allow,
      requestTeamMembership: isAuthenticated,
      cancelTeamMembershipRequest: isAuthenticated,
      requestLogin: isNotAuthenticated,
      updateUser: and(isAuthenticated, or(has_GP_ADMIN, isSelfRootId)),
      register: isNotAuthenticated,
      removeTeamPermission: and(
        isAuthenticated,
        or(has_TP_ADMIN, has_GP_ADMIN)
      ),
      toggleTeamPermission: and(
        isAuthenticated,
        or(has_TP_ADMIN, has_GP_ADMIN)
      ),
      createTarget: and(
        isAuthenticated,
        or(or(has_TP_MEMBER, has_TP_ADMIN), has_GP_ADMIN)
      ),
      updateTarget: and(isAuthenticated, or(has_GP_ADMIN, userOwnsTargetRoot)),
      removeTarget: and(isAuthenticated, or(has_GP_ADMIN, userOwnsTargetRoot)),
      createTargetNote: and(isAuthenticated, or(has_GP_ADMIN, userOwnsTarget)),
      updateTargetNote: and(
        isAuthenticated,
        or(has_GP_ADMIN, userOwnsTargetNoteSubject)
      ),
      createTargetContactAttempt: and(
        isAuthenticated,
        or(has_GP_ADMIN, userOwnsTarget)
      ),
      updateTargetContactAttempt: and(
        isAuthenticated,
        or(has_GP_ADMIN, userOwnsTargetCASubject)
      ),
      createTaskDefinition: and(
        isAuthenticated,
        or(has_GP_ADMIN, isAnyTeamAdmin)
      ),
      updateTargetTask: and(
        isAuthenticated,
        or(
          has_GP_ADMIN,
          userOwnsTargetRootAsTargetId,
          isTeamAdminOfTeamOwningTargetAsTargetId
        )
      ),
      designateTeamEligibleTask: and(isAuthenticated, has_GP_ADMIN),
      createTaskAssignment: and(
        isAuthenticated,
        or(has_TP_ADMIN, has_GP_ADMIN)
      ),
      setTaskAssignmentSortOrder: and(
        isAuthenticated,
        or(has_TP_ADMIN, has_GP_ADMIN)
      ),
      updateTaskAssignment: and(
        isAuthenticated,
        or(has_GP_ADMIN, userIsTeamAdminofTaskAssignmentTeam)
      ),
      setTeamTosAcceptance: isAuthenticated,
      sendGlobalAdminsEmail: isAuthenticated,
      sendTeamAdminsEmail: and(
        isAuthenticated,
        or(has_GP_ADMIN, has_TP_MEMBER)
      ),
      reassignTarget: and(isAuthenticated, or(has_TP_ADMIN, has_GP_ADMIN))
    },
    Team: {
      userPermissions: allow, // <- Make this go away soon in favor of own root query
      userPermissionSummaryCounts: allow // <- Make this go away soon in favor of own root query
    },
    RemoveUserResult: allow,
    CreateGtibResponse: allow,
    User: allow,
    Gtib: allow,
    Ttib: allow,
    CreateTtibResult: allow,
    User: allow,
    CreateUserResult: allow,
    UpdateGtibResult: allow,
    Form: allow,
    FormField: allow,
    SelectOptions: allow,
    FORM_FIELD_TYPE_ENUM: allow,
    UpdateFormResult: allow,
    CreateFormResult: allow,
    WriteFormValuesResult: allow,
    RemoveTeamResult: allow,
    UpdateGtibResult: allow,
    UpdateTeamResult: allow,
    Team: allow,
    UpdateUserResult: allow,
    UsersResults: allow,
    CreateTeamResult: allow,
    ConfirmLoginResult: allow,
    RequestTeamMembershipResult: allow,
    CancelTeamMembershipRequestResult: allow,
    RequestLoginResult: allow,
    TeamsResult: allow,
    UpdateUserResult: allow,
    RegisterResult: allow,
    RemoveTeamPermissionResult: allow,
    ToggleTeamPermissionResult: allow,
    OLTeamPerms: allow,
    OLTeamPermsSummary: allow,
    GlobalPermissionsEnum: allow,
    OLUserPerms: allow,
    UpdateTtibResult: allow,
    TeamUsersResult: allow,
    Target: allow,
    CreateTargetResult: allow,
    TibApplication: allow,
    UpdateTargetResult: allow,
    TargetsResult: allow,
    RemoveTargetResult: allow,
    TibTotal: allow,
    TargetNote: allow,
    CreateTargetNoteResult: allow,
    UpdateTargetNoteResult: allow,
    TargetNotesResult: allow,
    TargetContactAttempt: allow,
    CreateTargetContactAttemptResult: allow,
    UpdateTargetContactAttemptResult: allow,
    TargetContactAttemptsResult: allow,
    CreateTaskDefinitionResult: allow,
    TaskDefinition: allow,
    TaskAssignment: allow,
    TaskAssignmentRoles: allow,
    TaskAssignmentAvailbillityStatus: allow,
    UpdateTargetTaskResult: allow,
    DesignateTeamEligibleTaskResult: allow,
    CreateTaskAssignmentResult: allow,
    SetTaskAssignmentSortOrderResult: allow,
    UpdateTaskAssignmentResult: allow,
    HouseholdMember: allow,
    SetTeamTosAcceptanceResult: allow,
    SendGlobalAdminsEmailResult: allow,
    SendTeamAdminsEmailResult: allow,
    ReassignTargetResult: allow,
    SummaryTaskTotal: allow,
    SummaryTaskLanguageVariation: allow
  },
  {
    fallbackError: "Not Authorized!", // default error spelling is Authorised.
    fallbackRule: deny,
    debug: process.env.NODE_ENV !== "production",
    allowExternalErrors: true
  }
  // { debug: true, allowExternalErrors: true }
);
