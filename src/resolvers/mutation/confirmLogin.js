export default async (root, args, context) => {
  const userId = await context.dataSource.user.getLoginToken(args.token);

  if (!userId) {
    // console.log('!!!!! NO USER');
    return {
      code: "DOES_NOT_EXIST",
      success: false,
      message: "This token is either invalid or expired!"
    };
  }

  // 5. Set the cookie
  // eslint-disable-next-line no-param-reassign
  context.req.session.userId = userId;

  if (context.req.sessionID) {
    await context.redis.lpush(`session:${userId}`, context.req.sessionID);
  }

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
