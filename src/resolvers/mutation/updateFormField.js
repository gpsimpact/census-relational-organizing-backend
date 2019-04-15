import { updateOneHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context) => {
  if (!args.id) {
    return {
      success: false,
      code: "INPUT_ERROR",
      message: "Must provide a form field id.",
      item: null
    };
  }
  // check if email already exists
  const existing = await context.dataSource.formField.byIdLoader.load(args.id);
  if (!existing) {
    return {
      success: false,
      code: "DOES_NOT_EXIST",
      message: "No formField with this id exists.",
      item: null
    };
  }

  const writeArgs = { ...args };
  if (writeArgs.input.selectOptions) {
    writeArgs.input.selectOptions = JSON.stringify(
      writeArgs.input.selectOptions
    );
  }
  if (writeArgs.input.validationTests) {
    writeArgs.input.validationTests = JSON.stringify(
      writeArgs.input.validationTests
    );
  }

  const formField = await updateOneHOR(
    "dataSource.formField.update",
    "input",
    "id",
    "UPDATE_FORM_FIELD"
  )(root, writeArgs, context);
  return {
    success: true,
    code: "OK",
    message: "Form Field updated.",
    item: formField
  };
};
