// Generics
import {
  createGDS,
  updateGDS,
  removeGDS,
  removeManyGDS,
  singleLoaderGDS,
  manyLoaderGDS
} from "@jakelowen/sqorn-graphql-filters";

import { sq } from "./db";
// users
import meLoader from "./dataSources/users/me";
import setLoginToken from "./dataSources/users/setLoginToken";
import getLoginToken from "./dataSources/users/getLoginToken";
// globalPermissions
import globalPermissionsForUser from "./dataSources/globalPermissions/gpArrayByUserId";
// Client Permissions
import OLUserPerms from "./dataSources/OLPermissions/OLUserPerms";
import OLClientPerms from "./dataSources/OLPermissions/OLClientPerms";
// Client

// pubsub
import redis, { pubsub } from "./redis";
// email
import transport from "./connectors/emailTransport";

export default (req, res) => {
  const userByIdLoader = singleLoaderGDS(sq.from`users`, "id");
  const userByEmailLoader = singleLoaderGDS(sq.from`users`, "email");
  const clientByIdLoader = singleLoaderGDS(sq.from`clients`, "id");
  const clientBySlugLoader = singleLoaderGDS(sq.from`clients`, "slug");
  const clientByAbbreviationLoader = singleLoaderGDS(
    sq.from`clients`,
    "abbreviation"
  );
  const clientByNameLoader = singleLoaderGDS(sq.from`clients`, "name");

  const readyMeLoader = meLoader(req.session, userByIdLoader);
  const globalPermissionsByUserIdLoader = manyLoaderGDS(
    sq.from`global_permissions`,
    "userId"
  );
  // const readyGlobalPermissionsForUser = globalPermissionsForUser(
  //   globalPermissionsByUserIdLoader
  // );

  const removeAllClientPermissionsByClientId = removeManyGDS(
    sq.from`client_permissions`,
    "clientId"
  );

  const OLPermsByUserIdLoader = manyLoaderGDS(
    sq.from`client_permissions`.leftJoin`clients`
      .on`client_permissions.client_id = clients.id`
      .where`clients.active = ${true}`,
    // .andWhere("clients.active", "=", true),
    "userId"
  );

  const OLPermsByClientIdLoader = manyLoaderGDS(
    sq.from`client_permissions`,
    "clientId"
  );

  const ioByIdLoader = singleLoaderGDS(sq.from`insertion_orders_current`, "id");
  const ioLiByIdLoader = singleLoaderGDS(
    sq.from`insertion_orders_line_items_current`,
    "id"
  );

  const dataSource = {
    user: {
      byIdLoader: userByIdLoader,
      byEmailLoader: userByEmailLoader,
      me: readyMeLoader,
      create: createGDS(sq.from`users`),
      update: updateGDS(sq.from`users`),
      remove: removeGDS(sq.from`users`),
      setLoginToken: setLoginToken(redis),
      getLoginToken: getLoginToken(redis)
    },
    globalPermissions: {
      byUserIdLoader: globalPermissionsByUserIdLoader,
      forUser: globalPermissionsForUser(globalPermissionsByUserIdLoader)
    },
    olPerms: {
      byUserIdLoader: OLPermsByUserIdLoader,
      byClientIdLoader: OLPermsByClientIdLoader,
      OLUserPerms: OLUserPerms(OLPermsByUserIdLoader),
      OLClientPerms: OLClientPerms(OLPermsByClientIdLoader)
    },
    client: {
      byIdLoader: clientByIdLoader,
      bySlugLoader: clientBySlugLoader,
      byAbbreviationLoader: clientByAbbreviationLoader,
      byNameLoader: clientByNameLoader,
      create: createGDS(sq.from`clients`),
      update: updateGDS(sq.from`clients`),
      remove: removeGDS(sq.from`clients`),
      removeAllClientPermissionsByClientId
    },
    cycle: {
      create: createGDS(sq.from`cycles`),
      byClientIdLoader: manyLoaderGDS(sq.from`cycles`, "clientId")
    },
    io: {
      create: createGDS(sq.from`insertion_orders_revisions`),
      // update: update(knex("insertion_orders_revisions"), "insertion_order_id"),
      byIdLoader: ioByIdLoader,
      revisionsByIOIdLoader: manyLoaderGDS(
        sq.from`insertion_orders_revisions`.orderBy`timestamp DESC`,
        "insertionOrderId"
      )
    },
    ioLineItem: {
      create: createGDS(sq.from`insertion_orders_line_items_revisions`),
      byIdLoader: ioLiByIdLoader,
      revisionsByIOLineItemIdLoader: manyLoaderGDS(
        sq.from`insertion_orders_line_items_revisions`.orderBy`timestamp DESC`,
        "insertionOrderLineItemId"
      )
    }
  };

  return {
    req,
    res,
    sq,
    dataSource,
    redis,
    pubsub,
    sendEmail: messageData => transport.sendMail(messageData)
  };
};
