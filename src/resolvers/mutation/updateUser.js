import { updateOneHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context) => {
  if (!args.id) {
    return {
      success: false,
      code: "DOES_NOT_EXIST",
      message: "No user with this id exists.",
      item: null
    };
  }
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

  const user = await updateOneHOR(
    "dataSource.user.update",
    "input",
    "id",
    "UPDATE_USER"
  )(root, args, context);
  return {
    success: true,
    code: "OK",
    message: "User updated.",
    item: user
  };
};
