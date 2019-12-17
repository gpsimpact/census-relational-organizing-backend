export default async (root, args, context) => {
  const userId = context.user.id;

  await context.sq`team_permissions`.delete.where({
    userId,
    teamId: args.teamId,
    permission: "APPLICANT"
  });

  return {
    success: true,
    code: "OK",
    message: "Application Successfully Cancelled."
  };
};
