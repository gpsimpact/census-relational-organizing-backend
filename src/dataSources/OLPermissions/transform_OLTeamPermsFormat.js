import { map, groupBy } from "lodash";

export default tpermsArray => {
  const userGroupedPerms = groupBy(tpermsArray, "teamId");
  const userMap = {};

  map(userGroupedPerms, (value, uId) => {
    const teamGroupedPerms = groupBy(value, "userId");

    userMap[uId] = map(teamGroupedPerms, (verboseCp, userId) => {
      return { userId, permissions: map(verboseCp, cp => cp.permission) };
    });
  });
  return userMap;
};
