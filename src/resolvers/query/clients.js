import { getManyHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context, info) => {
  const existsFilters = {
    clientPermissions: {
      tableName: "client_permissions",
      where: "client_permissions.client_id = clients.id"
    },
    cycles: {
      tableName: "cycles",
      where: "cycles.client_id = clients.id"
    }
  };
  const dbHandle = context.sq.from`clients`;
  return getManyHOR(dbHandle, existsFilters)(root, args, context, info);
};
