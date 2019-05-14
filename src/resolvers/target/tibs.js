import _ from "lodash";
export default async (root, args, ctx) => {
  // get all team ttibs
  const teamTibs = await ctx.dataSource.ttib.byTeamIdLoader.load(root.teamId);
  // get target true tibs
  const targetTrueTibs = await ctx.dataSource.target.trueTibsLoader.load(
    root.id
  );

  const trueTibs = [];
  const trueTibsTimestampLookupHash = {};

  _.forEach(targetTrueTibs, x => {
    trueTibs.push(x.ttibId);
    trueTibsTimestampLookupHash[x.ttibId] = x.createdAt;
  });

  // zip / construct
  return _.map(teamTibs, x => {
    return {
      id: x.id,
      text: x.text,
      isApplied: _.includes(trueTibs, x.id),
      appliedAt: trueTibsTimestampLookupHash[x.id] || null
    };
  });
};
