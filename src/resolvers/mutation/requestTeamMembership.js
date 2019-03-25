export default async (root, args, context) => {
  const userId = context.req.session.userId;
  try {
    await context.dataSource.olPerms.create({
      userId,
      teamId: args.teamId,
      permission: "APPLICANT"
    });
  } catch (err) {
    // I am checking here for a specific DB duplicate key error. Alternatively I could use a compound dataloader to test for record existance.
    // This was just faster at the moment have not implemented a compound dataloader yet.
    if (
      (err.detail = `Key (user_id, team_id, permission)=(${userId}, ${
        args.teamId
      }, APPLICANT) already exists.`)
    )
      return {
        success: false,
        code: "DUPLICATE",
        message: "An application for membership is already pending."
      };
  }

  return {
    success: true,
    code: "OK",
    message: "Application Successful."
  };
};
