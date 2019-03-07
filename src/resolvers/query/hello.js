export default (_, { name }) => {
  //   console.log(ctx.req.session);
  return `Hello ${name || "World"}`;
};
