import { loaderGetHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context, info) => {
  return loaderGetHOR("dataSource.taskAssignment.byIdLoader", "id")(
    root,
    args,
    context,
    info
  );
};
