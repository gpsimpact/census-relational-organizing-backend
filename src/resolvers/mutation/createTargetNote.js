import { addOneHOR } from "@jakelowen/sqorn-graphql-filters";
// import _ from "lodash";

export default async (root, args, context) => {
  // make sure target exists
  const existingTarget = await context.dataSource.target.byIdLoader.load(
    args.input.targetId
  );
  if (!existingTarget) {
    return {
      success: false,
      code: "INPUT_ERROR",
      message: "No target with this id exists.",
      item: null
    };
  }

  let writeInput = Object.assign({}, args.input, {
    content: args.input.content,
    createdBy: context.user.id,
    targetId: args.input.targetId
  });

  const writeArgs = Object.assign({}, args, { input: writeInput });

  const targetNote = await addOneHOR(
    "dataSource.targetNote.create",
    "input",
    "CREATE_TARGET_NOTE"
  )(root, writeArgs, context);

  return {
    success: true,
    code: "OK",
    message: "Target Note created.",
    item: targetNote
  };
};
