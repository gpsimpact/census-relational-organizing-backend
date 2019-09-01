import { loaderGetHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context, info) =>
  loaderGetHOR("dataSource.targetContactAttempt.byIdLoader", "id")(
    root,
    args,
    context,
    info
  );
