import { sq } from "../../db";

export default async (root, args, context) => {
  const result = await sq.from`targets`.return`count(*)`
    .where({ userId: context.user.id })
    .where({ teamId: args.teamId })
    .one();
  return result.count;
};
