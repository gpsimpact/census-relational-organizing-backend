/* eslint-disable camelcase */
import { shield, not, and } from "graphql-shield";
import isAuthenticated from "./isAuthenticated";
import hasGlobalPerm from "./hasGlobalPerm";

const has_GP_ADMIN_CLIENTS = hasGlobalPerm("ADMIN_CLIENTS");
const has_GP_ADMIN_CLIENTS_CRUD = hasGlobalPerm("ADMIN_CLIENTS_CRUD");

export default shield(
  {
    Query: {
      client: and(isAuthenticated, has_GP_ADMIN_CLIENTS),
      clients: and(isAuthenticated, has_GP_ADMIN_CLIENTS)
    },
    Mutation: {
      confirmLogin: not(isAuthenticated),
      register: not(isAuthenticated),
      requestLogin: not(isAuthenticated),
      createClient: and(isAuthenticated, has_GP_ADMIN_CLIENTS_CRUD),
      removeClient: and(isAuthenticated, has_GP_ADMIN_CLIENTS_CRUD),
      updateClient: and(isAuthenticated, has_GP_ADMIN_CLIENTS_CRUD),
      createIO: isAuthenticated,
      updateIO: isAuthenticated
    }
  },
  // 🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸 Fuck YA 🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸🇺🇸
  // default error spelling is Authorised. But this is `Murica.
  { fallbackError: "Not Authorized!" }
);
