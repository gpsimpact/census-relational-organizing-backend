export default (root, args, ctx) => {
  // return ctx.dataSource.user.me();
  return ctx.dataSource.user.byIdLoader.load(ctx.user.id);
};
