import { addOneHOR } from "@jakelowen/sqorn-graphql-filters";
// import _ from "lodash";

export default async (root, args, context) => {
  // make sure form exists
  const existingForm = await context.dataSource.form.byIdLoader.load(
    args.input.formId
  );
  if (!existingForm) {
    return {
      success: false,
      code: "INPUT_ERROR",
      message: "No form with this id exists.",
      item: null
    };
  }

  let writeInput = Object.assign({}, args.input, {
    createdBy: context.user.id
  });

  const writeArgs = Object.assign({}, args, { input: writeInput });

  const targetContactAttempt = await addOneHOR(
    "dataSource.taskDefinition.create",
    "input",
    "CREATE_TASK_DEFINITION"
  )(root, writeArgs, context);

  return {
    success: true,
    code: "OK",
    message: "Task Definition Created.",
    item: targetContactAttempt
  };
};
