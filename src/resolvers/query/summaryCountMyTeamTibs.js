import _ from "lodash";
export default async (root, args, context) => {
  const existsQuery = context.sq`targets`.return`1`
    .where({
      teamId: args.teamId
    })
    .where({ id: context.sq.raw(`target_id`) })
    .where({
      userId: context.user.id
    })
    .limit(1);

  const counts = await context.sq.from`target_true_tibs`
    .return(`ttib_id, count(*) as true_count`)
    .where(context.sq.txt`(EXISTS ${existsQuery})`).groupBy`ttib_id`;

  const countsLookupHash = {};

  _.forEach(counts, x => {
    countsLookupHash[x.ttibId] = x.trueCount;
  });

  // get all team ttibs
  const teamTibs = await context.dataSource.ttib.byTeamIdLoader.load(
    args.teamId
  );

  const withCounts = _.map(teamTibs, x => {
    return {
      id: x.id,
      text: x.text,
      count: _.get(countsLookupHash, x.id, 0),
      active: x.active
    };
  });

  return _.filter(withCounts, x => x.active === true);

  // console.log({ countsLookupHash, teamTibs });
};

// SELECT
// 	ttib_id,
// 	count(*) as true_count
// FROM target_true_tibs
// WHERE EXISTS (
// 	SELECT 1
// 	FROM targets
// 	WHERE team_id = 'cc1159c2-788e-4369-ae4a-b4bcda7ed503'
// 	AND target_id = id
// 	AND user_id = 'cc1159c2-788e-4369-ae4a-b4bcda7ed503'
// 	LIMIT 1
// )
// GROUP BY 1;
