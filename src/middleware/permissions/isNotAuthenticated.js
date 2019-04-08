import { rule } from "graphql-shield";

export default rule({ cache: "contextual" })(async (parent, args, ctx) => {
  if (
    ctx.user &&
    ctx.user.id &&
    ctx.user.id !== null &&
    ctx.user.id !== undefined
  ) {
    return new Error("You are already authenticated");
  }
  return true;
});
