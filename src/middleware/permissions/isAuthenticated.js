import { rule } from "graphql-shield";

export default rule({ cache: "contextual" })(async (parent, args, ctx) => {
  return (
    ctx.req.session.userId !== null && ctx.req.session.userId !== undefined
  );
});
