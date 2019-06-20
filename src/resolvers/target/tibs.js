import _ from "lodash";
export default async (root, args, ctx) => {
  // get all team relevant tibs
  const tibs = await ctx.sq`tibs`
    .where({ active: true, visible: true })
    .where(ctx.sq.e`is_global`.eq(true).or(ctx.sq.e`team_id`.eq(root.teamId)));

  // get target true tibs
  const targetTrueTibs = await ctx.dataSource.target.trueTibsLoader.load(
    root.id
  );

  const trueTibs = [];
  const trueTibsTimestampLookupHash = {};

  _.forEach(targetTrueTibs, x => {
    trueTibs.push(x.tibId);
    trueTibsTimestampLookupHash[x.tibId] = x.createdAt;
  });

  // zip / construct
  return _.map(tibs, x => {
    return {
      id: x.id,
      text: x.text,
      isApplied: _.includes(trueTibs, x.id),
      appliedAt: trueTibsTimestampLookupHash[x.id] || null
    };
  });
};
