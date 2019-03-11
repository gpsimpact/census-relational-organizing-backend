import { updateOneHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context) => {
  // check if email already exists
  const existing = await context.dataSource.team.byIdLoader.load(args.id);
  if (!existing) {
    return {
      success: false,
      code: "DOES_NOT_EXIST",
      message: "No team with this id exists.",
      item: null
    };
  }

  const team = await updateOneHOR(
    "dataSource.team.update",
    "input",
    "id",
    "UPDATE_TEAM"
  )(root, args, context);
  return {
    success: true,
    code: "OK",
    message: "Team updated.",
    item: team
  };
};
