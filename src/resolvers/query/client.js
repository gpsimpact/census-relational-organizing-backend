import { getOneHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context, info) => {
  let path = null;
  let identifier = null;

  if (args.id) {
    path = "dataSource.client.byIdLoader";
    identifier = "id";
  } else if (args.slug) {
    path = "dataSource.client.bySlugLoader";
    identifier = "slug";
  } else {
    return null;
  }

  return getOneHOR(path, identifier)(root, args, context, info);
};
