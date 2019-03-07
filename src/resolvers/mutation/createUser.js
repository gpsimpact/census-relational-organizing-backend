import { addOneHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context) => {
  // check if email already exists
  const existing = await context.dataSource.user.byEmailLoader.load(
    args.input.email
  );
  if (existing) {
    return {
      success: false,
      code: "DUPLICATE",
      message: "A user with this email already exists.",
      item: null
    };
  }

  const user = await addOneHOR(
    "dataSource.user.create",
    "input",
    "CREATE_USER"
  )(root, args, context);
  return {
    success: true,
    code: "OK",
    message: "User created.",
    item: user
  };
};
