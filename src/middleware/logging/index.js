import now from "performance-now";
import loggableContext from "../../utils/loggableContext";

export default async (resolve, root, args, context, info) => {
  // log REQUEST
  context.logger.info(
    {
      root,
      args,
      // info,
      user: context.user
    },
    "/ REQUEST"
  );

  context.logger.debug(
    {
      root,
      args,
      // info,
      context: loggableContext(context)
    },
    "/ REQUEST_DEBUG"
  );

  // await result
  var start = now();
  const result = await resolve(root, args, context, info);
  var end = now();
  const responseTime = (end - start).toFixed(3);

  // log RESULT
  context.logger.info(
    {
      root,
      args,
      // info,
      result,
      responseTime,
      user: context.user
    },
    "/ RESULT"
  );

  context.logger.debug(
    {
      root,
      args,
      // info,
      result,
      responseTime,
      context: loggableContext(context)
    },
    "/ RESULT_DEBUG"
  );

  return result;
};
