import { getManyHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context, info) => {
  const existsQuery = context.sq`team_permissions`.return`1`
    .where({
      teamId: args.input.teamId
    })
    .where({
      permission: args.input.includePermissions
    })
    .where({ userId: context.sq.raw(`users.id`) });

  const dbHandle = context.sq.from`users`.where(
    context.sq.txt`(EXISTS ${existsQuery})`
  );

  return getManyHOR(dbHandle)(root, args, context, info);
};
