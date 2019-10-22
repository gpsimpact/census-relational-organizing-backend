// import {
//   makeDefaultState,
//   permsToInt,
//   intToPerms
// } from "../../utils/permissions/permBitWise";

export default async (root, args, context) => {
  const userId = context.user.id;

  // await context.dataSource.olPerms.remove({ userId, teamId: args.teamId });

  // using compound loader to check.
  // const existing = await context.dataSource.teamPermission.loadOne.load({
  //   userId,
  //   teamId: args.teamId
  // });

  await context.sq`team_permissions_bit`.delete.where({
    userId,
    teamId: args.teamId
  });

  // let permSeed = makeDefaultState();

  // if (existing) {
  //   permSeed = Object.assign(
  //     {},
  //     permSeed,
  //     intToPerms(existing.permission || 0)
  //   );
  // }

  // permSeed.APPLICANT = false;

  // await context.sq`team_permissions_bit`
  //   .set({ permission: permsToInt(permSeed) })
  //   .where({ userId, teamId: args.teamId });

  return {
    success: true,
    code: "OK",
    message: "Application Successfully Cancelled."
  };
};
