import { removeOneHOR } from "@jakelowen/sqorn-graphql-filters";

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

  // write a removeMany and apply to client_permissions
  await context.dataSource.client.removeAllClientPermissionsByClientId(args.id);
  await removeOneHOR("dataSource.client.remove", "id", "REMOVE_CLIENT")(
    root,
    args,
    context
  );
  return {
    success: true,
    code: "OK",
    message: "User removed.",
    item: null
  };
};
