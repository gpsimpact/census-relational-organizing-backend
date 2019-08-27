export default async (root, args, context) => {
  const userId = context.user.id;

  await context.dataSource.olPerms.remove({ userId, teamId: args.teamId });

  return {
    success: true,
    code: "OK",
    message: "Application Successfully Cancelled."
  };
};
