import { loaderGetHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context, info) => {
  let path = null;
  let identifier = null;
  if (args.id) {
    path = "dataSource.user.byIdLoader";
    identifier = "id";
  } else if (args.email) {
    path = "dataSource.user.byEmailLoader";
    identifier = "email";
  } else {
    return null;
  }

  return loaderGetHOR(path, identifier)(root, args, context, info);
};
