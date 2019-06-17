import _ from "lodash";
// import nestedTransform from "../../utils/nestedTransform";

export default argsVarName => async (resolve, root, args, context, info) => {
  const emptyVal = x => _.isUndefined(x) || _.isNull(x);
  const xFormFn = x => {
    if (emptyVal(x) && !emptyVal(context.user.id)) {
      return context.user.id;
    }
    return x;
  };

  const transformedArgs = Object.assign({}, args, {
    [argsVarName]: xFormFn(_.get(args, argsVarName))
  });

  return resolve(root, transformedArgs, context, info);
};
