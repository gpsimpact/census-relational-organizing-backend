import { rule } from "graphql-shield";
import { includes } from "lodash";

export default requiredGP =>
  rule(`name-has-global-perm-${requiredGP}`, { cache: "contextual" })(
    async (parent, args, ctx) => {
      // get list of users's global perms
      if (!ctx.user || !ctx.user.id) {
        return false;
      }
      const gps = await ctx.dataSource.globalPermissions.forUser(ctx.user.id);

      return includes(gps, requiredGP);
    }
  );
