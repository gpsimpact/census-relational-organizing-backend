export default async (root, args, context) => {
  if (args.targetId) {
    const data = await context.dataSource.formField.valueLoader.load({
      fieldId: root.id,
      targetId: args.targetId
    });
    return data.value;
  }
  return null;
};
