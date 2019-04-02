export default async (root, args, context) => {
  // using compound loader to check.
  const existing = await context.dataSource.olPerms.loadOne.load({
    ...args.input
  });

  if (!existing) {
    return {
      success: false,
      code: "DOES_NOT_EXIST",
      message: "User does not have this permission."
    };
  }

  await context.dataSource.olPerms.remove({
    ...args.input
  });

  return {
    success: true,
    code: "OK",
    message: "Permission removed."
  };
};
