import _ from "lodash";

export default async (root, args, context) => {
  const language = args.language || "EN";

  // load all forms
  const forms = await context.sq`forms`.where({ id: root.formId });
  // const form = await context.dataSource.form.byIdLoader.load(root.formId);
  // return form;
  let languageForm = _.find(forms, f => f.language === language);

  if (!languageForm) {
    languageForm = _.find(forms, f => f.language === "EN");
  }

  const appendedData = { ...languageForm };
  appendedData.fields = _.map(appendedData.fields, x => {
    return Object.assign({}, x, { formId: root.formId });
  });
  return appendedData;
};
