import { getManyHOR } from "@jakelowen/sqorn-graphql-filters";
import {
  makeDefaultState,
  permsToInt
} from "../../utils/permissions/permBitWise";

export default async (root, args, context, info) => {
  const perms = makeDefaultState();
  args.input.includePermissions.forEach(x => {
    perms[x] = true;
  });
  const permInt = permsToInt(perms);

  const dbHandle = context.sq.from`users`.where(
    context.sq
      .txt`(EXISTS (SELECT user_id FROM team_permissions_bit WHERE (permission | ${permInt} ) > 0 AND users.id = user_id))`
  );

  // console.log(await dbHandle);

  return getManyHOR(dbHandle)(root, args, context, info);
};
