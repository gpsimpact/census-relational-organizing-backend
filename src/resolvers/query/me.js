export default (root, args, ctx) => {
  return ctx.dataSource.user.me();
};
