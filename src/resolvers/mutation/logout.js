export default async (root, args, context) => {
  // old working way.
  // await new Promise(resolve => context.req.session.destroy(() => resolve()));
  // console.log("Second here");
  // context.res.clearCookie("qid");

  await new Promise((res, rej) =>
    context.req.session.destroy(err => {
      if (err) {
        return rej(false);
      }
      context.res.clearCookie("qid");
      return res(true);
    })
  );

  // 4. Return the message
  return {
    code: "OK",
    message: "You have been logged out.",
    success: true,
    item: null
  };
};
