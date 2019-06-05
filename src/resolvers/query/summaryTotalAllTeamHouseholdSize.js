import { sq } from "../../db";

export default async (root, args) => {
  const result = await sq.from`targets`.return`sum(household_size) as hh_sum`
    .where({ teamId: args.teamId })
    .one();
  return result.hhSum;
};
