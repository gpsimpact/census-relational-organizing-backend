import _ from "lodash";

// this pares down context into something more loggable
export default context => {
  const outContext = _.pick(context, ["user"]);

  outContext.req = _.assign(
    {},
    _.pick(context.req, [
      "headers",
      "url",
      "method",
      "statusCode",
      "statusMessage",
      "baseUrl",
      "originalUrl",
      "params",
      "query",
      "body"
    ])
  );

  return outContext;
};
