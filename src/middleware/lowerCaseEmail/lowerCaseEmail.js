import nestedTransform from "../../utils/nestedTransform";

export default async (resolve, root, args, context, info) => {
  const transformedArgs = nestedTransform(args, "email", x => x.toLowerCase());
  return resolve(root, transformedArgs, context, info);
};
