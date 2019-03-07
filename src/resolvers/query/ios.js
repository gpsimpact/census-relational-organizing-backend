import { getManyHOR } from "@jakelowen/sqorn-graphql-filters";
import { map } from "bluebird";
import { toCamelCase } from "../../utils/changeObjectCase";

export default async (root, args, context, info) => {
  const dbHandle = context.sq.from`insertion_orders_current`;
  const data = await getManyHOR(dbHandle)(root, args, context, info);
  data.items = map(data.items, x => toCamelCase(x));
  return data;
};
