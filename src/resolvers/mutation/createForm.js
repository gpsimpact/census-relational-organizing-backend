import fieldsHaveUniqueNames from "../../utils/forms/fieldsHaveUniqueNames";

export default async (root, { input }, context) => {
  if (!fieldsHaveUniqueNames(input.fields)) {
    return {
      code: "INPUT_ERROR",
      message: "Fields have duplicate name properties",
      success: false
    };
  }

  const data = Object.assign({}, input, {
    fields: JSON.stringify(input.fields),
    userId: context.user.id
  });

  const dbData = await context.dataSource.form.create(data);

  return {
    code: "OK",
    message: "Form has been created.",
    item: dbData,
    success: true
  };
};
