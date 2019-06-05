import { sq } from "../../db";

export default async (root, args) => {
  const result = await sq.from`targets`.return`count(*)`
    .where({ teamId: args.teamId })
    .one();
  return result.count;
};
