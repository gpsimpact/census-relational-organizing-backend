export default async (root, args, context) => {
  // const writeInput = Object.assign(
  //   {},
  //   { active: true, visible: true },
  //   args.input
  // );
  return context.sq`tibs`.where({ isGlobal: true }).where(args.input);
};
