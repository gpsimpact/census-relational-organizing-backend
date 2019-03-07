import { map, groupBy } from "lodash";

export default cpermsArray => {
  const userGroupedPerms = groupBy(cpermsArray, "userId");
  const userMap = {};

  map(userGroupedPerms, (value, uId) => {
    const clientGroupedPerms = groupBy(value, "clientId");

    userMap[uId] = map(clientGroupedPerms, (verboseCp, clientId) => {
      return { clientId, permissions: map(verboseCp, cp => cp.permission) };
    });
  });
  return userMap;
};
