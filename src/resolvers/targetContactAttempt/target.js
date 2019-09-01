export default (root, args, context) =>
  context.dataSource.target.byIdLoader.load(root.targetId);
