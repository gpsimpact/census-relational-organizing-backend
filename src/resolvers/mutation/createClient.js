import { addOneHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context) => {
  // check if email already exists
  const existingAbb = await context.dataSource.client.byAbbreviationLoader.load(
    args.input.abbreviation
  );
  if (existingAbb) {
    return {
      success: false,
      code: "DUPLICATE",
      message: "A client with this abbreviation already exists.",
      item: null
    };
  }

  const existingName = await context.dataSource.client.byNameLoader.load(
    args.input.name
  );
  if (existingName) {
    return {
      success: false,
      code: "DUPLICATE",
      message: "A client with this name already exists.",
      item: null
    };
  }

  const client = await addOneHOR(
    "dataSource.client.create",
    "input",
    "CREATE_CLIENT"
  )(root, args, context);
  return {
    success: true,
    code: "OK",
    message: "Client created.",
    item: client
  };
};
