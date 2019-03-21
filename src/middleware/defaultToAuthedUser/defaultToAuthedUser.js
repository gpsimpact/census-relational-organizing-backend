import _ from "lodash";
// import nestedTransform from "../../utils/nestedTransform";

export default async (resolve, root, args, context, info) => {
  const emptyVal = x => _.isUndefined(x) || _.isNull(x);
  const xFormFn = x => {
    if (emptyVal(x) && !emptyVal(context.req.session.userId)) {
      return context.req.session.userId;
    }
    return x;
  };
  const transformedArgs = Object.assign({}, args, { id: xFormFn(args.id) });
  return resolve(root, transformedArgs, context, info);
};
