import _ from "lodash";
export default async (root, args, ctx) => {
  const data = await ctx.dataSource.olPerms.summaryCountsByTeamIdLoader.load(
    root.id
  );
  return _(data)
    .map(x => ({ permission: x.permission, count: x.count }))
    .value();
};
