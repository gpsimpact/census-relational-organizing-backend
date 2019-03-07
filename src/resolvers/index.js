import { GraphQLDate, GraphQLTime, GraphQLDateTime } from "graphql-iso-date";
import hello from "./query/hello";
import me from "./query/me";
import users from "./query/users";
import user from "./query/user";
import client from "./query/client";
import clients from "./query/clients";
import removeClient from "./mutation/removeClient";
import createClient from "./mutation/createClient";
import updateClient from "./mutation/updateClient";
import createUser from "./mutation/createUser";
import updateUser from "./mutation/updateUser";
import removeUser from "./mutation/removeUser";
import globalPermissions from "./user/globalPermissions";
import clientPermissions from "./user/clientPermissions";
import userPermissions from "./client/userPermissions";
import OLUserPermsClient from "./OLUserPerms/client";
import OLClientPermsUser from "./OLClientPerms/user";
import requestLogin from "./mutation/requestLogin";
import register from "./mutation/register";
import confirmLogin from "./mutation/confirmLogin";
import logout from "./mutation/logout";
// import updatedAt from "./shared/updatedAt";
// import createdAt from "./shared/createdAt";
import createCycle from "./mutation/createCycle";
import cycles from "./client/cycles";
import engagementDateBegin from "./cycle/engagementDateBegin";
import engagementDateEnd from "./cycle/engagementDateEnd";
import createIO from "./mutation/createIO";
import ioClient from "./io/client";
import ioCreatedBy from "./io/user";
import updateIO from "./mutation/updateIO";
import revisionHistory from "./io/revisionHistory";
import ioRevisionClient from "./ioRevision/client";
import ioRevisionUser from "./ioRevision/user";
import io from "./query/io";
import ios from "./query/ios";
import createIOLineItem from "./mutation/createIOLineItem";
import ioLiIo from "./ioLineItem/io";
import ioLiUser from "./ioLineItem/user";
import updateIOLineItem from "./mutation/updateIOLineItem";
import ioLiRevisionHistory from "./ioLineItem/revisionHistory";
import ioLiRevisionIO from "./ioLineItemRevision/io";
import ioLiRevisionUser from "./ioLineItemRevision/user";

export default {
  Query: {
    hello,
    me,
    users,
    user,
    client,
    clients,
    io,
    ios
  },
  Mutation: {
    createUser,
    updateUser,
    removeUser,
    createClient,
    updateClient,
    removeClient,
    requestLogin,
    register,
    confirmLogin,
    logout,
    createCycle,
    createIO,
    updateIO,
    createIOLineItem,
    updateIOLineItem
  },
  User: {
    globalPermissions,
    clientPermissions
    // updatedAt,
    // createdAt
  },
  Client: {
    userPermissions,
    cycles
    // updatedAt,
    // createdAt
  },
  Cycle: {
    engagementDateBegin,
    engagementDateEnd
  },
  OLUserPerms: {
    client: OLUserPermsClient
  },
  OLClientPerms: {
    user: OLClientPermsUser
  },
  io: {
    client: ioClient,
    createdBy: ioCreatedBy,
    revisionHistory
  },
  ioRevision: {
    client: ioRevisionClient,
    createdBy: ioRevisionUser
  },
  ioLineItem: {
    io: ioLiIo,
    createdBy: ioLiUser,
    revisionHistory: ioLiRevisionHistory
  },
  ioLineItemRevision: {
    io: ioLiRevisionIO,
    createdBy: ioLiRevisionUser
  },
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime
};
