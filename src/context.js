// Generics
import {
  createGDS,
  updateGDS,
  removeGDS,
  removeManyGDS
} from "@jakelowen/sqorn-graphql-filters";
// import _ from "lodash";
import RedisSMQ from "rsmq";

import { sq } from "./db";
import simpleSingleLoader from "./dataSources/simpleSingleLoader";
import simpleManyLoader from "./dataSources/simpleManyLoader";
import compoundOneLoader from "./dataSources/CompoundOneLoader";
// users
import setLoginToken from "./dataSources/users/setLoginToken";
import getLoginToken from "./dataSources/users/getLoginToken";
// globalPermissions
import globalPermissionsForUser from "./dataSources/globalPermissions/gpArrayByUserId";
// Team Permissions
// import OLUserPerms from "./dataSources/OLPermissions/OLUserPerms";
// import OLTeamPerms from "./dataSources/OLPermissions/OLTeamPerms";
// email
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// pubsub
import redis, { pubsub } from "./redis";
// import CompoundManyLoader from "./dataSources/CompoundManyLoader";

const setInactiveDataSource = dbHandle => async id => {
  await dbHandle.where({ id }).set({ active: false });
  return true;
};

export default (req, res, logger, rsmq) => {
  const userByIdLoader = simpleSingleLoader(sq.from`users`, "id");
  const userByEmailLoader = simpleSingleLoader(sq.from`users`, "email");
  const teamByIdLoader = simpleSingleLoader(sq.from`teams`, "id");
  const teamBySlugLoader = simpleSingleLoader(sq.from`teams`, "slug");
  const teamByNameLoader = simpleSingleLoader(sq.from`teams`, "name");
  // const UserPermissionSummaryCountsByTeamIdLoader = simpleManyLoader(
  //   sq.from`team_user_permission_summary_counts`,
  //   "teamId"
  // );

  const globalPermissionsByUserIdLoader = simpleManyLoader(
    sq.from`global_permissions`,
    "userId"
  );
  // const readyGlobalPermissionsForUser = globalPermissionsForUser(
  //   globalPermissionsByUserIdLoader
  // );

  const removeAllTeamPermissionsByTeamId = removeManyGDS(
    sq.from`team_permissions`,
    "teamId"
  );

  // const OLPermsByUserIdLoader = simpleManyLoader(
  //   sq.from`team_permissions`.leftJoin`teams`
  //     .on`team_permissions.team_id = teams.id`.where`teams.active = ${true}`,
  //   // .andWhere("teams.active", "=", true),
  //   "userId"
  // );

  // const OLPermsByTeamIdLoader = simpleManyLoader(
  //   sq.from`team_permissions`,
  //   "teamId"
  // );

  // const ioByIdLoader = singleLoaderGDS(sq.from`insertion_orders_current`, "id");
  // const ioLiByIdLoader = singleLoaderGDS(
  //   sq.from`insertion_orders_line_items_current`,
  //   "id"
  // );

  const dataSource = {
    user: {
      byIdLoader: userByIdLoader,
      byEmailLoader: userByEmailLoader,
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
    // olPerms: {
    //   byUserIdLoader: OLPermsByUserIdLoader,
    //   byTeamIdLoader: OLPermsByTeamIdLoader,
    //   summaryCountsByTeamIdLoader: UserPermissionSummaryCountsByTeamIdLoader,
    //   OLUserPerms: OLUserPerms(OLPermsByUserIdLoader),
    //   OLTeamPerms: OLTeamPerms(OLPermsByTeamIdLoader),
    //   create: createGDS(sq.from`team_permissions`),
    //   loadOne: compoundOneLoader(sq.from`team_permissions`, [
    //     "userId",
    //     "teamId",
    //     "permission"
    //   ]),
    //   remove: data => sq.delete.from`team_permissions`.where(data)
    // },
    team: {
      byIdLoader: teamByIdLoader,
      bySlugLoader: teamBySlugLoader,
      byNameLoader: teamByNameLoader,
      create: createGDS(sq.from`teams`),
      update: updateGDS(sq.from`teams`),
      remove: removeGDS(sq.from`teams`),
      removeAllTeamPermissionsByTeamId
    },
    formField: {
      // create: createGDS(sq.from`form_fields`),
      // update: updateGDS(sq.from`form_fields`),
      // byIdLoader: simpleSingleLoader(sq.from`form_fields`, "id"),
      valueLoader: compoundOneLoader(sq.from`form_values`, [
        "formId",
        "targetId",
        "name"
      ])
    },
    form: {
      create: createGDS(sq.from`forms`),
      update: updateGDS(sq.from`forms`),
      byIdLoader: simpleSingleLoader(sq.from`forms`, "id")
    },
    // gtib: {
    //   // Depreciated
    //   create: createGDS(sq.from`gtibs`),
    //   update: updateGDS(sq.from`gtibs`),
    //   byIdLoader: simpleSingleLoader(sq.from`gtibs`, "id")
    // },
    // ttib: {
    //   // Depreciated
    //   create: createGDS(sq.from`ttibs`),
    //   update: updateGDS(sq.from`ttibs`),
    //   byIdLoader: simpleSingleLoader(sq.from`ttibs`, "id"),
    //   byGtibLinkIdLoader: simpleSingleLoader(sq.from`ttibs`, "gtib_link"),
    //   byTeamIdLoader: simpleManyLoader(sq.from`ttibs`, "teamId")
    // },
    tib: {
      create: createGDS(sq.from`tibs`),
      update: updateGDS(sq.from`tibs`),
      byIdLoader: simpleSingleLoader(sq.from`tibs`, "id"),
      byTeamIdLoader: simpleManyLoader(sq.from`tibs`, "teamId")
    },
    target: {
      create: createGDS(sq.from`targets`),
      update: updateGDS(sq.from`targets`),
      byIdLoader: simpleSingleLoader(sq.from`targets`, "id"),
      trueTibsLoader: simpleManyLoader(sq.from`target_true_tibs`, "targetId"),
      remove: setInactiveDataSource(sq.from`targets`)
    },
    targetNote: {
      create: createGDS(sq.from`target_notes`),
      update: updateGDS(sq.from`target_notes`),
      byIdLoader: simpleSingleLoader(sq.from`target_notes`, "id")
    },
    targetContactAttempt: {
      create: createGDS(sq.from`target_contact_attempts`),
      update: updateGDS(sq.from`target_contact_attempts`),
      byIdLoader: simpleSingleLoader(sq.from`target_contact_attempts`, "id")
    },
    taskDefinition: {
      create: createGDS(sq.from`task_definitions`),
      byIdLoader: simpleSingleLoader(sq.from`task_definitions`, "id")
    },
    taskAssignment: {
      byIdLoader: simpleSingleLoader(sq.from`task_assignments`, "id"),
      byTeamIdLoader: simpleManyLoader(sq`task_assignments`, "teamId")
    },
    teamPermission: {
      create: createGDS(sq.from`team_permissions`),
      loadOne: compoundOneLoader(sq.from`team_permissions`, [
        "userId",
        "teamId"
      ]),
      update: updateGDS(sq.from`team_permissions`),
      byUserIdLoader: simpleManyLoader(sq.from`team_permissions`, "userId"),
      byTeamIdLoader: simpleManyLoader(sq.from`team_permissions`, "teamId")
    },
    taskAssignmentStatus: {
      loadOne: compoundOneLoader(sq.from`task_assignment_status`, [
        "targetId",
        "taskAssignmentId"
      ])
    },
    targetTasks: {}
  };

  const sendEmail = messageData => {
    // if testing, use sandbox mode. Won't actually send email
    if (process.env.NODE_ENV === "test") {
      messageData.mailSettings = {
        sandbox_mode: {
          enable: true
        }
      };
    }
    return sgMail.send(messageData);
  };

  return {
    req,
    res,
    sq,
    dataSource,
    redis,
    pubsub, // redis pubsub
    sendEmail,
    user: req.user,
    logger,
    rsmq
  };
};
