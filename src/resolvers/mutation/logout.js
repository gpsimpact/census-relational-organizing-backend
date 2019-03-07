export default async (root, args, context) => {
  await new Promise(resolve => context.req.session.destroy(() => resolve()));
  context.res.clearCookie("qid");

  // 4. Return the message
  return {
    code: "OK",
    message: "You have been logged out.",
    success: true,
    item: null
  };
};
