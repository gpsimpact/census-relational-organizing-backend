import { addOneHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context) => {
  const existingName = await context.dataSource.team.byNameLoader.load(
    args.input.name
  );
  if (existingName) {
    return {
      success: false,
      code: "DUPLICATE",
      message: "A team with this name already exists.",
      item: null
    };
  }

  const team = await addOneHOR(
    "dataSource.team.create",
    "input",
    "CREATE_TEAM"
  )(root, args, context);
  return {
    success: true,
    code: "OK",
    message: "Team created.",
    item: team
  };
};
