export default async (root, args, context) => {
  return context.sq`gtibs`.where(args);
};
