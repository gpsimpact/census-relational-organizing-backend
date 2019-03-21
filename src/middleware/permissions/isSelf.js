import { rule } from "graphql-shield";

export default rule(`name-is-self-perm`, { cache: "contextual" })(
  async (parent, args, ctx) => {
    // get list of users's global perms
    if (!ctx.req.session.userId) {
      return false;
    }
    return args.id === ctx.req.session.userId;
  }
);
