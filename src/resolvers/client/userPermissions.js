export default async (root, args, ctx) =>
  ctx.dataSource.olPerms.OLClientPerms(root.id);
