import { sq } from "../../db";

export default async () => {
  const result = await sq.from`team_permissions`.return`count(*)`
    .where({ permission: ["ADMIN", "MEMBER"] })
    .one();
  return result.count;
};
