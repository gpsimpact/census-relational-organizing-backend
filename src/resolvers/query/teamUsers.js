import { getManyHOR } from "@jakelowen/sqorn-graphql-filters";

export default async (root, args, context, info) => {
  let dbHandle;

  if (
    args.input &&
    args.input.includePermissions &&
    args.input.includePermissions.length === 1
  ) {
    dbHandle = context.sq.from`users`.where(
      context.sq
        .txt`(EXISTS (SELECT user_id FROM team_permissions WHERE users.id = user_id and team_id = ${
        args.input.teamId
      } and permission = ${args.input.includePermissions[0]} LIMIT 1))`
    );
  } else {
    dbHandle = context.sq.from`users`.where(
      context.sq
        .txt`(EXISTS (SELECT user_id FROM team_permissions WHERE users.id = user_id and team_id = ${
        args.input.teamId
      } and permission IN ${context.sq.txt(
        ...args.input.includePermissions
      )} LIMIT 1))`
    );
  }

  return getManyHOR(dbHandle)(root, args, context, info);
};
