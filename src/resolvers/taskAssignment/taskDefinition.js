export default (root, args, context) =>
  context.dataSource.taskDefinition.byIdLoader.load(root.taskDefinitionId);
