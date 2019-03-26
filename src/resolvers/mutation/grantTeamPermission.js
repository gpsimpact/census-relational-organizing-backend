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

  await context.dataSource.olPerms.create({
    ...args.input
  });

  return {
    success: true,
    code: "OK",
    message: "Permission granted."
  };
};
