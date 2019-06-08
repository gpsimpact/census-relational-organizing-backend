import { sq } from "../../db";

export default async () => {
  const result = await sq.from`targets`
    .return`sum(household_size) as hh_sum`.one();
  return result.hhSum;
};
