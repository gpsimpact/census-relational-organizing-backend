import { updateOneHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context) => {
  // make sure team exists
  const existing = await context.dataSource.targetNote.byIdLoader.load(args.id);
  if (!existing) {
    return {
      success: false,
      code: "INPUT_ERROR",
      message: "No note with this id exists.",
      item: null
    };
  }

  let writeInput = Object.assign({}, args.input, {
    lastEditedBy: context.user.id
  });

  const writeArgs = Object.assign({}, args, { input: writeInput });

  // console.log({ writeArgs });

  // proceed to update target object
  const targetNote = await updateOneHOR(
    "dataSource.targetNote.update",
    "input",
    "id",
    "UPDATE_TARGET_NOTE"
  )(root, writeArgs, context);

  return {
    success: true,
    code: "OK",
    message: "Note updated.",
    item: targetNote
  };
};
