import { sq } from "../../db";

export default async () => {
  const result = await sq.from`targets`.return`count(*)`.one();
  return result.count;
};
