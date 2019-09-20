export default (root, args, context) => {
  if (root.notUntilCompletionOf) {
    return context.dataSource.taskAssignment.byIdLoader.load(
      root.notUntilCompletionOf
    );
  }
  return null;
};
