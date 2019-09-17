import _ from "lodash";

export default async (root, args, context) => {
  const form = await context.dataSource.form.byIdLoader.load(root.formId);
  // return form;

  const appendedData = { ...form };
  appendedData.fields = _.map(appendedData.fields, x => {
    return Object.assign({}, x, { formId: form.id });
  });
  return appendedData;
};
