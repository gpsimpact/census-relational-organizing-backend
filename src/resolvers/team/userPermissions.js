export default async (root, args, ctx) =>
  ctx.dataSource.olPerms.OLTeamPerms(root.id);
