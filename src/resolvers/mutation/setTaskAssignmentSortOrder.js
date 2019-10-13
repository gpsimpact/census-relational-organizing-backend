import _ from "lodash";

export default async (
  root,
  { input: { teamId, orderedTaskAssignmentIds } },
  { sq, dataSource }
) => {
  // make team form exists
  const existingTeam = await dataSource.team.byIdLoader.load(teamId);
  if (!existingTeam) {
    return {
      success: false,
      code: "INPUT_ERROR",
      message: "No team with this id exists.",
      item: null
    };
  }

  // grab all existing ACTIVE team task assignments
  const allTeamActiveTA = await sq`task_assignments`.where({
    teamId,
    active: true
  }).return`id, sort_value`;

  // make sure all provided IDs are in existing team Task Assignments
  // throw if not
  const overlapTAs = _.filter(allTeamActiveTA, x => {
    return _.includes(orderedTaskAssignmentIds, x.id);
  });

  if (overlapTAs.length < orderedTaskAssignmentIds) {
    return {
      success: false,
      code: "INPUT_ERROR",
      message:
        "You provided a task assignment ID that is not active for this team.",
      item: null
    };
  }

  // if any task ids exist in db but are not provided in sort array arg.
  // push update active = false query into array if active = true
  const toBeSetInactive = _.map(
    _.filter(allTeamActiveTA, x => {
      return !_.includes(orderedTaskAssignmentIds, x.id);
    }),
    "id"
  );

  if (toBeSetInactive.length > 0) {
    await sq`task_assignments`
      .where({ id: toBeSetInactive })
      .set({ active: false, sortValue: null });
  }

  // calculate new sortValue based on array position
  // push update statements into array
  const overlapKeys = _.map(overlapTAs, "id");
  for (let idx in overlapKeys) {
    await sq`task_assignments`.where({ id: overlapKeys[idx] }).set({
      active: true,
      sortValue: _.indexOf(orderedTaskAssignmentIds, overlapKeys[idx])
    });
  }

  // refetch active team TaskAssignments from db
  // grab all existing ACTIVE team task assignments
  const allTeamActiveTARefetch = await sq`task_assignments`.where({
    teamId,
    active: true
  }).orderBy`sort_value ASC`;

  // return!

  return {
    success: true,
    code: "OK",
    message: "Task Definition Created.",
    item: allTeamActiveTARefetch
  };
};
