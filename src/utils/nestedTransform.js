import flatten from "obj-flatten";
import { keys, endsWith, set, get } from "lodash";

export default (object, targetKey, transformFunction) => {
  const flatObject = flatten(object);
  keys(flatObject).forEach(key => {
    if (endsWith(key, `.${targetKey}`) || endsWith(key, `${targetKey}`)) {
      set(object, key, transformFunction(get(object, key)));
    }
  });
  return object;
};
