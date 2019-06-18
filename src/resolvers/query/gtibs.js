export default async (root, args, context) => {
  return context.sq`tibs`.where({ isGlobal: true }).where(args);
};
