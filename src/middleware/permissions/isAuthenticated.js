import { rule } from "graphql-shield";

export default rule({ cache: "contextual" })(async (parent, args, ctx) => {
  if (!ctx.user) return false;
  if (!ctx.user.id) return false;
  return true;
});
