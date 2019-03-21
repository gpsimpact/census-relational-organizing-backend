/* eslint-disable camelcase */
import { shield, not, and, or } from "graphql-shield";
import isAuthenticated from "./isAuthenticated";
import hasGlobalPerm from "./hasGlobalPerm";
import argsIDisSelf from "./isSelf";

const has_GP_ADMIN_TEAMS = hasGlobalPerm("ADMIN_TEAMS");
const has_GP_ADMIN_TEAMS_CRUD = hasGlobalPerm("ADMIN_TEAMS_CRUD");
const has_GP_ADMIN_USERS_CRUD = hasGlobalPerm("ADMIN_USERS_CRUD");

export default shield(
  {
    Query: {
      team: and(isAuthenticated, has_GP_ADMIN_TEAMS),
      teams: and(isAuthenticated, has_GP_ADMIN_TEAMS),
      summaryCountTeams: and(isAuthenticated, has_GP_ADMIN_TEAMS)
    },
    Mutation: {
      confirmLogin: not(isAuthenticated),
      register: not(isAuthenticated),
      requestLogin: not(isAuthenticated),
      createTeam: and(isAuthenticated, has_GP_ADMIN_TEAMS_CRUD),
      removeTeam: and(isAuthenticated, has_GP_ADMIN_TEAMS_CRUD),
      updateTeam: and(isAuthenticated, has_GP_ADMIN_TEAMS_CRUD),
      updateUser: and(
        isAuthenticated,
        or(has_GP_ADMIN_USERS_CRUD, argsIDisSelf)
      )
    }
  },
  // default error spelling is Authorised.
  { fallbackError: "Not Authorized!" }
);
