import { removeOneHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context) => {
  // check if email already exists
  const existing = await context.dataSource.target.byIdLoader.load(args.id);
  if (!existing) {
    return {
      success: false,
      code: "DOES_NOT_EXIST",
      message: "No target with this id exists.",
      item: null
    };
  }

  await removeOneHOR("dataSource.target.remove", "id", "REMOVE_TARGET")(
    root,
    args,
    context
  );

  // refetch after mutation
  const target = await context.dataSource.target.byIdLoader
    .clear(args.id)
    .load(args.id);

  return {
    success: true,
    code: "OK",
    message: "Target removed.",
    item: target
  };
};
