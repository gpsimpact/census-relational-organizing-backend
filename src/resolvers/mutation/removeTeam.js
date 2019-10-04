import { removeOneHOR } from "@jakelowen/sqorn-graphql-filters";

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

  // write a removeMany and apply to team_permissions
  // await context.dataSource.team.removeAllTeamPermissionsByTeamId(args.id);
  await context.sq`team_permissions_bit`.delete.where({ teamId: args.id });
  await removeOneHOR("dataSource.team.remove", "id", "REMOVE_TEAM")(
    root,
    args,
    context
  );
  return {
    success: true,
    code: "OK",
    message: "Team removed.",
    item: null
  };
};
