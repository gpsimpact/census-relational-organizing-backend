export default (root, args, context) => {
  return context.dataSource.taskDefinition.byIdLoader.load(
    root.taskDefinitionId
  );
};
