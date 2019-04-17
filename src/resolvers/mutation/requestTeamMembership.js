export default async (root, args, context) => {
  const userId = context.user.id;

  // using compound loader to check.
  const existing = await context.dataSource.olPerms.loadOne.load({
    userId,
    teamId: args.teamId,
    permission: "APPLICANT"
  });

  if (existing) {
    return {
      success: false,
      code: "DUPLICATE",
      message: "An application for membership is already pending."
    };
  }
  await context.dataSource.olPerms.create({
    userId,
    teamId: args.teamId,
    permission: "APPLICANT"
  });

  return {
    success: true,
    code: "OK",
    message: "Application Successful."
  };
};
