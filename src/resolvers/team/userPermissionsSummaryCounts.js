import _ from "lodash";
// import {
//   makeDefaultState,
//   intToPerms
// } from "../../utils/permissions/permBitWise";
export default async (root, args, ctx) => {
  const data = await ctx.dataSource.teamPermission.byTeamIdLoader.load(root.id);

  const counts = {
    APPLICANT: 0,
    TRAINING: 0,
    ELEVATED: 0,
    MEMBER: 0,
    ADMIN: 0,
    DENIED: 0
  };

  // for (const dcIdx in counts) {
  //   counts[dcIdx] = 0;
  // }

  for (const dataIdx in data) {
    const dp = data[dataIdx];
    counts[dp.permission]++;
    // const permObj = intToPerms(dp.permission);
    // for (const pIdx in permObj) {
    //   if (permObj[pIdx] === true) {
    //     counts[pIdx]++;
    //   }
    // }
  }

  return _(counts)
    .map((v, k) => ({ permission: k, count: v }))
    .value();
};
