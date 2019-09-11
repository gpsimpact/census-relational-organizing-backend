export default (root, args, context) =>
  context.dataSource.form.byIdLoader.load(root.formId);
