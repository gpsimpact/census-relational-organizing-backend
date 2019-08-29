import { loaderGetHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context, info) =>
  loaderGetHOR("dataSource.targetNote.byIdLoader", "id")(
    root,
    args,
    context,
    info
  );
