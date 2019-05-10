export default (root, args, ctx) => {
  // return ctx.dataSource.user.me();
  if (ctx.user && ctx.user.id) {
    return ctx.dataSource.user.byIdLoader.load(ctx.user.id);
  }
  return null;
};
