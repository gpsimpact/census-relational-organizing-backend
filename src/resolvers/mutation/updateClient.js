import { updateOneHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context) => {
  // check if email already exists
  const existing = await context.dataSource.client.byIdLoader.load(args.id);
  if (!existing) {
    return {
      success: false,
      code: "DOES_NOT_EXIST",
      message: "No client with this id exists.",
      item: null
    };
  }

  const user = await updateOneHOR(
    "dataSource.client.update",
    "input",
    "id",
    "UPDATE_CLIENT"
  )(root, args, context);
  return {
    success: true,
    code: "OK",
    message: "Client updated.",
    item: user
  };
};
