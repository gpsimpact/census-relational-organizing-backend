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
import globalPermissions from "./user/globalPermissions";
import teamPermissions from "./user/teamPermissions";
import userPermissions from "./team/userPermissions";
import OLUserPermsTeam from "./OLUserPerms/team";
import OLTeamPermsUser from "./OLTeamPerms/user";
import requestLogin from "./mutation/requestLogin";
import register from "./mutation/register";
import confirmLogin from "./mutation/confirmLogin";
import logout from "./mutation/logout";

export default {
  Query: {
    hello,
    me,
    users,
    user,
    team,
    teams,
    summaryCountTeams
    // io,
    // ios
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
    logout
    // createCycle,
    // createIO,
    // updateIO,
    // createIOLineItem,
    // updateIOLineItem
  },
  User: {
    globalPermissions,
    teamPermissions
  },
  Team: {
    userPermissions
  },
  OLUserPerms: {
    team: OLUserPermsTeam
  },
  OLTeamPerms: {
    user: OLTeamPermsUser
  },
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime
};
