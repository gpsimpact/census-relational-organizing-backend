import { map, groupBy } from "lodash";

export default tpermsArray => {
  const userGroupedPerms = groupBy(tpermsArray, "userId");
  const userMap = {};

  map(userGroupedPerms, (value, uId) => {
    const teamGroupedPerms = groupBy(value, "teamId");

    userMap[uId] = map(teamGroupedPerms, (verboseCp, teamId) => {
      return { teamId, permissions: map(verboseCp, cp => cp.permission) };
    });
  });
  return userMap;
};
