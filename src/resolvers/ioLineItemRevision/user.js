export default async (root, args, context) =>
  await context.dataSource.user.byIdLoader.load(root.createdBy);
