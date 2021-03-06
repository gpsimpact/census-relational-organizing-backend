import { getManyHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context, info) => {
  const dbHandle = context.sq.from`target_notes`.where({
    targetId: args.input.targetId
  });
  return getManyHOR(dbHandle)(root, args, context, info);
};
