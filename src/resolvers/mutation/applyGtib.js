import _ from "lodash";

export default async (root, args, context) => {
  // check if email already exists
  const sourceGtib = await context.dataSource.gtib.byIdLoader.load(
    args.input.gtibId
  );
  if (!sourceGtib) {
    return {
      success: false,
      code: "DOES_NOT_EXIST",
      message: "No gtib with this id exists.",
      item: null
    };
  }

  // check if there is already a ttib with this gtibLink
  const conflictingTtib = await context.sq`ttibs`
    .where({ teamId: args.input.teamId, gtibLink: sourceGtib.id })
    .one();
  if (conflictingTtib) {
    const dbData = await context.dataSource.ttib.update(
      conflictingTtib.id,
      Object.assign({}, conflictingTtib, { active: true, visible: true })
    );
    return {
      success: true,
      code: "OK",
      message:
        "This gtib has already been applied. It has been (re)set to visible/active.",
      item: dbData
    };
  }

  // remove ID from gtib, and add it as gtibLink
  const writeData = _.omit(
    Object.assign({}, sourceGtib, {
      userId: context.user.id,
      gtibLink: sourceGtib.id,
      teamId: args.input.teamId
    }),
    "id"
  );

  const dbData = await context.dataSource.ttib.create(writeData);

  return {
    code: "OK",
    message: "GTIB has been applied.",
    item: dbData,
    success: true
  };
};
