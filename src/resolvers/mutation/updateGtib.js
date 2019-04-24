import { updateOneHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context) => {
  if (!args.id) {
    return {
      success: false,
      code: "INPUT_ERROR",
      message: "Must provide a gtib id.",
      item: null
    };
  }
  // check if email already exists
  const existing = await context.dataSource.gtib.byIdLoader.load(args.id);
  if (!existing) {
    return {
      success: false,
      code: "DOES_NOT_EXIST",
      message: "No gtib with this id exists.",
      item: null
    };
  }

  // dont allow updates if attempting to update text of a GTIB older than 5 mins
  const ageOfCreation = new Date() - existing.createdAt;
  var FIVE_MINS = 5 * 60 * 1000; /* ms */
  if (ageOfCreation > FIVE_MINS && args.input.text) {
    return {
      success: false,
      code: "EXPIRED",
      message:
        "You can only update the text of a gtib for 5 minutes after creation. Try deleting and creating a new one.",
      item: existing
    };
  }

  const writeInput = Object.assign({}, args.input, { userId: context.user.id });
  const writeArgs = Object.assign({}, args, { input: writeInput });

  const gtib = await updateOneHOR(
    "dataSource.gtib.update",
    "input",
    "id",
    "UPDATE_GTIB"
  )(root, writeArgs, context);
  return {
    success: true,
    code: "OK",
    message: "GTIB has been updated.",
    item: gtib
  };
};
