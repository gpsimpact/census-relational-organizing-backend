import { updateOneHOR } from "@jakelowen/sqorn-graphql-filters";
import fieldsHaveUniqueNames from "../../utils/forms/fieldsHaveUniqueNames";

export default async (root, args, context) => {
  if (!args.id) {
    return {
      success: false,
      code: "INPUT_ERROR",
      message: "Must provide a form id.",
      item: null
    };
  }
  // check if email already exists
  const existing = await context.dataSource.form.byIdLoader.load(args.id);
  if (!existing) {
    return {
      success: false,
      code: "DOES_NOT_EXIST",
      message: "No form with this id exists.",
      item: null
    };
  }

  const writeArgs = { ...args };
  if (writeArgs.input.fields) {
    if (!fieldsHaveUniqueNames(writeArgs.input.fields)) {
      return {
        code: "INPUT_ERROR",
        message: "Fields have duplicate name properties",
        success: false
      };
    }

    writeArgs.input.fields = JSON.stringify(writeArgs.input.fields);
  }

  const form = await updateOneHOR(
    "dataSource.form.update",
    "input",
    "id",
    "UPDATE_FORM"
  )(root, writeArgs, context);
  return {
    success: true,
    code: "OK",
    message: "Form updated.",
    item: form
  };
};
