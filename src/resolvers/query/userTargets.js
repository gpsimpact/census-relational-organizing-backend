import { getManyHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context, info) => {
  const dbHandle = context.sq.from`targets`.where({
    userId: context.user.id,
    teamId: args.teamId
  });
  return getManyHOR(dbHandle)(root, args, context, info);
};
