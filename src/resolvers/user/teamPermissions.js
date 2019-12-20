// import _ from "lodash";

export default async (root, args, ctx) => {
  const permData = await ctx.dataSource.teamPermission.byUserIdLoader.load(
    root.id
  );

  let teamPermissions = [];

  for (const pidx in permData) {
    const pd = permData[pidx];
    // const permObj = intToPerms(pd.permission);

    let permissions = [pd.permission];

    // for (const poIdx in permObj) {
    //   // console.log(permObj[poIdx], poIdx);
    //   if (permObj[poIdx]) {
    //     permissions.push(poIdx);
    //   }
    // }

    const team = await ctx.dataSource.team.byIdLoader.load(pd.teamId);
    // console.log({ team, permissions, pd });
    if (team.active) {
      teamPermissions.push({
        teamId: pd.teamId,
        permissions,
        acceptedTos: pd.acceptedTos
      });
    }
  }

  return teamPermissions;
};
// ctx.dataSource.olPerms.OLUserPerms(root.id);
