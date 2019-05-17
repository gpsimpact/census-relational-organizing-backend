import { GraphQLDate, GraphQLTime, GraphQLDateTime } from "graphql-iso-date";
import hello from "./query/hello";
import me from "./query/me";
import users from "./query/users";
import user from "./query/user";
import team from "./query/team";
import teams from "./query/teams";
import summaryCountTeams from "./query/summaryCountTeams";
import removeTeam from "./mutation/removeTeam";
import createTeam from "./mutation/createTeam";
import updateTeam from "./mutation/updateTeam";
import createUser from "./mutation/createUser";
import updateUser from "./mutation/updateUser";
import removeUser from "./mutation/removeUser";
import requestTeamMembership from "./mutation/requestTeamMembership";
import grantTeamPermission from "./mutation/grantTeamPermission";
import removeTeamPermission from "./mutation/removeTeamPermission";
import globalPermissions from "./user/globalPermissions";
import teamPermissions from "./user/teamPermissions";
// import userPermissions from "./team/userPermissions";
import userPermissionSummaryCounts from "./team/userPermissionsSummaryCounts";
import OLUserPermsTeam from "./OLUserPerms/team";
import OLTeamPermsUser from "./OLTeamPerms/user";
import requestLogin from "./mutation/requestLogin";
import register from "./mutation/register";
import confirmLogin from "./mutation/confirmLogin";
import writeFormValues from "./mutation/writeFormValues";
import form from "./query/form";
import value from "./formField/value";
import createForm from "./mutation/createForm";
import updateForm from "./mutation/updateForm";
import createGtib from "./mutation/createGtib";
import updateGtib from "./mutation/updateGtib";
import gtibs from "./query/gtibs";
import createTtib from "./mutation/createTtib";
import updateTtib from "./mutation/updateTtib";
import ttibs from "./query/ttibs";
import applyGtib from "./mutation/applyGtib";
import teamUsers from "./query/teamUsers";
import createTarget from "./mutation/createTarget";
import target from "./query/target";
import tibs from "./target/tibs";
import updateTarget from "./mutation/updateTarget";
import targets from "./query/targets";
import userTargets from "./query/userTargets";
import removeTarget from "./mutation/removeTarget";
import summaryCountMyTeamTargets from "./query/summaryCountMyTeamTargets";
import summaryTotalMyTeamHouseholdSize from "./query/summaryTotalMyTeamHouseholdSize";

export default {
  Query: {
    hello,
    me,
    users,
    user,
    team,
    teams,
    summaryCountTeams,
    form,
    gtibs,
    ttibs,
    teamUsers,
    target,
    targets,
    userTargets,
    summaryCountMyTeamTargets,
    summaryTotalMyTeamHouseholdSize
  },
  Mutation: {
    createUser,
    updateUser,
    removeUser,
    createTeam,
    updateTeam,
    removeTeam,
    requestLogin,
    register,
    confirmLogin,
    requestTeamMembership,
    grantTeamPermission,
    removeTeamPermission,
    writeFormValues,
    createForm,
    updateForm,
    createGtib,
    updateGtib,
    createTtib,
    updateTtib,
    applyGtib,
    createTarget,
    updateTarget,
    removeTarget
  },
  User: {
    globalPermissions,
    teamPermissions
  },
  Team: {
    // userPermissions,
    userPermissionSummaryCounts
  },
  OLUserPerms: {
    team: OLUserPermsTeam
  },
  OLTeamPerms: {
    user: OLTeamPermsUser
  },
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime,
  FormField: {
    value
  },
  Target: {
    tibs
  }
};
