import { getManyHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context, info) => {
  const dbHandle = context.sq.from`users`.where(
    context.sq
      .txt`(EXISTS (SELECT user_id FROM team_permissions WHERE users.id = user_id and team_id = ${
      args.input.teamId
    } and permission IN ${context.sq.txt(
      ...args.input.includePermissions
    )} LIMIT 1))`
  );

  return getManyHOR(dbHandle)(root, args, context, info);
};
