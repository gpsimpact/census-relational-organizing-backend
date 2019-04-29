export default async (root, args, context) => {
  return context.sq`ttibs`.where(args.input);
};
