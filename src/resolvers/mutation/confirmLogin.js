export default async (root, args, context) => {
  const userId = await context.dataSource.user.getLoginToken(args.token);
  if (!userId) {
    return {
      code: "DOES_NOT_EXIST",
      success: false,
      message: "This token is either invalid or expired!"
    };
  }

  // 5. Set the cookie
  context.req.session.userId = userId;

  // load full user record
  const user = context.dataSource.user.byIdLoader.load(userId);
  // 6. return the new user
  return {
    code: "OK",
    success: true,
    message:
      "You have successfully logged in. You may close this window and return to your previous tab to continue!",
    item: user
  };
};
