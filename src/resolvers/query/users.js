import { getManyHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context, info) => {
  const dbHandle = context.sq.from`users`;
  return getManyHOR(dbHandle)(root, args, context, info);
};
