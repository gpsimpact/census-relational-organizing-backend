import { getManyHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context, info) => {
  const existsFilters = {
    teamPermissions: {
      tableName: "team_permissions",
      where: "team_permissions.team_id = teams.id"
    }
  };
  const dbHandle = context.sq.from`teams`;
  return getManyHOR(dbHandle, existsFilters)(root, args, context, info);
};
