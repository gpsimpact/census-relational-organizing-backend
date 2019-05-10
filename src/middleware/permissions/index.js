import { shield, and, or, allow, deny, rule } from "graphql-shield";
import _ from "lodash";

/* ************************************************************************* 
  CHECKS - isolated testable logic 
************************************************************************* */

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
  const existing = await ctx.dataSource.olPerms.loadOne.load({
    userId: grantorUserId,
    teamId,
    permission: requiredTP
  });

  if (existing) {
    return true;
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

const isSelfCheck = async (parent, args, ctx) => {
  // get list of users's global perms
  if (!ctx.user || !ctx.user.id) {
    return false;
  }
  return args.id === ctx.user.id;
};

const isAnyTeamAdminCheck = async (parent, args, ctx) => {
  const q = await ctx.sq`team_permissions`.return`count(*)`
    .where({ userId: ctx.user.id, permission: "ADMIN" })
    .one();
  return q && q.count && q.count > 0;
};

const userIsTeamAdminofUpdatingTtibCheck = async (parent, args, ctx) => {
  // get ttbid details
  const dbTtib = await ctx.dataSource.ttib.byIdLoader.load(args.id);
  // IS user admin?
  const existingTeamAdminPerm = await ctx.dataSource.olPerms.loadOne.load({
    userId: ctx.user.id,
    teamId: dbTtib.teamId,
    permission: "ADMIN"
  });

  return !!existingTeamAdminPerm;
};

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

const isSelf = rule(`name-is-self-perm`, { cache: "contextual" })(isSelfCheck);

const isAnyTeamAdmin = rule(`is-any-team-admin`, { cache: "contextual" })(
  isAnyTeamAdminCheck
);

const userIsTeamAdminofUpdatingTtib = rule(`userIsTeamAdminofUpdatingTtib`, {
  cache: "contextual"
})(userIsTeamAdminofUpdatingTtibCheck);

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
const has_TP_MEMBER = hasTeamPerm("input.teamId", "MEMBER");
// const owns_target = userOwnsTarget("input.targetId");

/* ************************************************************************* 
  Permissions Mapping
************************************************************************* */

export default shield(
  {
    Query: {
      ttibs: and(isAuthenticated, or(has_TP_MEMBER, has_GP_ADMIN)),
      me: allow,
      form: and(isAuthenticated, has_GP_ADMIN),
      users: and(isAuthenticated, has_GP_ADMIN),
      teams: allow,
      team: allow,
      summaryCountTeams: and(isAuthenticated, has_GP_ADMIN),
      gtibs: and(isAuthenticated, or(has_GP_ADMIN, isAnyTeamAdmin)),
      user: and(isAuthenticated, or(has_GP_ADMIN, isSelf)),
      teamUsers: and(isAuthenticated, or(has_TP_ADMIN, has_GP_ADMIN))
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
      updateUser: and(isAuthenticated, or(has_GP_ADMIN, isSelf)),
      applyGtib: and(isAuthenticated, has_GP_ADMIN),
      createTeam: and(isAuthenticated, has_GP_ADMIN),
      confirmLogin: isNotAuthenticated,
      requestTeamMembership: isAuthenticated,
      requestLogin: isNotAuthenticated,
      updateUser: and(isAuthenticated, or(has_GP_ADMIN, isSelf)),
      register: isNotAuthenticated,
      removeTeamPermission: and(
        isAuthenticated,
        or(has_TP_ADMIN, has_GP_ADMIN)
      ),
      grantTeamPermission: and(isAuthenticated, or(has_TP_ADMIN, has_GP_ADMIN))
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
    ValidationTests: allow,
    ValidationTypeEnum: allow,
    VALIDATION_TEST_METHOD_ENUM: allow,
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
    ApplyGtibResult: allow,
    CreateTeamResult: allow,
    ConfirmLoginResult: allow,
    RequestTeamMembershipResult: allow,
    RequestLoginResult: allow,
    TeamsResult: allow,
    UpdateUserResult: allow,
    RegisterResult: allow,
    RemoveTeamPermissionResult: allow,
    GrantTeamPermissionResult: allow,
    OLTeamPerms: allow,
    OLTeamPermsSummary: allow,
    GlobalPermissionsEnum: allow,
    OLUserPerms: allow,
    UpdateTtibResult: allow,
    TeamUsersResult: allow
  },
  {
    fallbackError: "Not Authorized!", // default error spelling is Authorised.
    fallbackRule: deny,
    debug: process.env.NODE_ENV !== "production",
    allowExternalErrors: true
  }
  // { debug: true, allowExternalErrors: true }
);
