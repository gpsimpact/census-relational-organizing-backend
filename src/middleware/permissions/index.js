/* eslint-disable camelcase */
import { shield, and, or, allow, deny } from "graphql-shield";
import isAuthenticated from "./isAuthenticated";
import isNotAuthenticated from "./isNotAuthenticated";
import hasGlobalPerm from "./hasGlobalPerm";
import hasTeamPerm from "./hasTeamPerm";
import argsIDisSelf from "./isSelf";

const has_GP_ADMIN_TEAMS = hasGlobalPerm("ADMIN_TEAMS");
const has_GP_ADMIN_TEAMS_CRUD = hasGlobalPerm("ADMIN_TEAMS_CRUD");
const has_GP_ADMIN_USERS_CRUD = hasGlobalPerm("ADMIN_USERS_CRUD");
const has_GP_ADMIN_TEAMS_ASSIGNPERMISSIONS = hasGlobalPerm(
  "ADMIN_TEAMS_ASSIGNPERMISSIONS"
);

const has_TP_ASSIGNPERMISSIONS = hasTeamPerm(
  "input.teamId",
  "ASSIGNPERMISSIONS"
);

export default shield(
  {
    Query: {
      //teams: //isAuthenticated, //and(isAuthenticated, has_GP_ADMIN_TEAMS),
      summaryCountTeams: and(isAuthenticated, has_GP_ADMIN_TEAMS)
    },
    Mutation: {
      confirmLogin: isNotAuthenticated,
      register: isNotAuthenticated,
      requestLogin: isNotAuthenticated,
      createTeam: and(isAuthenticated, has_GP_ADMIN_TEAMS_CRUD),
      removeTeam: and(isAuthenticated, has_GP_ADMIN_TEAMS_CRUD),
      updateTeam: and(isAuthenticated, has_GP_ADMIN_TEAMS_CRUD),
      updateUser: and(
        isAuthenticated,
        or(has_GP_ADMIN_USERS_CRUD, argsIDisSelf)
      ),
      requestTeamMembership: isAuthenticated,
      grantTeamPermission: and(
        isAuthenticated,
        or(has_GP_ADMIN_TEAMS_ASSIGNPERMISSIONS, has_TP_ASSIGNPERMISSIONS)
      ),
      removeTeamPermission: and(
        isAuthenticated,
        or(has_GP_ADMIN_TEAMS_ASSIGNPERMISSIONS, has_TP_ASSIGNPERMISSIONS)
      )
    },
    Team: {
      userPermissions: and(isAuthenticated, has_GP_ADMIN_TEAMS),
      userPermissionSummaryCounts: and(isAuthenticated, has_GP_ADMIN_TEAMS)
    }
  },
  // default error spelling is Authorised.
  { fallbackError: "Not Authorized!", debug: true, allowExternalErrors: true }
  // { debug: true, allowExternalErrors: true }
);
