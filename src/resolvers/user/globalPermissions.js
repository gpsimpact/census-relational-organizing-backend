export default async (root, args, ctx) =>
  ctx.dataSource.globalPermissions.forUser(root.id);
