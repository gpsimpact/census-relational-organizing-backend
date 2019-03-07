import { removeOneHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context) => {
  // check if email already exists
  const existing = await context.dataSource.user.byIdLoader.load(args.id);
  if (!existing) {
    return {
      success: false,
      code: "DOES_NOT_EXIST",
      message: "No user with this id exists.",
      item: null
    };
  }

  await removeOneHOR("dataSource.user.remove", "id", "REMOVE_USER")(
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
