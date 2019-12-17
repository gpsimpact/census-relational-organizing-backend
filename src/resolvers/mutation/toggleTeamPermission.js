// import {
//   makeDefaultState,
//   intToPerms,
//   permsToInt
// } from "../../utils/permissions/permBitWise";

export default async (root, args, context) => {
  // using compound loader to check.
  const existing = await context.dataSource.teamPermission.loadOne.load({
    teamId: args.input.teamId,
    userId: args.input.userId
  });

  if (existing && existing.permission === args.input.permission) {
    return {
      success: false,
      code: "DUPLICATE",
      message: "User already has this permission."
    };
  }

  // delete all existing perms
  await context.sq`team_permissions`.delete.where({
    teamId: args.input.teamId,
    userId: args.input.userId
  });

  // write new
  await context.dataSource.teamPermission.create({
    teamId: args.input.teamId,
    userId: args.input.userId,
    permission: args.input.permission
  });

  // let seedPerms = makeDefaultState();

  // // overwrite all if DENIED
  // if (args.input.permission === "DENIED") {
  //   seedPerms = Object.assign({}, makeDefaultState(), { DENIED: true });
  // }

  // remove ALL perms before creating new one
  // await context.dataSource.olPerms.remove({
  //   userId: args.input.userId,
  //   teamId: args.input.teamId
  // });

  // Joshua prefers for now that each user only have one permission. This
  // effectively cancels out 16-18, 28, 29.
  // am leaving it though because if we go back to multi model I just need
  // to comment out below.
  // seedPerms = Object.assign({}, makeDefaultState(), {
  //   [args.input.permission]: true
  // });

  // if (!existing) {
  //   await context.dataSource.teamPermission.create({
  //     teamId: args.input.teamId,
  //     userId: args.input.userId,
  //     permission: permsToInt(seedPerms)
  //   });
  // } else {
  //   await context.sq`team_permissions_bit`
  //     .set({ permission: permsToInt(seedPerms) })
  //     .where({ teamId: args.input.teamId, userId: args.input.userId });
  // }

  // send an email
  if (
    args.input.permission !== "DENIED" &&
    args.input.permission !== "APPLICANT"
  ) {
    const applicant = await context.dataSource.user.byIdLoader.load(
      args.input.userId
    );
    const team = await context.dataSource.team.byIdLoader.load(
      args.input.teamId
    );

    const messageData = {
      to: applicant.email,
      from: process.env.EMAIL_SENDER,
      templateId: "d-c339968d7dea473db309b6c4a673d42b",
      dynamic_template_data: {
        APPLICATION_PERMISSION: args.input.permission,
        TEAM_NAME: team.name,
        APPLICANT_NAME: `${applicant.firstName} ${applicant.lastName}`,
        DASHBOARD_LINK: `${process.env.FRONTEND_HOST}/dash?team=${team.id}`
      }
    };
    // send email
    await context.sendEmail(messageData);
  }

  // Remove applicant status if exists
  // await context.dataSource.olPerms.remove({
  //   userId: args.input.userId,
  //   teamId: args.input.teamId,
  //   permission: "APPLICANT"
  // });

  return {
    success: true,
    code: "OK",
    message: "Permission granted.",
    item: context.dataSource.user.byIdLoader.load(args.input.userId)
  };
};
