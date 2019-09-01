import { updateOneHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context) => {
  // make sure team exists
  const existing = await context.dataSource.targetContactAttempt.byIdLoader.load(
    args.id
  );
  if (!existing) {
    return {
      success: false,
      code: "INPUT_ERROR",
      message: "No target contact attempt with this id exists.",
      item: null
    };
  }

  let writeInput = Object.assign({}, args.input, {
    lastEditedBy: context.user.id
  });

  const writeArgs = Object.assign({}, args, { input: writeInput });

  // proceed to update target object
  const targetContactAttempt = await updateOneHOR(
    "dataSource.targetContactAttempt.update",
    "input",
    "id",
    "UPDATE_TARGET_CONTACT_ATTEMPT"
  )(root, writeArgs, context);

  return {
    success: true,
    code: "OK",
    message: "Contact attempt updated.",
    item: targetContactAttempt
  };
};
