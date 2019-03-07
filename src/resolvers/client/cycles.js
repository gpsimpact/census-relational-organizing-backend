export default async (root, args, ctx) =>
  ctx.dataSource.cycle.byClientIdLoader.load(root.id);
