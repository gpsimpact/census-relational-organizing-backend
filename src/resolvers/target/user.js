export default (root, args, context) =>
  context.dataSource.user.byIdLoader.load(root.userId);
