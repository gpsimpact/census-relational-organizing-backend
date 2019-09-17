export default async (root, args, context) => {
  if (args.targetId) {
    const data = await context.dataSource.formField.valueLoader.load({
      formId: root.formId,
      name: root.name,
      targetId: args.targetId
    });
    if (data && data.value) {
      return data.value;
    }
  }
  return null;
};
