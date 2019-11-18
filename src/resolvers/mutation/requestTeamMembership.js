import _ from "lodash";
import {
  permsToInt,
  intToPerms,
  makeDefaultState
} from "../../utils/permissions/permBitWise";

export default async (root, args, context) => {
  const userId = context.user.id;

  // using compound loader to check.
  const existing = await context.dataSource.teamPermission.loadOne.load({
    userId,
    teamId: args.teamId
  });

  let permSeed = makeDefaultState();

  if (existing) {
    // consosle.log("???? here");
    permSeed = Object.assign({}, permSeed, intToPerms(existing.permission));
  }

  // console.log({ existing, permSeed });

  if (permSeed.APPLICANT === true) {
    return {
      success: false,
      code: "DUPLICATE",
      message: "An application for membership is already pending."
    };
  }

  if (existing && existing.permission > 0) {
    return {
      success: false,
      code: "INELIGIBLE",
      message: "You are ineligible to apply for membership."
    };
  }
  // }

  // set bit
  permSeed.APPLICANT = true;

  // if (existing) {
  //   await context.dataSource.teamPermission.update({
  //     userId,
  //     teamId: args.teamId,
  //     permission: permsToInt(permSeed)
  //   });
  // } else {
  await context.dataSource.teamPermission.create({
    userId,
    teamId: args.teamId,
    permission: permsToInt(permSeed)
  });
  // }

  // get team info
  const team = await context.dataSource.team.byIdLoader.load(args.teamId);
  // get applicant info
  const applicant = await context.dataSource.user.byIdLoader.load(userId);

  let teamAdminEmails = await context.sq.sql`
  SELECT 
    email 
  FROM USERS u
  WHERE EXISTS (
    SELECT 
      user_id 
    FROM team_permissions_bit 
    WHERE (permission & 16 ) > 0 
    AND u.id = user_id
    AND team_id = ${args.teamId}
  ) AND u.active
  OR EXISTS (
    SELECT 1
    FROM global_permissions
    WHERE u.id = user_id
    AND permission = 'ADMIN'
  );
  `;

  teamAdminEmails = _.map(teamAdminEmails, "email");

  const messageData = {
    to: teamAdminEmails,
    from: process.env.EMAIL_SENDER,
    templateId: "d-7b546784ced74cb7b6192588ca2feaee",
    dynamic_template_data: {
      TEAM_NAME: team.name,
      APPLICANT_NAME: `${applicant.firstName} ${applicant.lastName}`,
      DASHBOARD_LINK: `${process.env.FRONTEND_HOST}/dash/vols?team=${team.id}`
    }
  };

  // send email
  await context.sendEmail(messageData);

  return {
    success: true,
    code: "OK",
    message: "Application Successful."
  };
};
