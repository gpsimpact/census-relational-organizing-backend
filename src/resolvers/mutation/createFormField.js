export default async (root, { input }, context) => {
  const data = Object.assign({}, input, {
    selectOptions: JSON.stringify(input.selectOptions),
    validationTests: JSON.stringify(input.validationTests),
    userId: context.user.id
  });

  const dbData = await context.dataSource.formField.create(data);

  return {
    code: "OK",
    message: "Form field has been created.",
    item: dbData,
    success: true
  };
};
