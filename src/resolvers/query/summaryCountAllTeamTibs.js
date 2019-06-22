import _ from "lodash";
export default async (root, args, context) => {
  const existsQuery = context.sq`targets`.return`1`
    .where({
      teamId: args.teamId
    })
    .where({ id: context.sq.raw(`target_id`) })
    .limit(1);

  const counts = await context.sq.from`target_true_tibs`
    .return(`tib_id, count(*) as true_count`)
    .where(context.sq.txt`(EXISTS ${existsQuery})`).groupBy`tib_id`;

  const targetCount = await context.sq`targets`.return`count(*) as count`
    .where({ teamId: args.teamId })
    .one();

  const eligibleCount = targetCount.count;

  const countsLookupHash = {};

  _.forEach(counts, x => {
    countsLookupHash[x.tibId] = x.trueCount;
  });

  // get all team ttibs
  const tibType = args.tibType || "QUESTION";

  const tibs = await context.sq`tibs`
    .where({ active: true, visible: true, tibType })
    .where(
      context.sq.e`is_global`.eq(true).or(context.sq.e`team_id`.eq(args.teamId))
    );

  const withCounts = _.map(tibs, x => {
    const appliedCount = _.get(countsLookupHash, x.id, 0);
    return {
      id: x.id,
      text: x.text,
      appliedCount,
      unappliedCount: eligibleCount - appliedCount,
      active: x.active,
      tibType: x.tibType
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
