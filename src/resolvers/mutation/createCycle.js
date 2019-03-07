import { addOneHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context) => {
  const cycle = await addOneHOR(
    "dataSource.cycle.create",
    "input",
    "CREATE_CYCLE"
  )(root, args, context);
  return {
    success: true,
    code: "OK",
    message: "Cycle created.",
    item: cycle
  };
};
