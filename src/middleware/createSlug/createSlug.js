import slugify from "slugify";

export default async (resolve, root, args, context, info) => {
  const transformedArgs = Object.assign({}, args);
  if (transformedArgs && transformedArgs.input && transformedArgs.input.name) {
    transformedArgs.input.slug = slugify(
      transformedArgs.input.name.toLowerCase()
    );
  }
  return resolve(root, transformedArgs, context, info);
};
