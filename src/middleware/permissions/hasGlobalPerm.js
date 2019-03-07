import { rule } from "graphql-shield";
import { includes } from "lodash";

export default requiredGP =>
  rule(`name-has-global-perm-${requiredGP}`, { cache: "contextual" })(
    async (parent, args, ctx) => {
      // get list of users's global perms
      if (!ctx.req.session.userId) {
        return false;
      }
      const gps = await ctx.dataSource.globalPermissions.forUser(
        ctx.req.session.userId
      );

      return includes(gps, requiredGP);
    }
  );
