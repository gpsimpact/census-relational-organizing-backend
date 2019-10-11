export default async (root, args, context) => {
  const taskDefinition = await context.dataSource.taskDefinition.byIdLoader.load(
    args.input.taskDefinitionId
  );
  return taskDefinition;
};
