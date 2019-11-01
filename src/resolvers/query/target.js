import { loaderGetHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context, info) => {
  const foo = await loaderGetHOR("dataSource.target.byIdLoader", "id")(
    root,
    args,
    context,
    info
  );
  console.log({ foo });
  return foo;
};
