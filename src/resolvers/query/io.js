import { loaderGetHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context, info) => {
  let path = null;
  let identifier = null;

  if (args.id) {
    path = "dataSource.io.byIdLoader";
    identifier = "id";
  } else {
    return null;
  }

  return loaderGetHOR(path, identifier)(root, args, context, info);
};
