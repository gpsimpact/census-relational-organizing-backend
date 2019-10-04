import { intToPerms, permsToInt } from "../../utils/permissions/permBitWise";

export default async (root, args, context) => {
  // using compound loader to check.
  const existing = await context.dataSource.teamPermission.loadOne.load({
    userId: args.input.userId,
    teamId: args.input.teamId
  });

  if (!existing) {
    return {
      success: false,
      code: "DOES_NOT_EXIST",
      message: "User does not have this permission."
    };
  }

  const parsedPerm = intToPerms(existing.permission);

  if (!parsedPerm[args.input.permission]) {
    return {
      success: false,
      code: "DOES_NOT_EXIST",
      message: "User does not have this permission."
    };
  }

  parsedPerm[args.input.permission] = false;

  await context.sq`team_permissions_bit`
    .set({ permission: permsToInt(parsedPerm) })
    .where({ userId: args.input.userId, teamId: args.input.teamId });
  // await context.dataSource.teamPermission.update({
  //   userId: args.input.userId,
  //   teamId: args.input.teamId,
  //   permission: permsToInt(parsedPerm)
  // });

  return {
    success: true,
    code: "OK",
    message: "Permission removed."
  };
};
