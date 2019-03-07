import { map, groupBy } from "lodash";

export default cpermsArray => {
  const userGroupedPerms = groupBy(cpermsArray, "clientId");
  const userMap = {};

  map(userGroupedPerms, (value, uId) => {
    const clientGroupedPerms = groupBy(value, "userId");

    userMap[uId] = map(clientGroupedPerms, (verboseCp, userId) => {
      return { userId, permissions: map(verboseCp, cp => cp.permission) };
    });
  });
  return userMap;
};
