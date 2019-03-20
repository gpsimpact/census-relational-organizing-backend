import { sq } from "../../db";

export default async () => {
  const result = await sq.from`teams`.return`count(*)`.one();
  return result.count;
};
