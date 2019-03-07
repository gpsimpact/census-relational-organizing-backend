export default (root, args, context) =>
  context.dataSource.client.byIdLoader.load(root.clientId);
