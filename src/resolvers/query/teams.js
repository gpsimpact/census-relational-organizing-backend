import { getManyHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context, info) => {
  // const existsFilters = {
  //   teamPermissions: {
  //     tableName: "team_permissions",
  //     joinCondition: "team_permissions.team_id = teams.id"
  //   }
  // };
  const dbHandle = context.sq.from`teams`;
  // return getManyHOR(dbHandle, existsFilters)(root, args, context, info);
  return getManyHOR(dbHandle)(root, args, context, info);
};
