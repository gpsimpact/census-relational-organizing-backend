// import {
//   makeDefaultState,
//   intToPerms,
//   permsToInt
// } from "../../utils/permissions/permBitWise";

export default async (root, args, context) => {
  // using compound loader to check.

  await context.sq`team_permissions`
    .set({ acceptedTos: args.input.acceptTos })
    .where({ teamId: args.input.teamId, userId: context.user.id });

  return {
    success: true,
    code: "OK",
    message: "Team TOS acceptance set.",
    item: context.dataSource.user.byIdLoader.load(context.user.id)
  };
};
