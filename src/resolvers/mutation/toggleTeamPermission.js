import {
  makeDefaultState,
  intToPerms,
  permsToInt
} from "../../utils/permissions/permBitWise";

export default async (root, args, context) => {
  // using compound loader to check.
  const existing = await context.dataSource.teamPermission.loadOne.load({
    teamId: args.input.teamId,
    userId: args.input.userId
  });

  let seedPerms = makeDefaultState();

  if (existing) {
    seedPerms = Object.assign({}, seedPerms, intToPerms(existing.permission));
  }

  if (seedPerms[args.input.permission]) {
    return {
      success: false,
      code: "DUPLICATE",
      message: "User already has this permission."
    };
  }

  seedPerms[args.input.permission] = true;
  seedPerms["APPLICANT"] = false;

  // overwrite all if DENIED
  if (args.input.permission === "DENIED") {
    seedPerms = Object.assign({}, makeDefaultState(), { DENIED: true });
  }

  // remove ALL perms before creating new one
  // await context.dataSource.olPerms.remove({
  //   userId: args.input.userId,
  //   teamId: args.input.teamId
  // });

  // Joshua prefers for now that each user only have one permission. This
  // effectively cancels out 16-18, 28, 29.
  // am leaving it though because if we go back to multi model I just need
  // to comment out below.
  seedPerms = Object.assign({}, makeDefaultState(), {
    [args.input.permission]: true
  });

  if (!existing) {
    await context.dataSource.teamPermission.create({
      teamId: args.input.teamId,
      userId: args.input.userId,
      permission: permsToInt(seedPerms)
    });
  } else {
    await context.sq`team_permissions_bit`
      .set({ permission: permsToInt(seedPerms) })
      .where({ teamId: args.input.teamId, userId: args.input.userId });
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
