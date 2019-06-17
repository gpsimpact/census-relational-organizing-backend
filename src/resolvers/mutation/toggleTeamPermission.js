export default async (root, args, context) => {
  // using compound loader to check.
  const existing = await context.dataSource.olPerms.loadOne.load({
    ...args.input
  });

  if (existing) {
    return {
      success: false,
      code: "DUPLICATE",
      message: "User already has this permission."
    };
  }

  // remove ALL perms before creating new one
  await context.dataSource.olPerms.remove({
    userId: args.input.userId,
    teamId: args.input.teamId
  });

  await context.dataSource.olPerms.create({
    ...args.input
  });

  // Remove applicant status if exists
  // await context.dataSource.olPerms.remove({
  //   userId: args.input.userId,
  //   teamId: args.input.teamId,
  //   permission: "APPLICANT"
  // });

  return {
    success: true,
    code: "OK",
    message: "Permission granted."
  };
};
