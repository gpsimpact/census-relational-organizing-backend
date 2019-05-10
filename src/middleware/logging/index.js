export default async (resolve, root, args, context, info) => {
  // log REQUEST
  context.logger.info(
    {
      root,
      args,
      info,
      user: context.user
    },
    "/ REQUEST"
  );

  context.logger.debug(
    {
      root,
      args,
      info,
      context
    },
    "/ REQUEST_DEBUG"
  );

  // await result
  const result = await resolve(root, args, context, info);

  // log RESULT
  context.logger.info(
    {
      root,
      args,
      info,
      result,
      user: context.user
    },
    "/ RESULT"
  );

  context.logger.debug(
    {
      root,
      args,
      info,
      result,
      context
    },
    "/ RESULT_DEBUG"
  );

  return result;
};
