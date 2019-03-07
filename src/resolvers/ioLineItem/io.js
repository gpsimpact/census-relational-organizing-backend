export default (root, args, context) =>
  context.dataSource.io.byIdLoader.load(root.insertionOrderId);
