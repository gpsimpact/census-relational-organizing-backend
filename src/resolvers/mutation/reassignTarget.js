// import { removeOneHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context) => {
  // check if email already exists
  const existingTarget = await context.dataSource.target.byIdLoader.load(
    args.input.targetId
  );
  if (!existingTarget || existingTarget.teamId !== args.input.teamId) {
    return {
      success: false,
      code: "DOES_NOT_EXIST",
      message: "No target with this id exists.",
      item: null
    };
  }

  const existingUser = await context.dataSource.user.byIdLoader.load(
    args.input.newOwnerUserId
  );
  if (!existingUser) {
    return {
      success: false,
      code: "DOES_NOT_EXIST",
      message: "No user with this id exists.",
      item: null
    };
  }

  // ensure new owner in same team.
  const existingPerm = await context.dataSource.teamPermission.loadOne.load({
    teamId: args.input.teamId,
    userId: args.input.newOwnerUserId
  });
  if (!existingPerm) {
    return {
      success: false,
      code: "DOES_NOT_EXIST",
      message: "New user is not in this team.",
      item: null
    };
  }

  await context.dataSource.target.update(args.input.targetId, {
    userId: args.input.newOwnerUserId
  });

  // refetch after mutation
  const target = await context.dataSource.target.byIdLoader
    .clear(args.input.targetId)
    .load(args.input.targetId);

  return {
    success: true,
    code: "OK",
    message: "Target owner changed.",
    item: target
  };
};
