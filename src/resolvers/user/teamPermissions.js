export default async (root, args, ctx) =>
  ctx.dataSource.olPerms.OLUserPerms(root.id);
