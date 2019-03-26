import { rule } from "graphql-shield";
import { get } from "lodash";

export default (teamIdPath, requiredTP) =>
  rule(`name-has-team-perm-${teamIdPath}-${requiredTP}`, {
    cache: "contextual"
  })(async (parent, args, ctx) => {
    if (!ctx.req.session.userId) {
      return false;
    }

    const grantorUserId = ctx.req.session.userId;

    // extract team id
    const teamId = get(args, teamIdPath);

    // check for perm
    const existing = await ctx.dataSource.olPerms.loadOne.load({
      userId: grantorUserId,
      teamId,
      permission: requiredTP
    });

    if (existing) {
      return true;
    }
    return false;
  });
