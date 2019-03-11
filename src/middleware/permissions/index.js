/* eslint-disable camelcase */
import { shield, not, and } from "graphql-shield";
import isAuthenticated from "./isAuthenticated";
import hasGlobalPerm from "./hasGlobalPerm";

const has_GP_ADMIN_TEAMS = hasGlobalPerm("ADMIN_TEAMS");
const has_GP_ADMIN_TEAMS_CRUD = hasGlobalPerm("ADMIN_TEAMS_CRUD");

export default shield(
  {
    Query: {
      team: and(isAuthenticated, has_GP_ADMIN_TEAMS),
      teams: and(isAuthenticated, has_GP_ADMIN_TEAMS)
    },
    Mutation: {
      confirmLogin: not(isAuthenticated),
      register: not(isAuthenticated),
      requestLogin: not(isAuthenticated),
      createTeam: and(isAuthenticated, has_GP_ADMIN_TEAMS_CRUD),
      removeTeam: and(isAuthenticated, has_GP_ADMIN_TEAMS_CRUD),
      updateTeam: and(isAuthenticated, has_GP_ADMIN_TEAMS_CRUD)
    }
  },
  // 🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸 Fuck YA 🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸
  // default error spelling is Authorised. But this is `Murica.
  { fallbackError: "Not Authorized!" }
);
