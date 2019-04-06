import { rule } from "graphql-shield";

export default rule({ cache: "contextual" })(async (parent, args, ctx) => {
  console.log("USER ID IS", ctx.req.session.userId);
  console.log("USER session IS", ctx.req.session);
  if (
    ctx.req.session &&
    ctx.req.session.userId &&
    ctx.req.session.userId !== null &&
    ctx.req.session.userId !== undefined
  ) {
    return new Error("You are already authenticated");
  }
  return true;
});
