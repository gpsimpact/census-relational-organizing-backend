import { getManyHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context, info) => {
  const dbHandle = context.sq.from`target_contact_attempts`.where({
    targetId: args.input.targetId
  });
  return getManyHOR(dbHandle)(root, args, context, info);
};
