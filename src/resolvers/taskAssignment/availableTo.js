import _ from "lodash";
import { intToPerms } from "../../utils/permissions/permBitWise";

export default root => {
  const perms = intToPerms(root.taskRequiredRoles || 0);
  return _.map(perms, (v, k) => {
    return { role: k, available: v };
  });
};
