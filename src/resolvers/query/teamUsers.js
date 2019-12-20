import { getManyHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context, info) => {
  // const perms = makeDefaultState();
  // args.input.includePermissions.forEach(x => {
  //   perms[x] = true;
  // });
  // const permInt = permsToInt(perms);

  const dbHandle = context.sq.from`users`.where(
    context.sq
      .txt`(EXISTS (SELECT user_id FROM team_permissions WHERE users.id = user_id and team_id = ${
      args.input.teamId
    }))`
  );

  // console.log(await dbHandle);

  return getManyHOR(dbHandle)(root, args, context, info);
};
